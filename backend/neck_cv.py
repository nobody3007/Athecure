import math
import time
from collections import deque

import cv2
import mediapipe as mp
import numpy as np


class NeckTiltAnalyzer:

    def __init__(self):

        # ==========================================
        # MEDIAPIPE
        # ==========================================

        self.BaseOptions = mp.tasks.BaseOptions
        self.PoseLandmarker = mp.tasks.vision.PoseLandmarker
        self.PoseLandmarkerOptions = (
            mp.tasks.vision.PoseLandmarkerOptions
        )

        self.model_path = "pose_landmarker.task"

        options = self.PoseLandmarkerOptions(
            base_options=self.BaseOptions(
                model_asset_path=self.model_path
            ),
            running_mode=(
                mp.tasks.vision.RunningMode.IMAGE
            ),
            num_poses=1
        )

        self.landmarker = (
            self.PoseLandmarker
            .create_from_options(options)
        )


        # ==========================================
        # LANDMARK IDS
        # ==========================================

        self.NOSE = 0
        self.LEFT_SHOULDER = 11
        self.RIGHT_SHOULDER = 12

        self.VISIBILITY_THRESHOLD = 0.5


        # ==========================================
        # NECK TILT SETTINGS
        # ==========================================

        # Below this = neutral
        self.NEUTRAL_THRESHOLD = 7.0

        # Above this = active tilt
        self.TILT_THRESHOLD = 12.0

        # Above this = excessive tilt
        self.MAX_SAFE_ANGLE = 35.0

        # Very large tilt
        self.MAX_ANGLE = 45.0


        # ==========================================
        # REP STATE
        # ==========================================

        self.reps = 0
        self.current_side = "neutral"


        # ==========================================
        # SMOOTHING
        # ==========================================

        self.angle_history = deque(
            maxlen=5
        )


        # ==========================================
        # MOVEMENT SPEED
        # ==========================================

        self.previous_angle = 0.0
        self.previous_time = time.time()


    # ==========================================
    # ANGLE
    # ==========================================

    def calculate_angle(
        self,
        a,
        b,
        c
    ):

        a = np.array(a)
        b = np.array(b)
        c = np.array(c)

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

        if angle > 180:

            angle = 360 - angle

        return angle


    # ==========================================
    # LEFT / RIGHT TILT
    # ==========================================

    def calculate_tilt_direction(
        self,
        nose,
        shoulder_mid
    ):

        dx = (
            nose[0]
            -
            shoulder_mid[0]
        )

        dy = (
            nose[1]
            -
            shoulder_mid[1]
        )

        angle = math.degrees(
            math.atan2(
                dx,
                -dy
            )
        )

        return angle


    # ==========================================
    # LANDMARKS → JSON
    # ==========================================

    def get_landmarks(
        self,
        landmarks
    ):

        output = []

        for index, landmark in enumerate(
            landmarks
        ):

            output.append({

                "index": index,

                "x": float(
                    landmark.x
                ),

                "y": float(
                    landmark.y
                ),

                "z": float(
                    landmark.z
                ),

                "visibility": float(
                    landmark.visibility
                )

            })

        return output


    # ==========================================
    # EMPTY RESULT
    # ==========================================

    def empty_result(
        self,
        command,
        suggestion,
        landmarks=None
    ):

        return {

            "detected": False,

            "reps": self.reps,

            "angle": 0,

            "direction": "unknown",

            "command": command,

            "formScore": 0,

            "thrust": 0,

            "suggestions": [
                suggestion
            ],

            "landmarks": (
                []
                if landmarks is None
                else self.get_landmarks(
                    landmarks
                )
            )

        }


    # ==========================================
    # PROCESS ONE FRAME
    # ==========================================

    def process_frame(
        self,
        frame
    ):

        # ======================================
        # BGR → RGB
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
        # MEDIAPIPE
        # ======================================

        result = self.landmarker.detect(
            mp_image
        )


        # ======================================
        # NOTHING DETECTED
        # ======================================

        if not result.pose_landmarks:

            return self.empty_result(
                "Move into camera view",
                "Make sure your head and shoulders are visible"
            )


        # First detected person
        landmarks = result.pose_landmarks[0]


        # ======================================
        # REQUIRED LANDMARKS
        # ======================================

        nose = landmarks[
            self.NOSE
        ]

        left_shoulder = landmarks[
            self.LEFT_SHOULDER
        ]

        right_shoulder = landmarks[
            self.RIGHT_SHOULDER
        ]


        # ======================================
        # VISIBILITY CHECK
        # ======================================

        important_points = [
            nose,
            left_shoulder,
            right_shoulder
        ]

        if any(
            point.visibility
            < self.VISIBILITY_THRESHOLD
            for point in important_points
        ):

            return self.empty_result(
                "Adjust your position",
                "Keep your head and both shoulders visible",
                landmarks
            )


        # ======================================
        # COORDINATES
        # ======================================

        nose_point = [
            nose.x,
            nose.y
        ]

        left_shoulder_point = [
            left_shoulder.x,
            left_shoulder.y
        ]

        right_shoulder_point = [
            right_shoulder.x,
            right_shoulder.y
        ]


        # ======================================
        # SHOULDER MIDPOINT
        # ======================================

        shoulder_mid = [

            (
                left_shoulder_point[0]
                +
                right_shoulder_point[0]
            ) / 2,

            (
                left_shoulder_point[1]
                +
                right_shoulder_point[1]
            ) / 2

        ]


        # ======================================
        # SIGNED TILT
        # ======================================

        tilt_angle = (
            self.calculate_tilt_direction(
                nose_point,
                shoulder_mid
            )
        )


        # ======================================
        # SMOOTH
        # ======================================

        self.angle_history.append(
            tilt_angle
        )

        smooth_angle = (
            sum(
                self.angle_history
            )
            /
            len(
                self.angle_history
            )
        )


        absolute_angle = abs(
            smooth_angle
        )


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
        # REP STATE
        # ======================================
        #
        # neutral → left/right → neutral
        # = 1 completed rep
        #
        # We don't count until the person
        # actually leaves the neutral position.
        # ======================================

        rep_completed = False


        if direction == "left":

            if (
                self.current_side
                == "neutral"
            ):

                self.current_side = "left"


        elif direction == "right":

            if (
                self.current_side
                == "neutral"
            ):

                self.current_side = "right"


        elif direction == "center":

            if (
                self.current_side
                in ["left", "right"]
            ):

                self.reps += 1

                rep_completed = True

                self.current_side = "neutral"


        # ======================================
        # COMMAND
        # ======================================

        if direction == "left":

            if absolute_angle > self.MAX_SAFE_ANGLE:

                command = "Reduce left tilt"

            else:

                command = "Tilt left"


        elif direction == "right":

            if absolute_angle > self.MAX_SAFE_ANGLE:

                command = "Reduce right tilt"

            else:

                command = "Tilt right"


        else:

            if rep_completed:

                command = "Ready"

            elif self.current_side == "neutral":

                command = "Ready"

            else:

                command = "Ready"


        # ======================================
        # SHOULDER WIDTH
        # ======================================

        shoulder_width = math.sqrt(

            (
                right_shoulder_point[0]
                -
                left_shoulder_point[0]
            ) ** 2

            +

            (
                right_shoulder_point[1]
                -
                left_shoulder_point[1]
            ) ** 2

        )


        # ======================================
        # HEAD OFFSET
        # ======================================

        if shoulder_width > 0:

            head_offset = (

                (
                    nose_point[0]
                    -
                    shoulder_mid[0]
                )

                /
                shoulder_width

            ) * 100

        else:

            head_offset = 0


        # ======================================
        # MOVEMENT SPEED
        # ======================================

        now = time.time()

        dt = (
            now
            -
            self.previous_time
        )

        if dt > 0:

            angular_velocity = abs(

                smooth_angle
                -
                self.previous_angle

            ) / dt

        else:

            angular_velocity = 0


        self.previous_angle = smooth_angle
        self.previous_time = now


        # ======================================
        # FORM SCORE
        # ======================================
        #
        # This is a heuristic score.
        # It is NOT a medical score.
        # ======================================

        form_score = 100.0


        # --------------------------------------
        # Tilt quality
        # --------------------------------------

        if direction in [
            "left",
            "right"
        ]:

            if absolute_angle < self.TILT_THRESHOLD:

                form_score -= 15

            elif absolute_angle <= 20:

                form_score -= 3

            elif absolute_angle <= 30:

                form_score -= 0

            elif absolute_angle <= 35:

                form_score -= 10

            elif absolute_angle <= 45:

                form_score -= 30

            else:

                form_score -= 45


        # --------------------------------------
        # Head offset
        # --------------------------------------

        offset = abs(
            head_offset
        )

        if offset > 35:

            form_score -= 25

        elif offset > 25:

            form_score -= 10


        # --------------------------------------
        # Speed
        # --------------------------------------

        if angular_velocity > 100:

            form_score -= 15

        elif angular_velocity > 70:

            form_score -= 5


        form_score = int(
            max(
                0,
                min(
                    100,
                    round(form_score)
                )
            )
        )


        # ======================================
        # SUGGESTIONS
        # ======================================

        suggestions = []


        # --------------------------------------
        # CENTER
        # --------------------------------------

        if direction == "center":

            if rep_completed:

                suggestions.append(
                    "Good rep — return to neutral"
                )

            else:

                suggestions.append(
                    "Ready — keep your head centered"
                )


        # --------------------------------------
        # LEFT
        # --------------------------------------

        elif direction == "left":

            if absolute_angle < self.TILT_THRESHOLD:

                suggestions.append(
                    "Tilt a little further left"
                )

            elif absolute_angle > self.MAX_SAFE_ANGLE:

                suggestions.append(
                    "Reduce your left tilt"
                )

            elif absolute_angle > 30:

                suggestions.append(
                    "Slightly reduce your left tilt"
                )

            else:

                suggestions.append(
                    "Good left tilt"
                )


        # --------------------------------------
        # RIGHT
        # --------------------------------------

        elif direction == "right":

            if absolute_angle < self.TILT_THRESHOLD:

                suggestions.append(
                    "Tilt a little further right"
                )

            elif absolute_angle > self.MAX_SAFE_ANGLE:

                suggestions.append(
                    "Reduce your right tilt"
                )

            elif absolute_angle > 30:

                suggestions.append(
                    "Slightly reduce your right tilt"
                )

            else:

                suggestions.append(
                    "Good right tilt"
                )


        # --------------------------------------
        # HEAD OFFSET
        # --------------------------------------

        if offset > 35:

            suggestions.append(
                "Keep your head aligned with your shoulders"
            )


        # --------------------------------------
        # SPEED
        # --------------------------------------

        if angular_velocity > 100:

            suggestions.append(
                "Slow down and use a controlled movement"
            )


        # ======================================
        # LANDMARK DATA
        # ======================================

        landmark_data = self.get_landmarks(
            landmarks
        )


        # ======================================
        # RETURN TO BACKEND
        # ======================================

        return {

            "detected": True,

            "reps": self.reps,

            "angle": round(
                absolute_angle,
                1
            ),

            "direction": direction,

            "command": command,

            "formScore": form_score,

            "thrust": round(
                head_offset,
                1
            ),

            "suggestions": suggestions,

            "landmarks": landmark_data

        }


    # ==========================================
    # RESET
    # ==========================================

    def reset(self):

        self.reps = 0

        self.current_side = "neutral"

        self.angle_history.clear()

        self.previous_angle = 0.0

        self.previous_time = time.time()


    # ==========================================
    # CLOSE
    # ==========================================

    def close(self):

        self.landmarker.close()


