import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const exercises = [
    {
      name: "Squat",
      score: "92%",
      scoreLabel: "Form Score",
      reps: "18",
      sets: "3",
      extra: "Good consistency",
      path: "/dashboard/squat",
    },
    {
      name: "Push-up",
      score: "88%",
      scoreLabel: "Form Score",
      reps: "24",
      sets: "3",
      extra: "Room for improvement",
      path: "/dashboard/push-up",
    },
    {
      name: "Plank",
      score: "02:48",
      scoreLabel: "Hold Time",
      reps: "—",
      sets: "2",
      extra: "Best performance",
      path: "/dashboard/plank",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

      <header className="dashboard-navbar">

        <Logo />

        <div className="dashboard-user">
          Athlete
        </div>

      </header>


      {/* MAIN */}

      <main className="dashboard-main">

        <section className="dashboard-heading">

          <p className="dashboard-label">
            ATHLETE DASHBOARD
          </p>

          <h1>
            Your training dashboard
          </h1>

          <p>
            Select an exercise to view your performance
            and detailed movement information.
          </p>

        </section>


        {/* EXERCISES */}

        <section className="exercise-section">

          <div className="section-heading">

            <h2>
              Your exercises
            </h2>

            <span>
              3 exercises
            </span>

          </div>


          <div className="exercise-grid">

            {exercises.map((exercise) => (

              <div
                key={exercise.name}
                className="exercise-card"
                onClick={() => navigate(exercise.path)}
              >

                <div className="exercise-card-top">

                  <span className="exercise-type">
                    EXERCISE
                  </span>

                  <span className="exercise-arrow">
                    →
                  </span>

                </div>


                <h3>
                  {exercise.name}
                </h3>


                <div className="exercise-score">

                  <div>
                    <small>
                      {exercise.scoreLabel}
                    </small>

                    <strong>
                      {exercise.score}
                    </strong>
                  </div>

                  <span className="score-status">
                    Good
                  </span>

                </div>


                <div className="exercise-info">

                  <div>
                    <small>REPS</small>
                    <strong>{exercise.reps}</strong>
                  </div>

                  <div>
                    <small>SETS</small>
                    <strong>{exercise.sets}</strong>
                  </div>

                </div>


                <div className="exercise-footer">

                  <span>
                    {exercise.extra}
                  </span>

                  <strong>
                    View exercise →
                  </strong>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* TRAINING OVERVIEW */}

        <section className="training-overview">

          <div className="overview-header">

            <div>
              <p className="dashboard-label">
                TRAINING OVERVIEW
              </p>

              <h2>
                Weekly workload
              </h2>
            </div>

            <div className="risk-status">
              <span></span>
              Risk level: Low
            </div>

          </div>


          <div className="overview-content">

            <div className="workload-chart">

              <div className="chart-bars">

                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>

              </div>

              <div className="chart-days">

                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
                <span>S</span>

              </div>

            </div>


            <div className="overview-stats">

              <div>
                <small>ACWR</small>
                <strong>0.92</strong>
              </div>

              <div>
                <small>WEEKLY LOAD</small>
                <strong>78%</strong>
              </div>

              <div>
                <small>TRAINING DAYS</small>
                <strong>5</strong>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;