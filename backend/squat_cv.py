import time
from collections import deque

import cv2
import mediapipe as mp
import numpy as np


class SquatAnalyzer:

    def __init__(self):

        # ==========================================
        # MEDIAPIPE SETUP
        # ==========================================

        self.BaseOptions = mp.tasks.BaseOptions
        self.PoseLandmarker = mp.tasks.vision.PoseLandmarker
        self.PoseLandmarkerOptions = (
            mp.tasks.vision.PoseLandmarkerOptions
        )
        self.RunningMode = mp.tasks.vision.RunningMode

        self.model_path = "pose_landmarker.task"

        options = self.PoseLandmarkerOptions(
            base_options=self.BaseOptions(
                model_asset_path=self.model_path
            ),
            running_mode=self.RunningMode.IMAGE,
            num_poses=1
        )

        self.landmarker = (
            self.PoseLandmarker
            .create_from_options(options)
        )

        # ==========================================
        # LANDMARK IDS
        # ==========================================

        self.L_SHOULDER = 11
        self.R_SHOULDER = 12

        self.L_HIP = 23
        self.R_HIP = 24

        self.L_KNEE = 25
        self.R_KNEE = 26

        self.L_ANKLE = 27
        self.R_ANKLE = 28

        self.VISIBILITY_THRESHOLD = 0.5

        # ==========================================
        # SQUAT THRESHOLDS
        # ==========================================

        # Starting values for testing.
        self.DOWN_THRESHOLD = 110.0
        self.UP_THRESHOLD = 150.0

        # Angle used for depth interpolation.
        self.FULL_DEPTH_ANGLE = 80.0
        self.STANDING_ANGLE = 170.0

        # ==========================================
        # SMOOTHING
        # ==========================================

        self.angle_history = deque(maxlen=5)

        # ==========================================
        # REP STATE
        # ==========================================

        self.squat_stage = "up"
        self.squat_count = 0

        # Require several consecutive frames
        # before changing state.
        self.down_frames = 0
        self.up_frames = 0

        self.REQUIRED_FRAMES = 3

        # ==========================================
        # FORM
        # ==========================================

        self.form_feedback = "Ready"

    # ==========================================
    # ANGLE CALCULATION
    # ==========================================

    def calculate_angle(self, a, b, c):

        a = np.array(a, dtype=np.float32)
        b = np.array(b, dtype=np.float32)
        c = np.array(c, dtype=np.float32)

        radians = (
            np.arctan2(
                c[1] - b[1],
                c[0] - b[0]
            )
            -
            np.arctan2(
                a[1] - b[1],
                a[0] - b[0]
            )
        )

        angle = abs(
            radians * 180.0 / np.pi
        )

        if angle > 180.0:
            angle = 360.0 - angle

        return float(angle)

    # ==========================================
    # LANDMARK → PIXEL
    # ==========================================

    def get_landmark_xy(
        self,
        landmarks,
        idx,
        width,
        height
    ):

        landmark = landmarks[idx]

        return [
            landmark.x * width,
            landmark.y * height
        ]

    # ==========================================
    # LANDMARKS → JSON
    # ==========================================

    def get_landmarks(self, landmarks):

        output = []

        for index, landmark in enumerate(landmarks):

            output.append({
                "index": index,
                "x": float(landmark.x),
                "y": float(landmark.y),
                "z": float(landmark.z),
                "visibility": float(landmark.visibility)
            })

        return output

    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.squat_stage = "up"
        self.squat_count = 0

        self.down_frames = 0
        self.up_frames = 0

        self.angle_history.clear()

        self.form_feedback = "Ready"

    # ==========================================
    # PROCESS ONE FRAME
    # ==========================================

    def process_frame(self, frame):

        # ======================================
        # IMAGE
        # ======================================

        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # ======================================
        # POSE DETECTION
        # ======================================

        result = self.landmarker.detect(
            mp_image
        )

        # ======================================
        # NO PERSON
        # ======================================

        if not result.pose_landmarks:

            return {
                "detected": False,
                "reps": self.squat_count,
                "stage": self.squat_stage,
                "kneeAngle": 0,
                "leftKneeAngle": 0,
                "rightKneeAngle": 0,
                "depth": 0,
                "form": "No person detected",
                "formScore": 0,
                "command": "Move into camera view",
                "suggestions": [
                    "Make sure your hips, knees and ankles are visible"
                ],
                "trackingSide": "none",
                "landmarks": []
            }

        landmarks = result.pose_landmarks[0]

        # ======================================
        # IMAGE SIZE
        # ======================================

        height, width = frame.shape[:2]

        # ======================================
        # LEG VISIBILITY
        # ======================================

        left_visibility = (
            landmarks[self.L_HIP].visibility +
            landmarks[self.L_KNEE].visibility +
            landmarks[self.L_ANKLE].visibility
        ) / 3.0

        right_visibility = (
            landmarks[self.R_HIP].visibility +
            landmarks[self.R_KNEE].visibility +
            landmarks[self.R_ANKLE].visibility
        ) / 3.0

        # ======================================
        # SELECT BETTER LEG
        # ======================================

        if left_visibility >= right_visibility:

            tracking_side = "left"

            hip_id = self.L_HIP
            knee_id = self.L_KNEE
            ankle_id = self.L_ANKLE

        else:

            tracking_side = "right"

            hip_id = self.R_HIP
            knee_id = self.R_KNEE
            ankle_id = self.R_ANKLE

        # ======================================
        # CHECK SELECTED LEG
        # ======================================

        if (
            landmarks[hip_id].visibility
            < self.VISIBILITY_THRESHOLD
            or
            landmarks[knee_id].visibility
            < self.VISIBILITY_THRESHOLD
            or
            landmarks[ankle_id].visibility
            < self.VISIBILITY_THRESHOLD
        ):

            return {
                "detected": False,
                "reps": self.squat_count,
                "stage": self.squat_stage,
                "kneeAngle": 0,
                "leftKneeAngle": 0,
                "rightKneeAngle": 0,
                "depth": 0,
                "form": "Poor visibility",
                "formScore": 0,
                "command": "Adjust your position",
                "suggestions": [
                    "Make sure one complete leg is visible"
                ],
                "trackingSide": tracking_side,
                "landmarks": self.get_landmarks(
                    landmarks
                )
            }

        # ======================================
        # KNEE POINTS
        # ======================================

        hip = self.get_landmark_xy(
            landmarks,
            hip_id,
            width,
            height
        )

        knee = self.get_landmark_xy(
            landmarks,
            knee_id,
            width,
            height
        )

        ankle = self.get_landmark_xy(
            landmarks,
            ankle_id,
            width,
            height
        )

        # ======================================
        # MAIN KNEE ANGLE
        # ======================================

        knee_angle = self.calculate_angle(
            hip,
            knee,
            ankle
        )

        # ======================================
        # SMOOTH
        # ======================================

        self.angle_history.append(
            knee_angle
        )

        smoothed_angle = (
            sum(self.angle_history)
            /
            len(self.angle_history)
        )

        # ======================================
        # LEFT / RIGHT ANGLES
        # ======================================

        left_knee_angle = 0.0
        right_knee_angle = 0.0

        if (
            landmarks[self.L_HIP].visibility
            >= 0.2
            and
            landmarks[self.L_KNEE].visibility
            >= 0.2
            and
            landmarks[self.L_ANKLE].visibility
            >= 0.2
        ):

            left_knee_angle = self.calculate_angle(
                self.get_landmark_xy(
                    landmarks,
                    self.L_HIP,
                    width,
                    height
                ),
                self.get_landmark_xy(
                    landmarks,
                    self.L_KNEE,
                    width,
                    height
                ),
                self.get_landmark_xy(
                    landmarks,
                    self.L_ANKLE,
                    width,
                    height
                )
            )

        if (
            landmarks[self.R_HIP].visibility
            >= 0.2
            and
            landmarks[self.R_KNEE].visibility
            >= 0.2
            and
            landmarks[self.R_ANKLE].visibility
            >= 0.2
        ):

            right_knee_angle = self.calculate_angle(
                self.get_landmark_xy(
                    landmarks,
                    self.R_HIP,
                    width,
                    height
                ),
                self.get_landmark_xy(
                    landmarks,
                    self.R_KNEE,
                    width,
                    height
                ),
                self.get_landmark_xy(
                    landmarks,
                    self.R_ANKLE,
                    width,
                    height
                )
            )

        # ======================================
        # DEPTH
        # ======================================

        depth = np.interp(
            smoothed_angle,
            [
                self.FULL_DEPTH_ANGLE,
                self.STANDING_ANGLE
            ],
            [
                100,
                0
            ]
        )

        depth = int(
            np.clip(
                depth,
                0,
                100
            )
        )

        # ======================================
        # REP STATE MACHINE
        # ======================================

        # DOWN DETECTION
        if smoothed_angle <= self.DOWN_THRESHOLD:

            self.down_frames += 1

        else:

            self.down_frames = 0

        # UP DETECTION
        if smoothed_angle >= self.UP_THRESHOLD:

            self.up_frames += 1

        else:

            self.up_frames = 0

        # ======================================
        # ENTER DOWN
        # ======================================

        if (
            self.squat_stage == "up"
            and
            self.down_frames >= self.REQUIRED_FRAMES
        ):

            self.squat_stage = "down"

            self.up_frames = 0

        # ======================================
        # COMPLETE REP
        # ======================================

        elif (
            self.squat_stage == "down"
            and
            self.up_frames >= self.REQUIRED_FRAMES
        ):

            self.squat_count += 1

            self.squat_stage = "up"

            self.down_frames = 0

            self.form_feedback = (
                "Rep completed"
            )

        # ======================================
        # COMMAND
        # ======================================

        if self.squat_stage == "up":

            command = "Squat down"

        else:

            if smoothed_angle > self.DOWN_THRESHOLD:

                command = "Go lower"

            else:

                command = "Good depth"

        # ======================================
        # KNEE ASYMMETRY
        # ======================================

        knee_asymmetry = 0

        if (
            left_knee_angle > 0
            and
            right_knee_angle > 0
        ):

            knee_asymmetry = abs(
                left_knee_angle -
                right_knee_angle
            )

        # ======================================
        # FORM SCORE
        # ======================================

        form_score = 100

        suggestions = []

        # Not deep enough
        if (
            self.squat_stage == "down"
            and
            smoothed_angle > self.DOWN_THRESHOLD
        ):

            form_score -= 25

            suggestions.append(
                "Go a little deeper"
            )

        # Strong knee asymmetry
        if knee_asymmetry > 20:

            form_score -= 20

            suggestions.append(
                "Try to keep both knees balanced"
            )

        elif knee_asymmetry > 12:

            form_score -= 10

            suggestions.append(
                "Keep your legs more symmetrical"
            )

        # ======================================
        # SIMPLE TORSO CHECK
        # ======================================

        left_shoulder = landmarks[
            self.L_SHOULDER
        ]

        right_shoulder = landmarks[
            self.R_SHOULDER
        ]

        left_hip = landmarks[
            self.L_HIP
        ]

        right_hip = landmarks[
            self.R_HIP
        ]

        if (
            left_shoulder.visibility >= 0.2
            and
            right_shoulder.visibility >= 0.2
            and
            left_hip.visibility >= 0.2
            and
            right_hip.visibility >= 0.2
        ):

            shoulder_x = (
                left_shoulder.x +
                right_shoulder.x
            ) / 2

            shoulder_y = (
                left_shoulder.y +
                right_shoulder.y
            ) / 2

            hip_x = (
                left_hip.x +
                right_hip.x
            ) / 2

            hip_y = (
                left_hip.y +
                right_hip.y
            ) / 2

            torso_angle = abs(
                np.degrees(
                    np.arctan2(
                        shoulder_x - hip_x,
                        -(shoulder_y - hip_y)
                    )
                )
            )

        else:

            torso_angle = 0

        # ======================================
        # TORSO FEEDBACK
        # ======================================

        if torso_angle > 35:

            form_score -= 20

            suggestions.append(
                "Keep your torso more upright"
            )

        elif torso_angle > 25:

            form_score -= 10

            suggestions.append(
                "Try to reduce forward lean"
            )

        # ======================================
        # FORM SCORE LIMIT
        # ======================================

        form_score = max(
            0,
            min(
                100,
                form_score
            )
        )

        # ======================================
        # DEFAULT FEEDBACK
        # ======================================

        if not suggestions:

            if self.squat_stage == "down":

                suggestions.append(
                    "Good squat position"
                )

            else:

                suggestions.append(
                    "Ready for the next squat"
                )

        # ======================================
        # FORM LABEL
        # ======================================

        if form_score >= 90:

            form_text = "Good form"

        elif form_score >= 75:

            form_text = "Needs improvement"

        else:

            form_text = "Correct your form"

        # ======================================
        # RETURN RESULT
        # ======================================

        return {

            "detected": True,

            "reps": self.squat_count,

            "stage": self.squat_stage,

            "kneeAngle": round(
                smoothed_angle,
                1
            ),

            "leftKneeAngle": round(
                left_knee_angle,
                1
            ),

            "rightKneeAngle": round(
                right_knee_angle,
                1
            ),

            "depth": depth,

            "torsoLean": round(
                torso_angle,
                1
            ),

            "form": form_text,

            "formScore": form_score,

            "command": command,

            "trackingSide": tracking_side,

            "suggestions": suggestions,

            "landmarks": self.get_landmarks(
                landmarks
            )
        }

    # ==========================================
    # CLOSE
    # ==========================================

    def close(self):

        self.landmarker.close()


