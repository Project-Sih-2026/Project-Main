import cv2
import numpy as np
from typing import Dict, Tuple


class VehicleClassifier:
    """
    Vehicle Type, Dominant Color, and Plate Class Extractor.
    Extracts high-level attributes to support Vehicle Re-Identification (Re-ID) and search queries.
    """

    COLOR_RANGES = {
        "White": ([0, 0, 180], [180, 40, 255]),
        "Black": ([0, 0, 0], [180, 255, 55]),
        "Silver/Grey": ([0, 0, 56], [180, 40, 179]),
        "Red": ([0, 100, 100], [10, 255, 255]),
        "Blue": ([100, 100, 100], [130, 255, 255]),
        "Yellow": ([20, 100, 100], [35, 255, 255]),
        "Green": ([36, 100, 100], [86, 255, 255]),
    }

    @classmethod
    def detect_dominant_color(cls, vehicle_crop: np.ndarray) -> str:
        """Detects the primary body paint color of the vehicle."""
        if vehicle_crop is None or vehicle_crop.size == 0:
            return "Unknown"

        # Center sample area of the vehicle hood / body
        h, w = vehicle_crop.shape[:2]
        center_crop = vehicle_crop[int(h * 0.25):int(h * 0.75), int(w * 0.25):int(w * 0.75)]
        if center_crop.size == 0:
            return "Silver/Grey"

        hsv = cv2.cvtColor(center_crop, cv2.COLOR_BGR2HSV)
        max_pixels = 0
        dominant = "White"

        for color_name, (lower, upper) in cls.COLOR_RANGES.items():
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            count = cv2.countNonZero(mask)
            if count > max_pixels:
                max_pixels = count
                dominant = color_name

        return dominant

    @classmethod
    def classify_plate_type(cls, plate_crop: np.ndarray) -> str:
        """
        Classifies Indian license plate category:
        - Private Vehicle: White background, Black text
        - Commercial / Transport: Yellow background, Black text
        - Electric Vehicle (EV): Green background, White text
        - Commercial Rental / Self-Drive: Black background, Yellow text
        """
        if plate_crop is None or plate_crop.size == 0:
            return "Private (White)"

        hsv = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2HSV)

        # Check Yellow (Commercial)
        yellow_mask = cv2.inRange(hsv, np.array([18, 90, 90]), np.array([35, 255, 255]))
        yellow_ratio = cv2.countNonZero(yellow_mask) / float(plate_crop.shape[0] * plate_crop.shape[1])

        # Check Green (EV)
        green_mask = cv2.inRange(hsv, np.array([36, 80, 80]), np.array([85, 255, 255]))
        green_ratio = cv2.countNonZero(green_mask) / float(plate_crop.shape[0] * plate_crop.shape[1])

        if yellow_ratio > 0.30:
            return "Commercial Transport (Yellow)"
        elif green_ratio > 0.25:
            return "Electric Vehicle (Green)"
        else:
            return "Private Vehicle (White)"

    @classmethod
    def infer_vehicle_attributes(cls, vehicle_crop: np.ndarray, plate_crop: np.ndarray = None) -> Dict:
        """Returns full vehicle visual profile for search queries & re-ID."""
        color = cls.detect_dominant_color(vehicle_crop)
        plate_type = cls.classify_plate_type(plate_crop) if plate_crop is not None else "Private (White)"

        # Infer class from aspect ratio of vehicle box
        h, w = vehicle_crop.shape[:2] if vehicle_crop is not None and vehicle_crop.size > 0 else (100, 100)
        aspect = w / float(h)

        if aspect < 0.85:
            veh_class = "Two-Wheeler / Motorcycle"
        elif aspect > 1.6 and h > 200:
            veh_class = "Heavy Commercial Truck / Bus"
        elif aspect > 1.15:
            veh_class = "SUV / Sedan"
        else:
            veh_class = "Hatchback / Auto-Rickshaw"

        return {
            "vehicle_class": veh_class,
            "body_color": color,
            "plate_category": plate_type,
            "is_commercial": "Commercial" in plate_type
        }
