from sqlmodel import SQLModel, Field


class Athlete(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    age: int
    gender: str
    height: float
    weight: float


class WorkoutSession(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    athlete_id: int
    exercise: str
    date: str
    duration: int

class MovementResult(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)

    session_id: int
    exercise: str

    repetitions: int
    angle: float
    direction: str

    form_score: float
    thrust: float

    suggestions: str | None = None