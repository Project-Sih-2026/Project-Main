import cv2
import numpy as np


class PlateSuperResolution:
    """
    Super-Resolution and Sharpening Engine for Distant / Low-Resolution License Plates.
    Converts small 40-80px distant plate crops into crisp 200-300px character streams.
    """

    @staticmethod
    def unsharp_mask(image: np.ndarray, kernel_size: tuple = (5, 5), sigma: float = 1.0, amount: float = 1.5, threshold: int = 0) -> np.ndarray:
        """Sharpen image using unsharp masking to define character edges against dirty background."""
        blurred = cv2.GaussianBlur(image, kernel_size, sigma)
        sharpened = float(amount + 1) * image - float(amount) * blurred
        sharpened = np.maximum(sharpened, np.zeros(sharpened.shape))
        sharpened = np.minimum(sharpened, 255 * np.ones(sharpened.shape))
        sharpened = sharpened.round().astype(np.uint8)
        if threshold > 0:
            low_contrast_mask = np.absolute(image - blurred) < threshold
            np.copyto(sharpened, image, where=low_contrast_mask)
        return sharpened

    @classmethod
    def enhance_low_res_plate(cls, plate_crop: np.ndarray, target_height: int = 120) -> np.ndarray:
        """
        Multi-stage super-resolution enhancement:
        1. Aspect-Ratio Preserving Cubic Upscaling
        2. Bilateral Edge-Preserving Denoising
        3. Local Contrast CLAHE Normalization
        4. Unsharp Mask Character Edge Accentuation
        """
        if plate_crop is None or plate_crop.size == 0:
            return plate_crop

        h, w = plate_crop.shape[:2]
        if h == 0 or w == 0:
            return plate_crop

        # Scale factor
        scale = max(2.0, target_height / float(h))
        target_w = int(w * scale)
        target_h = int(h * scale)

        # 1. Bicubic Interpolation with Lanczos resampling
        upscaled = cv2.resize(plate_crop, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

        # 2. Bilateral filter to smooth grain while preserving sharp edges
        if len(upscaled.shape) == 3:
            filtered = cv2.bilateralFilter(upscaled, d=7, sigmaColor=50, sigmaSpace=50)
        else:
            filtered = cv2.bilateralFilter(upscaled, d=7, sigmaColor=50, sigmaSpace=50)

        # 3. CLAHE Contrast Normalization
        if len(filtered.shape) == 3:
            lab = cv2.cvtColor(filtered, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(6, 6))
            cl = clahe.apply(l)
            limg = cv2.merge((cl, a, b))
            enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        else:
            clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(6, 6))
            enhanced = clahe.apply(filtered)

        # 4. Unsharp Masking for character stroke clarity
        sharpened = cls.unsharp_mask(enhanced, amount=1.6)

        return sharpened
