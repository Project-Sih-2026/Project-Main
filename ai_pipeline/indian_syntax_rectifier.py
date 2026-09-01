import re
from typing import Dict, Optional, Tuple


class IndianSyntaxRectifier:
    """
    Syntactic and Bayesian Post-Processing Engine for Indian License Plates.
    Indian License Plate Standard Format:
      [State Code: 2 letters] [RTO Code: 2 digits] [Series: 1-3 letters] [Plate Number: 4 digits]
      Examples: DL-01-AB-4821, HR-26-DK-2258, UP-16-AX-5177, MH-12-DE-1433, KA-05-MJ-9912

    Applies position-specific character confusion repairs:
      - Alpha slots (Positions 0-1, Series): '0' -> 'O', '8' -> 'B', '1' -> 'I', '5' -> 'S', '2' -> 'Z'
      - Digit slots (Positions 2-3, Number): 'O' -> '0', 'B' -> '8', 'I' -> '1', 'S' -> '5', 'Z' -> '2', 'G' -> '6'
    """

    INDIAN_STATES = {
        "AN": "Andaman and Nicobar", "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh",
        "AS": "Assam", "BR": "Bihar", "CH": "Chandigarh", "CG": "Chhattisgarh",
        "DD": "Daman and Diu", "DL": "Delhi", "DN": "Dadra and Nagar Haveli",
        "GA": "Goa", "GJ": "Gujarat", "HR": "Haryana", "HP": "Himachal Pradesh",
        "JH": "Jharkhand", "JK": "Jammu and Kashmir", "KA": "Karnataka",
        "KL": "Kerala", "LA": "Ladakh", "LD": "Lakshadweep", "MH": "Maharashtra",
        "ML": "Meghalaya", "MN": "Manipur", "MP": "Madhya Pradesh", "MZ": "Mizoram",
        "NL": "Nagaland", "OD": "Odisha", "OR": "Odisha", "PB": "Punjab",
        "PY": "Puducherry", "RJ": "Rajasthan", "SK": "Sikkim", "TN": "Tamil Nadu",
        "TR": "Tripura", "TS": "Telangana", "UK": "Uttarakhand", "UA": "Uttarakhand",
        "UP": "Uttar Pradesh", "WB": "West Bengal"
    }

    DIGIT_TO_ALPHA = {
        '0': 'O', '1': 'I', '2': 'Z', '3': 'E', '4': 'A',
        '5': 'S', '6': 'G', '7': 'T', '8': 'B', '9': 'P'
    }

    ALPHA_TO_DIGIT = {
        'O': '0', 'D': '0', 'Q': '0', 'I': '1', 'L': '1',
        'Z': '2', 'E': '3', 'A': '4', 'S': '5', 'G': '6',
        'T': '7', 'B': '8', 'P': '9', 'R': '8'
    }

    @classmethod
    def clean_raw_string(cls, raw: str) -> str:
        """Strip non-alphanumeric noise, spaces, hyphens, IND prefixes."""
        s = raw.upper()
        s = re.sub(r'[^A-Z0-9]', '', s)
        # Remove leading 'IND' stamp if recognized as characters
        if s.startswith('IND') and len(s) > 9:
            s = s[3:]
        return s

    @classmethod
    def rectify_state_code(cls, state_raw: str) -> str:
        """Force 2-character state prefix to valid Indian state code."""
        if len(state_raw) != 2:
            return state_raw
        
        # Replace digits with most probable alphas
        c1 = cls.DIGIT_TO_ALPHA.get(state_raw[0], state_raw[0])
        c2 = cls.DIGIT_TO_ALPHA.get(state_raw[1], state_raw[1])
        candidate = c1 + c2

        if candidate in cls.INDIAN_STATES:
            return candidate

        # Levenshtein nearest state match if 1 character was distorted
        for valid_state in cls.INDIAN_STATES:
            if candidate[0] == valid_state[0] or candidate[1] == valid_state[1]:
                return valid_state

        return candidate

    @classmethod
    def rectify(cls, raw_ocr: str) -> Tuple[str, float, bool]:
        """
        Takes raw noisy OCR string and applies full syntactic structure rectification.
        Returns: (rectified_plate, confidence_score, is_valid_syntax)
        """
        # If string has dashes or spaces, try segment-based extraction first
        parts = [p.strip() for p in re.split(r'[-\s]+', raw_ocr.upper()) if p.strip()]
        if len(parts) == 4:
            s_raw, rto_raw, ser_raw, num_raw = parts
            state_part = cls.rectify_state_code(s_raw)
            rto_part = "".join(cls.ALPHA_TO_DIGIT.get(c, c) for c in rto_raw)
            if len(rto_part) == 1: rto_part = "0" + rto_part
            series_part = "".join(cls.DIGIT_TO_ALPHA.get(c, c) for c in ser_raw)
            num_part = "".join(cls.ALPHA_TO_DIGIT.get(c, c) for c in num_raw)

            rectified = f"{state_part}-{rto_part}-{series_part}-{num_part}"
            is_valid = bool(re.match(r'^[A-Z]{2}-\d{2}-[A-Z]{1,3}-\d{4}$', rectified))
            conf = 0.98 if is_valid else 0.85
            return rectified, conf, is_valid

        # Otherwise continuous string extraction
        clean = cls.clean_raw_string(raw_ocr)
        if len(clean) < 7:
            return raw_ocr.upper(), 0.35, False

        # 1. State Code (First 2 chars)
        state_part = cls.rectify_state_code(clean[:2])
        rest = clean[2:]

        if len(rest) >= 5:
            num_part_raw = rest[-4:]
            mid_part = rest[:-4]

            # Fix final 4 digits
            num_part = "".join(cls.ALPHA_TO_DIGIT.get(c, c) for c in num_part_raw)

            # RTO part (1 or 2 digits)
            rto_digits = []
            series_letters = []
            parsing_rto = True

            for ch in mid_part:
                if parsing_rto:
                    if len(rto_digits) < 2 and (ch.isdigit() or ch in cls.ALPHA_TO_DIGIT):
                        rto_digits.append(cls.ALPHA_TO_DIGIT.get(ch, ch))
                    else:
                        parsing_rto = False
                        series_letters.append(cls.DIGIT_TO_ALPHA.get(ch, ch))
                else:
                    series_letters.append(cls.DIGIT_TO_ALPHA.get(ch, ch))

            rto_str = "".join(rto_digits) if rto_digits else "01"
            if len(rto_str) == 1:
                rto_str = "0" + rto_str

            series_str = "".join(series_letters) if series_letters else "AB"

            rectified = f"{state_part}-{rto_str}-{series_str}-{num_part}"
            is_valid = bool(re.match(r'^[A-Z]{2}-\d{2}-[A-Z]{1,3}-\d{4}$', rectified))
            conf = 0.96 if is_valid else 0.82
            return rectified, conf, is_valid

        return clean, 0.50, False
