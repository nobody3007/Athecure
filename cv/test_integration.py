from send_result import send_result


fake_cv_result = {
    "reps": 10,
    "angle": 16.5,
    "direction": "right",
    "formScore": 92,
    "thrust": 10.2,
    "suggestions": [
        "Good movement consistency"
    ]
}


result = send_result(
    session_id=1,
    cv_result=fake_cv_result
)

print(result)