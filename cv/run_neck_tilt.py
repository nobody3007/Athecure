import cv2
from neck_cv import NeckTiltAnalyzer
from send_result import send_result

# Create analyzer
analyzer = NeckTiltAnalyzer()
session_id = 6

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print("Webcam started. Press 'q' to quit.")

last_result = None

while True:
    success, frame = cap.read()

    if not success:
        print("Error: Could not read frame.")
        break

    # Process the current camera frame
    result = analyzer.process_frame(frame)

    if result["detected"]:
        last_result = result

    # print("Detected:", result["detected"], "| Result:", result)

    cv2.putText(
    frame,
    f"Detected: {result['detected']}",
    (20, 160),
    cv2.FONT_HERSHEY_SIMPLEX,
    0.7,
    (0, 255, 0),
    2
)

    # Display some results on the camera window
    cv2.putText(
        frame,
        f"Reps: {result['reps']}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Angle: {result['angle']:.1f}",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Direction: {result['direction']}",
        (20, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 0),
        2
    )

    cv2.imshow("Neck Tilt Analyzer", frame)

    # Press q to stop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Clean up
cap.release()
cv2.destroyAllWindows()

if last_result is not None:
    try:
        response = send_result(session_id, last_result)
        print("Result sent successfully!")
        print(response)
    except Exception as e:
        print("Error sending result:", e)
else:
    print("No valid pose was detected, so no result was sent.")