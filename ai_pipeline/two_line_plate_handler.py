import re
from typing import List, Optional, Tuple


class TwoLinePlateHandler:
    """
    Handles two-line (stacked) Indian license plates commonly found on:
      - Two-Wheelers & Motorcycles: Top 'TN 14', Bottom 'A 2374' -> 'TN-14-A-2374'
      - Commercial Trucks & Autos: Top 'DL 1L', Bottom 'AA 1234' -> 'DL-01-L-1234'
    """

    @classmethod
    def is_two_line_plate(cls, text_tokens: List[str]) -> bool:
        """Determines if the extracted tokens represent a multi-line plate."""
        if len(text_tokens) >= 2:
            return True
        return False

    @classmethod
    def assemble_two_line_tokens(cls, tokens: List[str]) -> str:
        """
        Merges top-line (State + RTO) and bottom-line (Series + Number) tokens.
        """
        if not tokens:
            return ""

        if len(tokens) == 1:
            return tokens[0]

        # Top line usually contains State code (2 letters) + RTO digits (2 digits)
        # Bottom line contains Series letters (1-3 letters) + Number digits (4 digits)
        top_line = tokens[0].strip()
        bottom_line = " ".join(tokens[1:]).strip()

        combined = f"{top_line} {bottom_line}"
        return combined
