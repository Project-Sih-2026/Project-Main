import os
import random
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import List, Tuple

# All 36 Indian States & UTs
INDIAN_STATES = [
    "DL", "HR", "UP", "MH", "KA", "TN", "RJ", "PB", "GJ", "WB",
    "MP", "KL", "AP", "TS", "BR", "CH", "JK", "UK", "JH", "OR",
    "GA", "AS", "HP", "CG", "AN", "AR", "DD", "DN", "LA", "LD",
    "ML", "MN", "MZ", "NL", "PY", "SK", "TR"
]

SERIES_LETTERS = [
    "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M",
    "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AJ", "AK", "AL", "AM",
    "AN", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ",
    "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH", "BJ", "BK", "BL", "BM",
    "CA", "CB", "CC", "CD", "CE", "CF", "CG", "CH", "CJ", "CK", "CL", "CM",
    "DA", "DB", "DC", "DD", "DE", "DF", "DG", "DH", "DJ", "DK", "DL", "DM",
    "EA", "EB", "EC", "ED", "EE", "EF", "EG", "EH", "EJ", "EK", "EL", "EM",
    "NA", "NB", "NC", "ND", "NE", "NF", "NG", "NH", "NJ", "NK", "NL", "NM",
    "TA", "TB", "TC", "TD", "TE", "TF", "TG", "TH", "TJ", "TK", "TL", "TM",
    "ZA", "ZB", "ZC", "ZD", "ZE", "ZF", "ZG", "ZH", "ZJ", "ZK", "ZL", "ZM"
]

ALPHANUM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def generate_random_indian_plate_text() -> str:
    """Generates authentic Indian license plate format string."""
    state = random.choice(INDIAN_STATES)
    rto = f"{random.randint(1, 99):02d}"
    series = random.choice(SERIES_LETTERS)
    num = f"{random.randint(1000, 9999)}"
    return f"{state}-{rto}-{series}-{num}"


def render_augmented_plate_image(plate_text: str, target_size: Tuple[int, int] = (256, 64)) -> Tuple[np.ndarray, str]:
    """
    Renders high-security Indian license plate with realistic road camera augmentations:
    - Random skew (-18° to +18°)
    - Gaussian noise & road grain
    - Random shadow gradients & night mode
    - Motion blur & contrast adjustments
    """
    w, h = 400, 100
    is_dark = random.random() < 0.25
    is_commercial = random.random() < 0.15

    # Background color (White private, Yellow commercial, Dark night)
    if is_dark:
        bg_color = (random.randint(15, 45), random.randint(15, 45), random.randint(15, 45))
        text_color = (random.randint(200, 255), random.randint(200, 255), random.randint(200, 255))
    elif is_commercial:
        bg_color = (random.randint(220, 255), random.randint(200, 235), random.randint(0, 40)) # Yellow
        text_color = (random.randint(0, 30), random.randint(0, 30), random.randint(0, 30))
    else:
        bg_color = (random.randint(235, 255), random.randint(235, 255), random.randint(235, 255)) # White
        text_color = (random.randint(0, 35), random.randint(0, 35), random.randint(0, 35))

    img = Image.new("RGB", (w, h), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Blue IND emblem band on left
    draw.rectangle([0, 0, 35, h], fill=(175, 65, 20))

    # Border
    border_color = (120, 120, 120) if is_dark else (40, 40, 40)
    draw.rectangle([2, 2, w - 3, h - 3], outline=border_color, width=2)

    # Font
    try:
        font = ImageFont.truetype("arial.ttf", random.randint(38, 42))
    except IOError:
        font = ImageFont.load_default()

    draw.text((55, 26), plate_text, fill=text_color, font=font)

    # Convert to OpenCV format
    cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # 1. Random Perspective / Skew Rotation
    skew_angle = random.uniform(-15.0, 15.0)
    if abs(skew_angle) > 1.0:
        M = cv2.getRotationMatrix2D((w // 2, h // 2), skew_angle, 1.0)
        cv_img = cv2.warpAffine(cv_img, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

    # 2. Random Motion Blur
    if random.random() < 0.35:
        ksize = random.choice([3, 5])
        kernel = np.zeros((ksize, ksize))
        kernel[int((ksize - 1) / 2), :] = np.ones(ksize)
        kernel /= ksize
        cv_img = cv2.filter2D(cv_img, -1, kernel)

    # 3. Random Gaussian Sensor Noise
    if random.random() < 0.40:
        noise = np.random.normal(0, random.uniform(5, 15), cv_img.shape).astype(np.uint8)
        cv_img = cv2.add(cv_img, noise)

    # 4. Random Shadow Gradient Overlay
    if random.random() < 0.30:
        shadow_mask = np.tile(np.linspace(0.6, 1.0, w), (h, 1))
        for c in range(3):
            cv_img[:, :, c] = np.clip(cv_img[:, :, c] * shadow_mask, 0, 255).astype(np.uint8)

    # Final resize to standard network input size (256x64)
    final_img = cv2.resize(cv_img, target_size, interpolation=cv2.INTER_AREA)

    return final_img, plate_text
