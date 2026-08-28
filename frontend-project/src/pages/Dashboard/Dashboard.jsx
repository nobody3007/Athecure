import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const athleteData = JSON.parse(
    localStorage.getItem("athleteData") || "{}"
  );

  const username = athleteData.username || "Athlete";
  const sport = athleteData.sport || "Sport not set";
  const experience = athleteData.experience || "Experience not set";
  const trainingDays = athleteData.trainingDays || 0;

  const exercises = [
    {
      name: "Neck Exercise",
      description: "Track neck angle, movement and repetitions.",
      status: "Ready to analyze",
      path: "/dashboard/neck",
    },
    {
      name: "Squat",
      description:
        "Track squat depth, alignment and rep consistency.",
      status: "Ready to analyze",
      path: "/dashboard/squat",
    },
    {
      name: "Plank",
      description:
        "Track hold time, form and body alignment.",
      status: "Ready to analyze",
      path: "/dashboard/plank",
    },
  ];

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="dashboard-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-logo">
          <Logo />
        </div>

        <nav className="dashboard-nav">

          <button
            type="button"
            className="nav-item active"
            onClick={() => scrollToSection("overview")}
          >
            <span>⌂</span>
            <span>Overview</span>
          </button>


          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("movement")}
          >
            <span>◫</span>
            <span>Movement</span>
          </button>


          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("progress")}
          >
            <span>↗</span>
            <span>Progress</span>
          </button>


          <button
            type="button"
            className="nav-item"
            onClick={() => scrollToSection("risk")}
          >
            <span>◉</span>
            <span>Risk</span>
          </button>

        </nav>

      </aside>


      {/* =========================
          MAIN AREA
      ========================= */}

      <div className="dashboard-content-area">

        {/* =========================
            HEADER
        ========================= */}

        <header className="dashboard-header">

          <div className="mobile-dashboard-logo">
            <Logo />
          </div>


          <div className="dashboard-profile">

            <div className="profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">

              <strong>
                {username}
              </strong>

              <span>
                {sport}
              </span>

            </div>

          </div>

        </header>


        {/* =========================
            MAIN
        ========================= */}

        <main className="dashboard-main">


          {/* =========================
              OVERVIEW
          ========================= */}

          <section
            id="overview"
            className="dashboard-heading dashboard-section"
          >

            <p className="dashboard-label">
              ATHLETE DASHBOARD
            </p>

            <h1>
              Your performance overview
            </h1>

            <p>
              Track your movement, workload, and progress
              from one place.
            </p>


            <div className="athlete-summary">

              <span>
                {sport}
              </span>

              <span>
                •
              </span>

              <span>
                {experience}
              </span>

              <span>
                •
              </span>

              <span>
                {trainingDays} training days/week
              </span>

            </div>

          </section>


          {/* =========================
              SUMMARY CARDS
          ========================= */}

          <section className="summary-grid">

            <div className="summary-card">

              <small>
                FORM SCORE
              </small>

              <strong>
                92%
              </strong>

              <span className="positive">
                ↑ 8% this week
              </span>

            </div>


            <div className="summary-card">

              <small>
                ACWR
              </small>

              <strong>
                0.92
              </strong>

              <span className="positive">
                Optimal
              </span>

            </div>


            <div className="summary-card">

              <small>
                TRAINING LOAD
              </small>

              <strong>
                78%
              </strong>

              <span className="neutral">
                Moderate
              </span>

            </div>


            <div className="summary-card">

              <small>
                INJURY RISK
              </small>

              <strong>
                Low
              </strong>

              <span className="positive">
                Good
              </span>

            </div>


            <div className="summary-card">

              <small>
                READINESS
              </small>

              <strong>
                82
                <span className="score-small">
                  /100
                </span>
              </strong>

              <span className="positive">
                Good
              </span>

            </div>

          </section>


          {/* =========================
              READINESS + WEEKLY LOAD
          ========================= */}

          <section className="overview-grid">


            {/* READINESS */}

            <div className="readiness-card">

              <div className="section-title">

                <div>

                  <p className="dashboard-label">
                    TODAY'S READINESS
                  </p>

                  <h2>
                    Ready for training
                  </h2>

                </div>

              </div>


              <div className="readiness-list">

                <div className="readiness-row">

                  <span>
                    Sleep
                  </span>

                  <strong>
                    7.4 h
                  </strong>

                  <small className="positive">
                    Good
                  </small>

                </div>


                <div className="readiness-row">

                  <span>
                    Soreness
                  </span>

                  <strong>
                    2 / 10
                  </strong>

                  <small className="positive">
                    Low
                  </small>

                </div>


                <div className="readiness-row">

                  <span>
                    Training Load
                  </span>

                  <strong>
                    Moderate
                  </strong>

                  <small className="neutral">
                    Stable
                  </small>

                </div>

              </div>


              <div className="readiness-message">

                <span>
                  ✓
                </span>

                <p>
                  You're ready for today's planned session.
                </p>

              </div>

            </div>


            {/* WEEKLY LOAD */}

            <div className="weekly-card">

              <div className="weekly-header">

                <div>

                  <p className="dashboard-label">
                    TRAINING LOAD
                  </p>

                  <h2>
                    Weekly Training Load &amp; ACWR
                  </h2>

                </div>

                <span>
                  Last 7 days
                </span>

              </div>


              <div className="acwr-display">

                <div>

                  <small>
                    ACWR
                  </small>

                  <strong>
                    0.92
                  </strong>

                </div>


                <div className="acwr-scale">

                  <div className="scale-line"></div>

                  <div className="scale-marker">
                    0.92
                  </div>

                  <div className="scale-labels">

                    <span>
                      Low
                    </span>

                    <span>
                      Optimal
                    </span>

                    <span>
                      High
                    </span>

                    <span>
                      Very High
                    </span>

                  </div>

                </div>

              </div>


              <div className="weekly-chart">

                <div
                  className="weekly-bar"
                  style={{ height: "40%" }}
                >
                  <span>Mon</span>
                </div>

                <div
                  className="weekly-bar"
                  style={{ height: "55%" }}
                >
                  <span>Tue</span>
                </div>

                <div
                  className="weekly-bar"
                  style={{ height: "48%" }}
                >
                  <span>Wed</span>
                </div>

                <div
                  className="weekly-bar"
                  style={{ height: "67%" }}
                >
                  <span>Thu</span>
                </div>

                <div
                  className="weekly-bar"
                  style={{ height: "59%" }}
                >
                  <span>Fri</span>
                </div>

                <div
                  className="weekly-bar"
                  style={{ height: "79%" }}
                >
                  <span>Sat</span>
                </div>

                <div
                  className="weekly-bar"
                  style={{ height: "88%" }}
                >
                  <span>Sun</span>
                </div>

              </div>

            </div>

          </section>


          {/* =========================
              MOVEMENT
          ========================= */}

          <section
            id="movement"
            className="exercise-section dashboard-section"
          >

            <div className="section-heading">

              <div>

                <p className="dashboard-label">
                  MOVEMENT ANALYSIS
                </p>

                <h2>
                  Your exercises
                </h2>

                <p>
                  Select an exercise to start a movement
                  analysis session.
                </p>

              </div>

              <span className="exercise-count">
                3 exercises
              </span>

            </div>


            <div className="exercise-grid">

              {exercises.map((exercise) => (

                <article
                  key={exercise.name}
                  className="exercise-card"
                  onClick={() =>
                    navigate(exercise.path)
                  }
                >

                  <div className="exercise-card-top">

                    <span className="exercise-tag">
                      CV ANALYSIS
                    </span>

                    <span className="exercise-arrow">
                      →
                    </span>

                  </div>


                  <h3>
                    {exercise.name}
                  </h3>


                  <p className="exercise-description">
                    {exercise.description}
                  </p>


                  <div className="exercise-demo">

                    <div>

                      <small>
                        LAST SESSION
                      </small>

                      <strong>
                        —
                      </strong>

                    </div>


                    <div>

                      <small>
                        FORM
                      </small>

                      <strong>
                        —
                      </strong>

                    </div>


                    <div>

                      <small>
                        REPS
                      </small>

                      <strong>
                        —
                      </strong>

                    </div>

                  </div>


                  <div className="exercise-card-footer">

                    <span>
                      {exercise.status}
                    </span>

                    <strong>
                      Start Analysis →
                    </strong>

                  </div>

                </article>

              ))}

            </div>

          </section>


          {/* =========================
              AI MOVEMENT ANALYSIS
          ========================= */}

          <section className="analysis-banner">

            <div>

              <p className="dashboard-label">
                AI MOVEMENT ANALYSIS
              </p>

              <h2>
                Analyze your movement in real time.
              </h2>

              <p>
                Use your camera to track repetitions,
                movement angles, form quality, and
                receive personalized feedback.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard/analysis")
                }
              >
                Start Analysis

                <span>
                  →
                </span>

              </button>

            </div>


            <div className="analysis-placeholder">

              <div className="analysis-circle">
                +
              </div>

              <span>
                Camera analysis
              </span>

            </div>

          </section>


          {/* =========================
              PROGRESS
          ========================= */}

          <section
            id="progress"
            className="dashboard-panel dashboard-section"
          >

            <div className="panel-heading">

              <div>

                <p className="dashboard-label">
                  PROGRESS
                </p>

                <h2>
                  Your performance progress
                </h2>

                <p>
                  Track how your movement quality and
                  exercise performance change over time.
                </p>

              </div>

              <span>
                Last 4 weeks
              </span>

            </div>


            <div className="progress-content">


              <div className="progress-chart">

                <div className="progress-values">

                  <span
                    style={{
                      left: "5%",
                      bottom: "25%",
                    }}
                  >
                    81%
                  </span>

                  <span
                    style={{
                      left: "32%",
                      bottom: "40%",
                    }}
                  >
                    85%
                  </span>

                  <span
                    style={{
                      left: "59%",
                      bottom: "57%",
                    }}
                  >
                    89%
                  </span>

                  <span
                    style={{
                      left: "87%",
                      bottom: "70%",
                    }}
                  >
                    92%
                  </span>

                </div>


                <div className="progress-trend">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>


                <div className="progress-days">

                  <span>
                    Week 1
                  </span>

                  <span>
                    Week 2
                  </span>

                  <span>
                    Week 3
                  </span>

                  <span>
                    This Week
                  </span>

                </div>

              </div>


              <div className="progress-stats">

                <div>

                  <small>
                    Squat Depth
                  </small>

                  <strong>
                    89°
                  </strong>

                  <span className="positive">
                    ↑ 11%
                  </span>

                </div>


                <div>

                  <small>
                    Plank Endurance
                  </small>

                  <strong>
                    2:42
                  </strong>

                  <span className="positive">
                    ↑ 20%
                  </span>

                </div>


                <div>

                  <small>
                    Rep Consistency
                  </small>

                  <strong>
                    94%
                  </strong>

                  <span className="positive">
                    ↑ 8%
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* =========================
              RISK
          ========================= */}

          <section
            id="risk"
            className="dashboard-panel dashboard-section"
          >

            <div className="panel-heading">

              <div>

                <p className="dashboard-label">
                  INJURY RISK
                </p>

                <h2>
                  Injury risk assessment
                </h2>

                <p>
                  A summary of movement quality,
                  workload, recovery, and other
                  available indicators.
                </p>

              </div>


              <div className="risk-status large">

                <span></span>

                Low Risk

              </div>

            </div>


            <div className="risk-content">


              <div className="risk-overall">

                <small>
                  OVERALL RISK
                </small>

                <strong>
                  LOW
                </strong>

                <p>
                  Current indicators suggest a low
                  training risk level.
                </p>

              </div>


              <div className="risk-factors">

                <div>

                  <span>
                    Movement Quality
                  </span>

                  <strong className="positive">
                    Good
                  </strong>

                </div>


                <div>

                  <span>
                    Training Load
                  </span>

                  <strong className="positive">
                    0.92 · Optimal
                  </strong>

                </div>


                <div>

                  <span>
                    Recovery
                  </span>

                  <strong className="positive">
                    Good
                  </strong>

                </div>


                <div>

                  <span>
                    Previous Injury
                  </span>

                  <strong>
                    None
                  </strong>

                </div>


                <div>

                  <span>
                    Load Spike
                  </span>

                  <strong className="positive">
                    Low
                  </strong>

                </div>

              </div>

            </div>


            <div className="risk-recommendation">

              <small>
                RECOMMENDATION
              </small>

              <p>
                Maintain consistent training volume
                and continue monitoring movement quality.
              </p>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;