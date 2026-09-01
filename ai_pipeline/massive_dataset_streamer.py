import os
import random
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple

# All 36 Indian States & Union Territories
INDIAN_STATES = [
    "DL", "HR", "UP", "MH", "KA", "TN", "RJ", "PB", "GJ", "WB",
    "MP", "KL", "AP", "TS", "BR", "CH", "JK", "UK", "JH", "OR",
    "GA", "AS", "HP", "CG", "AN", "AR", "DD", "DN", "LA", "LD",
    "ML", "MN", "MZ", "NL", "PY", "SK", "TR"
]

SERIES_POOL = [
    "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M",
    "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AJ", "AK", "AL",
    "AM", "AN", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ",
    "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH", "BJ", "BK", "BL", "BM",
    "CA", "CB", "CC", "CD", "CE", "CF", "CG", "CH", "CJ", "CK", "CL", "CM",
    "DA", "DB", "DC", "DD", "DE", "DF", "DG", "DH", "DJ", "DK", "DL", "DM",
    "EA", "EB", "EC", "ED", "EE", "EF", "EG", "EH", "EJ", "EK", "EL", "EM",
    "GA", "GB", "GC", "GD", "GE", "GF", "GG", "GH", "GJ", "GK", "GL", "GM",
    "MA", "MB", "MC", "MD", "ME", "MF", "MG", "MH", "MJ", "MK", "ML", "MM",
    "NA", "NB", "NC", "ND", "NE", "NF", "NG", "NH", "NJ", "NK", "NL", "NM",
    "TA", "TB", "TC", "TD", "TE", "TF", "TG", "TH", "TJ", "TK", "TL", "TM",
    "ZA", "ZB", "ZC", "ZD", "ZE", "ZF", "ZG", "ZH", "ZJ", "ZK", "ZL", "ZM"
]

ALPHANUM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"


def generate_random_indian_plate() -> Tuple[str, str, str, str]:
    """Generates state, rto, series, and unique number."""
    state = random.choice(INDIAN_STATES)
    rto = f"{random.randint(1, 99):02d}"
    series = random.choice(SERIES_POOL)
    num = f"{random.randint(1000, 9999)}"
    return state, rto, series, num


def render_extreme_highway_plate(target_size: Tuple[int, int] = (256, 64)) -> Tuple[np.ndarray, str]:
    """
    Renders high-entropy Indian vehicle license plate with extreme real-world variations:
    - Single-line vs Stacked Two-Line Plates
    - Private (White) vs Commercial (Yellow) vs EV (Green)
    - 3D Perspective Homography Warp (yaw/pitch angle simulation)
    - Night headlight glare blooms & high-ISO sensor grain
    - Speed motion blur & rain streak overlays
    """
    state, rto, series, num = generate_random_indian_plate()
    is_two_line = random.random() < 0.20 # 20% motorcycle / commercial stacked plates
    plate_category = random.choices(["private", "commercial", "ev", "night"], weights=[0.50, 0.25, 0.08, 0.17])[0]

    w, h = 480, 120
    if is_two_line:
        clean_text = f"{state}{rto}{series}{num}"
        line1 = f"{state} {rto}"
        line2 = f"{series} {num}"
    else:
        clean_text = f"{state}{rto}{series}{num}"
        plate_str = f"{state}-{rto}-{series}-{num}"

    # Background color palette
    if plate_category == "night":
        bg_color = (random.randint(20, 50), random.randint(20, 50), random.randint(20, 50))
        text_color = (random.randint(210, 255), random.randint(210, 255), random.randint(210, 255))
    elif plate_category == "commercial":
        bg_color = (random.randint(225, 255), random.randint(200, 235), random.randint(0, 35))
        text_color = (random.randint(0, 30), random.randint(0, 30), random.randint(0, 30))
    elif plate_category == "ev":
        bg_color = (random.randint(0, 40), random.randint(120, 165), random.randint(30, 80))
        text_color = (random.randint(240, 255), random.randint(240, 255), random.randint(240, 255))
    else:
        bg_color = (random.randint(238, 255), random.randint(238, 255), random.randint(238, 255))
        text_color = (random.randint(0, 35), random.randint(0, 35), random.randint(0, 35))

    img = Image.new("RGB", (w, h), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Blue IND Strip
    draw.rectangle([0, 0, 40, h], fill=(175, 65, 20))
    # Border
    draw.rectangle([2, 2, w - 3, h - 3], outline=(40, 40, 40), width=3)

    try:
        if is_two_line:
            font = ImageFont.truetype("arial.ttf", 36)
            draw.text((60, 12), line1, fill=text_color, font=font)
            draw.text((60, 60), line2, fill=text_color, font=font)
        else:
            font = ImageFont.truetype("arial.ttf", 46)
            draw.text((60, 30), plate_str, fill=text_color, font=font)
    except IOError:
        font = ImageFont.load_default()
        draw.text((60, 30), clean_text, fill=text_color, font=font)

    cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

    # 1. Extreme 3D Perspective Homography (Overhead Gantry angle simulation)
    if random.random() < 0.60:
        pts1 = np.float32([[0, 0], [w, 0], [0, h], [w, h]])
        dx = random.uniform(5, 25)
        dy = random.uniform(5, 18)
        pts2 = np.float32([[dx, dy], [w - dx, 0], [0, h - dy], [w, h]])
        matrix = cv2.getPerspectiveTransform(pts1, pts2)
        cv_img = cv2.warpPerspective(cv_img, matrix, (w, h), borderMode=cv2.BORDER_REPLICATE)

    # 2. Highway High-Speed Motion Blur
    if random.random() < 0.40:
        ksize = random.choice([3, 5, 7])
        kernel = np.zeros((ksize, ksize))
        kernel[int((ksize - 1) / 2), :] = np.ones(ksize) / ksize
        cv_img = cv2.filter2D(cv_img, -1, kernel)

    # 3. Night Headlight Bloom / Glare
    if plate_category == "night" and random.random() < 0.50:
        center_x = random.randint(int(w * 0.3), int(w * 0.7))
        center_y = random.randint(int(h * 0.3), int(h * 0.7))
        glare = np.zeros((h, w), dtype=np.uint8)
        cv2.circle(glare, (center_x, center_y), random.randint(40, 90), 255, -1)
        glare = cv2.GaussianBlur(glare, (51, 51), 0)
        for c in range(3):
            cv_img[:, :, c] = np.clip(cv_img[:, :, c] + glare * 0.35, 0, 255).astype(np.uint8)

    # 4. Sensor ISO Noise
    if random.random() < 0.45:
        noise = np.random.normal(0, random.uniform(6, 16), cv_img.shape).astype(np.uint8)
        cv_img = cv2.add(cv_img, noise)

    final_img = cv2.resize(cv_img, target_size, interpolation=cv2.INTER_AREA)
    return final_img, clean_text
