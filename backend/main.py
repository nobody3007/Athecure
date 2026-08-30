import base64
import json

import cv2
import numpy as np

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from neck_cv import NeckTiltAnalyzer
from squat_cv import SquatAnalyzer


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Athecure CV backend is running"
    }


# =========================================================
# NECK
# =========================================================

@app.websocket("/ws/neck")
async def neck_analysis(websocket: WebSocket):

    await websocket.accept()

    print("React connected to neck CV")

    analyzer = NeckTiltAnalyzer()

    try:

        while True:

            data = await websocket.receive_text()

            image_bytes = base64.b64decode(data)

            image_array = np.frombuffer(
                image_bytes,
                dtype=np.uint8
            )

            frame = cv2.imdecode(
                image_array,
                cv2.IMREAD_COLOR
            )

            if frame is None:
                continue

            result = analyzer.process_frame(frame)

            await websocket.send_text(
                json.dumps(result)
            )

    except WebSocketDisconnect:

        print("React disconnected from neck CV")

    except Exception as error:

        print("Neck CV error:", error)

    finally:

        analyzer.close()


# =========================================================
# SQUAT
# =========================================================

@app.websocket("/ws/squat")
async def squat_analysis(websocket: WebSocket):

    await websocket.accept()

    print("React connected to squat CV")

    analyzer = SquatAnalyzer()

    try:

        while True:

            data = await websocket.receive_text()

            image_bytes = base64.b64decode(data)

            image_array = np.frombuffer(
                image_bytes,
                dtype=np.uint8
            )

            frame = cv2.imdecode(
                image_array,
                cv2.IMREAD_COLOR
            )

            if frame is None:
                continue

            result = analyzer.process_frame(frame)

            await websocket.send_text(
                json.dumps(result)
            )

    except WebSocketDisconnect:

        print("React disconnected from squat CV")

    except Exception as error:

        print("Squat CV error:", error)

    finally:

        analyzer.close()