# =================================================
# LOCAL OPENCV TEST
# =================================================

if __name__ == "__main__":

    analyzer = SquatAnalyzer()

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():

        print(
            "ERROR: Could not open webcam."
        )

        raise SystemExit

    print(
        "Squat detection started."
    )

    print(
        "Use a side or slightly angled side view."
    )

    print(
        "Keep your full body visible."
    )

    print(
        "Press Q or ESC to quit."
    )


    WINDOW_NAME = "Athecure - Squat Analysis"

    cv2.namedWindow(
        WINDOW_NAME,
        cv2.WINDOW_NORMAL
    )

    cv2.setWindowProperty(
        WINDOW_NAME,
        cv2.WND_PROP_FULLSCREEN,
        cv2.WINDOW_FULLSCREEN
    )


    # ==========================================
    # SKELETON CONNECTIONS
    # ==========================================

    connections = [

        # Face
        (0, 1),
        (1, 2),
        (2, 3),
        (3, 7),

        (0, 4),
        (4, 5),
        (5, 6),
        (6, 8),

        (9, 10),

        # Shoulders
        (11, 12),

        # Left arm
        (11, 13),
        (13, 15),
        (15, 17),
        (15, 19),
        (15, 21),

        # Right arm
        (12, 14),
        (14, 16),
        (16, 18),
        (16, 20),
        (16, 22),

        # Torso
        (11, 23),
        (12, 24),
        (23, 24),

        # Left leg
        (23, 25),
        (25, 27),
        (27, 29),
        (29, 31),

        # Right leg
        (24, 26),
        (26, 28),
        (28, 30),
        (30, 32)

    ]


    while cap.isOpened():

        success, frame = cap.read()

        if not success:
            break

        # Mirror image
        frame = cv2.flip(
            frame,
            1
        )

        result = analyzer.process_frame(
            frame
        )

        height, width = frame.shape[:2]

        # ======================================
        # DRAW SKELETON
        # ======================================

        if result["landmarks"]:

            landmarks = result[
                "landmarks"
            ]

            points = [

                (
                    int(
                        lm["x"] * width
                    ),
                    int(
                        lm["y"] * height
                    )
                )

                for lm in landmarks

            ]

            # ----------------------------------
            # Connections
            # ----------------------------------

            for start, end in connections:

                if (
                    landmarks[start]["visibility"]
                    > 0.2
                    and
                    landmarks[end]["visibility"]
                    > 0.2
                ):

                    cv2.line(
                        frame,
                        points[start],
                        points[end],
                        (80, 220, 120),
                        3,
                        cv2.LINE_AA
                    )

            # ----------------------------------
            # All landmarks
            # ----------------------------------

            for index, lm in enumerate(
                landmarks
            ):

                if lm["visibility"] > 0.2:

                    cv2.circle(
                        frame,
                        points[index],
                        5,
                        (40, 120, 255),
                        -1
                    )

            # ----------------------------------
            # Highlight tracking knee
            # ----------------------------------

            if result[
                "trackingSide"
            ] == "left":

                knee_index = 25

            elif result[
                "trackingSide"
            ] == "right":

                knee_index = 26

            else:

                knee_index = None

            if knee_index is not None:

                cv2.circle(
                    frame,
                    points[knee_index],
                    12,
                    (255, 80, 200),
                    3
                )

        # ======================================
        # SIDEBAR
        # ======================================

        sidebar_width = 300

        sidebar = np.zeros(
            (
                height,
                sidebar_width,
                3
            ),
            dtype=np.uint8
        )

        sidebar[:] = (
            18,
            24,
            34
        )

        # ======================================
        # HEADER
        # ======================================

        cv2.putText(
            sidebar,
            "SQUAT",
            (25, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

        cv2.line(
            sidebar,
            (25, 65),
            (sidebar_width - 25, 65),
            (70, 80, 100),
            1
        )

        # ======================================
        # REPS
        # ======================================

        cv2.putText(
            sidebar,
            "REPS",
            (25, 105),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (160, 170, 185),
            1,
            cv2.LINE_AA
        )

        cv2.putText(
            sidebar,
            f"{result['reps']:02d}",
            (25, 145),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.3,
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

        # ======================================
        # KNEE ANGLE
        # ======================================

        cv2.putText(
            sidebar,
            "KNEE ANGLE",
            (25, 190),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (160, 170, 185),
            1,
            cv2.LINE_AA
        )

        cv2.putText(
            sidebar,
            f"{result['kneeAngle']} deg",
            (25, 230),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

        # ======================================
        # DEPTH
        # ======================================

        cv2.putText(
            sidebar,
            "DEPTH",
            (25, 275),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (160, 170, 185),
            1,
            cv2.LINE_AA
        )

        cv2.putText(
            sidebar,
            f"{result['depth']}%",
            (25, 315),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

        # ======================================
        # STAGE
        # ======================================

        cv2.putText(
            sidebar,
            "STAGE",
            (25, 360),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (160, 170, 185),
            1,
            cv2.LINE_AA
        )

        cv2.putText(
            sidebar,
            result["stage"].upper(),
            (25, 400),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (255, 255, 255),
            2,
            cv2.LINE_AA
        )

        # ======================================
        # FORM
        # ======================================

        cv2.putText(
            sidebar,
            "FORM",
            (25, 445),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (160, 170, 185),
            1,
            cv2.LINE_AA
        )

        cv2.putText(
            sidebar,
            f"{result['formScore']}%",
            (25, 485),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (100, 235, 150),
            2,
            cv2.LINE_AA
        )

        # ======================================
        # COMMAND
        # ======================================

        cv2.putText(
            sidebar,
            "INSTRUCTION",
            (25, 530),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (160, 170, 185),
            1,
            cv2.LINE_AA
        )

        cv2.putText(
            sidebar,
            result["command"],
            (25, 570),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (80, 220, 255),
            2,
            cv2.LINE_AA
        )

        # ======================================
        # FEEDBACK
        # ======================================

        cv2.putText(
            sidebar,
            "FEEDBACK",
            (25, 615),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (160, 170, 185),
            1,
            cv2.LINE_AA
        )

        suggestion = result[
            "suggestions"
        ][0]

        # Simple wrapping
        if len(suggestion) > 28:

            words = suggestion.split()

            line1 = ""
            line2 = ""

            for word in words:

                if len(
                    line1 + " " + word
                ) <= 28:

                    line1 += (
                        (" " if line1 else "")
                        +
                        word
                    )

                else:

                    line2 += (
                        (" " if line2 else "")
                        +
                        word
                    )

        else:

            line1 = suggestion
            line2 = ""

        cv2.putText(
            sidebar,
            line1,
            (25, 650),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.48,
            (255, 255, 255),
            1,
            cv2.LINE_AA
        )

        if line2:

            cv2.putText(
                sidebar,
                line2,
                (25, 675),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.48,
                (255, 255, 255),
                1,
                cv2.LINE_AA
            )

        # ======================================
        # EXIT
        # ======================================

        cv2.putText(
            sidebar,
            "Q / ESC  Exit",
            (25, height - 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (150, 160, 175),
            1,
            cv2.LINE_AA
        )

        # ======================================
        # COMBINE
        # ======================================

        output = np.hstack(
            (
                frame,
                sidebar
            )
        )

        cv2.imshow(
            WINDOW_NAME,
            output
        )

        key = cv2.waitKey(1) & 0xFF

        if (
            key == ord("q")
            or key == 27
        ):

            break


    cap.release()

    cv2.destroyAllWindows()

    analyzer.close()

    print(
        "Squat detection stopped."
    )