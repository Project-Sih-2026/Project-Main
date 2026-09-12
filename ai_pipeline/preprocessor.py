import cv2
import numpy as np


class PlatePreprocessor:
    """
    Image preprocessing and enhancement pipeline for Indian License Plates.
    Handles contrast enhancement (CLAHE), noise reduction, deskewing, and binarization.
    """

    @staticmethod
    def enhance_contrast_clahe(img: np.ndarray) -> np.ndarray:
        """Apply Contrast Limited Adaptive Histogram Equalization for shadowed/glare plates."""
        if len(img.shape) == 3:
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            limg = cv2.merge((cl, a, b))
            return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        else:
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            return clahe.apply(img)

    @staticmethod
    def deskew_plate(img: np.ndarray) -> np.ndarray:
        """Detect orientation angle and rotate plate so characters are upright."""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=40, minLineLength=30, maxLineGap=10)

        if lines is None:
            return img

        angles = []
        for line in lines:
            pts = line[0] if len(line.shape) > 1 and line.shape[0] == 1 else line
            if len(pts) == 4:
                x1, y1, x2, y2 = pts
                angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
                if -45 < angle < 45 and abs(angle) > 1.0:
                    angles.append(angle)

        if not angles:
            return img

        median_angle = float(np.median(angles))
        (h, w) = img.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
        rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated

    @staticmethod
    def preprocess_plate(img: np.ndarray) -> np.ndarray:
        """
        Standard license plate preprocessing pipeline:
        1. Grayscale
        2. Histogram Equalization
        3. Gaussian Blur
        4. Sharpening
        """
        if img is None or img.size == 0:
            return img

        # 1. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img.copy()

        # 2. Histogram Equalization
        equalized = cv2.equalizeHist(gray)

        # 3. Gaussian Blur
        blurred = cv2.GaussianBlur(equalized, (3, 3), 0)

        # 4. Sharpening
        sharp_kernel = np.array([[0, -1, 0],
                                 [-1, 5, -1],
                                 [0, -1, 0]], dtype=np.float32)
        sharpened = cv2.filter2D(blurred, -1, sharp_kernel)
        return sharpened

    @staticmethod
    def clean_plate_for_ocr(img: np.ndarray) -> np.ndarray:
        """Full enhancement pipeline: Resize -> CLAHE -> Deskew -> Preprocess."""
        h, w = img.shape[:2]
        target_h = 120
        target_w = int(w * (target_h / h))
        resized = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_CUBIC)

        # 1. CLAHE Contrast Normalization
        enhanced = PlatePreprocessor.enhance_contrast_clahe(resized)

        # 2. Deskew
        deskewed = PlatePreprocessor.deskew_plate(enhanced)

        # 3. Preprocessing (Grayscale, Histogram Equalization, Gaussian Blur, Sharpening)
        return PlatePreprocessor.preprocess_plate(deskewed)

