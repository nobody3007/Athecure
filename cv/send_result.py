import requests

BACKEND_URL = "http://127.0.0.1:8000"


def send_result(session_id, cv_result):

    data = {
        "session_id": session_id,
        "exercise": "neck_tilt",
        "repetitions": cv_result["reps"],
        "angle": cv_result["angle"],
        "direction": cv_result["direction"],
        "form_score": cv_result["formScore"],
        "thrust": cv_result["thrust"],
        "suggestions": "; ".join(cv_result["suggestions"])
    }

    response = requests.post(
        f"{BACKEND_URL}/results",
        json=data
    )

    response.raise_for_status()

    return response.json()