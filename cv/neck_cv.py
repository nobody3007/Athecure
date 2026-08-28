import math
import time
from collections import deque

import cv2
import mediapipe as mp
import numpy as np


class NeckTiltAnalyzer:

    def __init__(self):

        self.BaseOptions = mp.tasks.BaseOptions
        self.PoseLandmarker = mp.tasks.vision.PoseLandmarker
        self.PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions

        self.model_path = "pose_landmarker.task"

        options = self.PoseLandmarkerOptions(
            base_options=self.BaseOptions(
                model_asset_path=self.model_path
            ),
            running_mode=mp.tasks.vision.RunningMode.IMAGE,
            num_poses=1
        )

        self.landmarker = self.PoseLandmarker.create_from_options(
            options
        )

        # --------------------------
        # Rep state
        # --------------------------

        self.reps = 0
        self.current_side = "neutral"

        # --------------------------
        # Smoothing
        # --------------------------

        self.angle_history = deque(maxlen=5)

        # --------------------------
        # Previous frame
        # --------------------------

        self.previous_angle = 0
        self.previous_time = time.time()

        # --------------------------
        # Thresholds
        # --------------------------

        self.TILT_THRESHOLD = 12
        self.NEUTRAL_THRESHOLD = 7

        # Used for suggestions
        self.MAX_SAFE_ANGLE = 35

    # ==========================================
    # ANGLE
    # ==========================================

    def calculate_angle(self, a, b, c):

        a = np.array(a)
        b = np.array(b)
        c = np.array(c)

        radians = (
            np.arctan2(c[1] - b[1], c[0] - b[0])
            -
            np.arctan2(a[1] - b[1], a[0] - b[0])
        )

        angle = abs(
            radians * 180.0 / np.pi
        )

        if angle > 180:
            angle = 360 - angle

        return angle

    # ==========================================
    # SIGNED LEFT / RIGHT TILT
    # ==========================================

    def calculate_tilt_direction(self, nose, shoulder_mid):

        dx = nose[0] - shoulder_mid[0]
        dy = nose[1] - shoulder_mid[1]

        # Vertical axis points upward in image space
        angle = math.degrees(
            math.atan2(dx, -dy)
        )

        return angle

    # ==========================================
    # PROCESS FRAME
    # ==========================================

    def process_frame(self, frame):

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        result = self.landmarker.detect(mp_image)

        if not result.pose_landmarks:

            return {
                "detected": False,
                "reps": self.reps,
                "angle": 0,
                "direction": "unknown",
                "command": "Move into camera view",
                "formScore": 0,
                "thrust": 0,
                "suggestions": [
                    "Make sure your head and shoulders are visible"
                ]
            }

        landmarks = result.pose_landmarks[0]

        # ======================================
        # CHECK VISIBILITY
        # ======================================

        important_points = [
            landmarks[0],   # nose
            landmarks[11],  # left shoulder
            landmarks[12],  # right shoulder
        ]

        if any(
            point.visibility < 0.3
            for point in important_points
        ):

            return {
                "detected": False,
                "reps": self.reps,
                "angle": 0,
                "direction": "unknown",
                "command": "Adjust your position",
                "formScore": 0,
                "thrust": 0,
                "suggestions": [
                    "Keep your full upper body visible"
                ]
            }

        # ======================================
        # LANDMARKS
        # ======================================

        nose = [
            landmarks[0].x,
            landmarks[0].y
        ]

        left_shoulder = [
            landmarks[11].x,
            landmarks[11].y
        ]

        right_shoulder = [
            landmarks[12].x,
            landmarks[12].y
        ]

        left_hip = [
            landmarks[23].x,
            landmarks[23].y
        ]

        right_hip = [
            landmarks[24].x,
            landmarks[24].y
        ]

        # ======================================
        # MIDPOINTS
        # ======================================

        shoulder_mid = [
            (left_shoulder[0] + right_shoulder[0]) / 2,
            (left_shoulder[1] + right_shoulder[1]) / 2
        ]

        hip_mid = [
            (left_hip[0] + right_hip[0]) / 2,
            (left_hip[1] + right_hip[1]) / 2
        ]

        # ======================================
        # ORIGINAL NECK ANGLE
        # ======================================

        neck_angle = self.calculate_angle(
            nose,
            shoulder_mid,
            hip_mid
        )

        stretch_deviation = abs(
            180 - neck_angle
        )

        # ======================================
        # SIGNED LEFT / RIGHT ANGLE
        # ======================================

        tilt_angle = self.calculate_tilt_direction(
            nose,
            shoulder_mid
        )

        # Smooth angle

        self.angle_history.append(
            tilt_angle
        )

        smooth_angle = sum(
            self.angle_history
        ) / len(self.angle_history)

        # ======================================
        # DIRECTION
        # ======================================

        if smooth_angle > self.TILT_THRESHOLD:

            direction = "right"

        elif smooth_angle < -self.TILT_THRESHOLD:

            direction = "left"

        else:

            direction = "center"

        # ======================================
        # REP COUNTING
        # ======================================

        if (
            direction == "left"
            and self.current_side == "neutral"
        ):

            self.current_side = "left"

        elif (
            direction == "right"
            and self.current_side == "neutral"
        ):

            self.current_side = "right"

        elif (
            direction == "center"
            and self.current_side in ["left", "right"]
        ):

            self.reps += 1
            self.current_side = "neutral"

        # ======================================
        # COMMAND
        # ======================================

        if direction == "left":

            command = "Tilt left"

        elif direction == "right":

            command = "Tilt right"

        else:

            command = "Return to center"

        # ======================================
        # THRUST
        # ======================================

        shoulder_hip_distance = math.sqrt(
            (hip_mid[0] - shoulder_mid[0]) ** 2
            +
            (hip_mid[1] - shoulder_mid[1]) ** 2
        )

        if shoulder_hip_distance > 0:

            thrust = (
                (nose[0] - shoulder_mid[0])
                /
                shoulder_hip_distance
            ) * 100

        else:

            thrust = 0

        # ======================================
        # FORM SCORE
        # ======================================

        form_score = 100

        if abs(smooth_angle) > self.MAX_SAFE_ANGLE:

            form_score -= 30

        if abs(thrust) > 35:

            form_score -= 20

        form_score = max(
            0,
            min(100, form_score)
        )

        # ======================================
        # SUGGESTIONS
        # ======================================

        suggestions = []

        if abs(smooth_angle) > self.MAX_SAFE_ANGLE:

            suggestions.append(
                "Reduce your neck tilt"
            )

        if abs(thrust) > 35:

            suggestions.append(
                "Keep your head aligned with your shoulders"
            )

        if not suggestions:

            suggestions.append(
                "Good movement consistency"
            )

        # ======================================
        # SPEED
        # ======================================

        now = time.time()

        dt = now - self.previous_time

        if dt > 0:

            angular_velocity = abs(
                smooth_angle -
                self.previous_angle
            ) / dt

        else:

            angular_velocity = 0

        self.previous_angle = smooth_angle
        self.previous_time = now

        if angular_velocity > 100:

            suggestions.append(
                "Slow down your movement"
            )

        # ======================================
        # RETURN RESULT
        # ======================================

        return {
            "detected": True,
            "reps": self.reps,
            "angle": round(
                abs(smooth_angle),
                1
            ),
            "direction": direction,
            "command": command,
            "formScore": form_score,
            "thrust": round(
                thrust,
                1
            ),
            "suggestions": suggestions
        }

    def close(self):

        self.landmarker.close()