from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import Athlete, WorkoutSession, MovementResult

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def home():
    return {"message": "Fitness Backend is running"}


@app.post("/athletes")
def create_athlete(
    athlete: Athlete,
    session: Session = Depends(get_session)
):
    session.add(athlete)
    session.commit()
    session.refresh(athlete)

    return athlete


@app.get("/athletes")
def get_athletes(
    session: Session = Depends(get_session)
):
    athletes = session.exec(select(Athlete)).all()
    return athletes

@app.get("/athletes/{athlete_id}")
def get_athlete(
    athlete_id: int,
    session: Session = Depends(get_session)
):
    athlete = session.get(Athlete, athlete_id)

    if not athlete:
       raise HTTPException(
           status_code=404,
           detail="Athlete not found"
    )

    return athlete

@app.put("/athletes/{athlete_id}")
def update_athlete(
    athlete_id: int,
    updated_athlete: Athlete,
    session: Session = Depends(get_session)
):
    athlete = session.get(Athlete, athlete_id)

    if not athlete:
       raise HTTPException(
           status_code=404,
           detail="Athlete not found"
    )

    athlete.name = updated_athlete.name
    athlete.age = updated_athlete.age
    athlete.gender = updated_athlete.gender
    athlete.height = updated_athlete.height
    athlete.weight = updated_athlete.weight

    session.add(athlete)
    session.commit()
    session.refresh(athlete)

    return athlete

@app.delete("/athletes/{athlete_id}")
def delete_athlete(
    athlete_id: int,
    session: Session = Depends(get_session)
):
    athlete = session.get(Athlete, athlete_id)

    if not athlete:
       raise HTTPException(
           status_code=404,
           detail="Athlete not found"
    )

    session.delete(athlete)
    session.commit()

    return {"message": "Athlete deleted successfully"}

@app.post("/sessions")
def create_session(
    workout_session: WorkoutSession,
    session: Session = Depends(get_session)
):
    session.add(workout_session)
    session.commit()
    session.refresh(workout_session)

    return workout_session

@app.get("/sessions")
def get_sessions(
    session: Session = Depends(get_session)
):
    sessions = session.exec(select(WorkoutSession)).all()
    return sessions


@app.get("/sessions/{session_id}")
def get_session_by_id(
    session_id: int,
    session: Session = Depends(get_session)
):
    workout_session = session.get(WorkoutSession, session_id)

    if not workout_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found"
    )

    return workout_session

@app.put("/sessions/{session_id}")
def update_session(
    session_id: int,
    updated_session: WorkoutSession,
    session: Session = Depends(get_session)
):
    workout_session = session.get(WorkoutSession, session_id)

    if not workout_session:
        return {"error": "Session not found"}

    workout_session.athlete_id = updated_session.athlete_id
    workout_session.exercise = updated_session.exercise
    workout_session.date = updated_session.date
    workout_session.duration = updated_session.duration

    session.add(workout_session)
    session.commit()
    session.refresh(workout_session)

    return workout_session

@app.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    session: Session = Depends(get_session)
):
    workout_session = session.get(WorkoutSession, session_id)

    if not workout_session:
        return {"error": "Session not found"}

    session.delete(workout_session)
    session.commit()

    return {"message": "Session deleted successfully"}

@app.get("/athletes/{athlete_id}/sessions")
def get_athlete_sessions(
    athlete_id: int,
    session: Session = Depends(get_session)
):
    athlete = session.get(Athlete, athlete_id)

    if not athlete:
       raise HTTPException(
           status_code=404,
           detail="Athlete not found"
    )

    sessions = session.exec(
        select(WorkoutSession)
        .where(WorkoutSession.athlete_id == athlete_id)
    ).all()

    return sessions

@app.post("/results")
def create_result(
    result: MovementResult,
    session: Session = Depends(get_session)
):
    workout_session = session.get(
        WorkoutSession,
        result.session_id
    )

    if not workout_session:
        return {"error": "Session not found"}

    session.add(result)
    session.commit()
    session.refresh(result)

    return result

@app.get("/results")
def get_results(
    session: Session = Depends(get_session)
):
    results = session.exec(select(MovementResult)).all()
    return results

@app.get("/sessions/{session_id}/results")
def get_session_results(
    session_id: int,
    session: Session = Depends(get_session)
):
    results = session.exec(
        select(MovementResult)
        .where(MovementResult.session_id == session_id)
    ).all()

    return results