# =================================================
# LOCAL TEST
# =================================================

if __name__ == "__main__":

    analyzer = NeckTiltAnalyzer()

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():

        print(
            "ERROR: Could not open webcam."
        )

    else:

        print(
            "Neck tilt test started."
        )

        print(
            "Keep your head and shoulders visible."
        )

        print(
            "Press Q or ESC to quit."
        )


        # ======================================
        # WINDOW
        # ======================================

        WINDOW_NAME = (
            "Athecure - Neck Tilt"
        )

        cv2.namedWindow(
            WINDOW_NAME,
            cv2.WINDOW_NORMAL
        )

        cv2.setWindowProperty(
            WINDOW_NAME,
            cv2.WND_PROP_FULLSCREEN,
            cv2.WINDOW_FULLSCREEN
        )


        # ======================================
        # FULL SKELETON CONNECTIONS
        # ======================================

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


        # ======================================
        # MAIN LOOP
        # ======================================

        while cap.isOpened():

            success, frame = cap.read()

            if not success:

                break


            # Mirror image
            frame = cv2.flip(
                frame,
                1
            )


            # ==================================
            # ANALYZE
            # ==================================

            result = analyzer.process_frame(
                frame
            )


            height, width = frame.shape[:2]


            # ==================================
            # DRAW LANDMARKS
            # ==================================

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


                # --------------------------------
                # Skeleton
                # --------------------------------

                for start, end in connections:

                    if (

                        landmarks[start][
                            "visibility"
                        ] > 0.2

                        and

                        landmarks[end][
                            "visibility"
                        ] > 0.2

                    ):

                        cv2.line(

                            frame,

                            points[start],

                            points[end],

                            (80, 220, 120),

                            3,

                            cv2.LINE_AA

                        )


                # --------------------------------
                # All landmarks
                # --------------------------------

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


                        cv2.circle(

                            frame,

                            points[index],

                            7,

                            (255, 255, 255),

                            1

                        )


                # --------------------------------
                # Highlight neck landmarks
                # --------------------------------

                for index in [
                    0,
                    11,
                    12
                ]:

                    cv2.circle(

                        frame,

                        points[index],

                        11,

                        (255, 80, 200),

                        3

                    )


            # ==================================
            # SIDEBAR
            # ==================================

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


            # ==================================
            # HEADER
            # ==================================

            cv2.putText(

                sidebar,

                "NECK TILT",

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


            # ==================================
            # REPS
            # ==================================

            cv2.putText(

                sidebar,

                "REPS",

                (25, 105),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.5,

                (160, 170, 185),

                1

            )

            cv2.putText(

                sidebar,

                f"{result['reps']:02d}",

                (25, 145),

                cv2.FONT_HERSHEY_SIMPLEX,

                1.3,

                (255, 255, 255),

                2

            )


            # ==================================
            # ANGLE
            # ==================================

            cv2.putText(

                sidebar,

                "TILT ANGLE",

                (25, 190),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.5,

                (160, 170, 185),

                1

            )

            cv2.putText(

                sidebar,

                f"{result['angle']} deg",

                (25, 230),

                cv2.FONT_HERSHEY_SIMPLEX,

                1.0,

                (255, 255, 255),

                2

            )


            # ==================================
            # DIRECTION
            # ==================================

            cv2.putText(

                sidebar,

                "DIRECTION",

                (25, 275),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.5,

                (160, 170, 185),

                1

            )

            cv2.putText(

                sidebar,

                result["direction"].upper(),

                (25, 315),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.9,

                (255, 255, 255),

                2

            )


            # ==================================
            # HEAD OFFSET
            # ==================================

            cv2.putText(

                sidebar,

                "HEAD OFFSET",

                (25, 360),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.5,

                (160, 170, 185),

                1

            )

            cv2.putText(

                sidebar,

                f"{result['thrust']}%",

                (25, 400),

                cv2.FONT_HERSHEY_SIMPLEX,

                1.0,

                (255, 255, 255),

                2

            )


            # ==================================
            # FORM SCORE
            # ==================================

            cv2.putText(

                sidebar,

                "FORM SCORE",

                (25, 445),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.5,

                (160, 170, 185),

                1

            )

            cv2.putText(

                sidebar,

                f"{result['formScore']}%",

                (25, 485),

                cv2.FONT_HERSHEY_SIMPLEX,

                1.0,

                (100, 235, 150),

                2

            )


            # ==================================
            # INSTRUCTION
            # ==================================

            cv2.putText(

                sidebar,

                "INSTRUCTION",

                (25, 530),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.5,

                (160, 170, 185),

                1

            )

            cv2.putText(

                sidebar,

                result["command"],

                (25, 570),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.65,

                (80, 220, 255),

                2

            )


            # ==================================
            # FEEDBACK
            # ==================================

            cv2.putText(

                sidebar,

                "FEEDBACK",

                (25, 615),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.5,

                (160, 170, 185),

                1

            )


            # Feedback wrapping
            suggestion = result[
                "suggestions"
            ][0]


            words = suggestion.split()

            line1 = ""
            line2 = ""

            for word in words:

                test = (
                    line1
                    +
                    (" " if line1 else "")
                    +
                    word
                )

                if len(test) <= 26:

                    line1 = test

                else:

                    line2 += (
                        (" " if line2 else "")
                        +
                        word
                    )


            cv2.putText(

                sidebar,

                line1,

                (25, 650),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.5,

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

                    0.5,

                    (255, 255, 255),

                    1,

                    cv2.LINE_AA

                )


            # ==================================
            # EXIT
            # ==================================

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


            # ==================================
            # COMBINE
            # ==================================

            output = np.hstack(
                (
                    frame,
                    sidebar
                )
            )


            # ==================================
            # DISPLAY
            # ==================================

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
        "Neck tilt detection stopped."
    )