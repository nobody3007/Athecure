import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import "./Index.css";

function Index() {
  const navigate = useNavigate();

  return (
    <div className="index-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="index-navbar">

        <div className="index-navbar-logo">
          <Logo />
        </div>

      </header>


      {/* =========================
          HERO
      ========================= */}

      <main>

        <section className="index-hero">

          {/* =========================
              LEFT SIDE
          ========================= */}

          <div className="index-hero-left">

            <div className="index-badge">
              ATHLETE PERFORMANCE PLATFORM
            </div>

            <h1>
              Train smarter.
              <br />
              Move <span>safer.</span>
            </h1>

            <p className="index-hero-description">
              AI-powered movement analysis, workload tracking,
              and injury prevention to help athletes perform
              better and stay injury-free.
            </p>


            {/* BUTTONS */}

            <div className="index-hero-actions">

              <button
                type="button"
                className="index-primary-button"
                onClick={() => navigate("/login")}
              >
                <span>
                  Start tracking your performance
                </span>

                <strong>
                  →
                </strong>
              </button>


              <button
                type="button"
                className="index-secondary-button"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How It Works
              </button>

            </div>


            {/* FEATURES */}

            <div
              className="index-features"
              id="features"
            >

              <div className="index-feature">

                <div className="index-feature-icon">
                  ✦
                </div>

                <div>

                  <h3>
                    Movement Analysis
                  </h3>

                  <p>
                    Real-time pose analysis
                    <br />
                    and form feedback
                  </p>

                </div>

              </div>


              <div className="index-feature">

                <div className="index-feature-icon">
                  ▥
                </div>

                <div>

                  <h3>
                    Workload Tracking
                  </h3>

                  <p>
                    ACWR monitoring and
                    <br />
                    training load insights
                  </p>

                </div>

              </div>


              <div className="index-feature">

                <div className="index-feature-icon">
                  ◇
                </div>

                <div>

                  <h3>
                    Injury Prevention
                  </h3>

                  <p>
                    Risk assessment and
                    <br />
                    actionable recommendations
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =========================
              RIGHT SIDE
          ========================= */}

          <div className="index-hero-right">

            {/* Decorative circles */}

            <div className="index-visual-ring index-ring-one"></div>

            <div className="index-visual-ring index-ring-two"></div>

            <span className="index-visual-cross index-cross-one">
              +
            </span>

            <span className="index-visual-cross index-cross-two">
              +
            </span>


            {/* =========================
                ATHLETE IMAGE
            ========================= */}

            <img
              src="/runner.png"
              alt="Athlete movement analysis"
              className="index-athlete-image"
            />


            {/* =========================
                FORM SCORE
            ========================= */}

            <div className="index-stat-card index-form-card">

              <small>
                Form Score
              </small>

              <div className="index-score-circle">
                <strong>
                  92%
                </strong>
              </div>

              <span className="index-stat-subtext">
                Good
              </span>

            </div>


            {/* =========================
                INJURY RISK
            ========================= */}

            <div className="index-stat-card index-risk-card">

              <small>
                Injury Risk
              </small>

              <div className="index-risk-row">

                <div className="index-shield">
                  ◇
                </div>

                <strong>
                  Low
                </strong>

              </div>

              <span className="index-stat-subtext">
                Good to train
              </span>

            </div>


            {/* =========================
                ACWR
            ========================= */}

            <div className="index-stat-card index-acwr-card">

              <small>
                ACWR
              </small>

              <strong className="index-acwr-value">
                0.92
              </strong>

              <span className="index-acwr-good">
                Optimal
              </span>

            </div>


            {/* =========================
                TRAINING LOAD
            ========================= */}

            <div className="index-stat-card index-load-card">

              <small>
                Training Load
              </small>

              <div className="index-load-chart">

                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>

              </div>

              <span className="index-load-status">
                Moderate
              </span>

            </div>

          </div>

        </section>


        {/* =========================
            BOTTOM BENEFITS
        ========================= */}

        <section className="index-benefits">

          <div className="index-benefit">

            <div className="index-benefit-icon">
              ◇
            </div>

            <div>

              <h3>
                Prevent Injuries
              </h3>

              <p>
                Identify risks early and
                <br />
                reduce injury chances
              </p>

            </div>

          </div>


          <div className="index-benefit">

            <div className="index-benefit-icon">
              ↗
            </div>

            <div>

              <h3>
                Improve Performance
              </h3>

              <p>
                Track progress and optimize
                <br />
                every movement
              </p>

            </div>

          </div>


          <div className="index-benefit">

            <div className="index-benefit-icon">
              ●●
            </div>

            <div>

              <h3>
                For Athletes & Coaches
              </h3>

              <p>
                Smart insights for better
                <br />
                decisions and results
              </p>

            </div>

          </div>

        </section>


        <div id="how-it-works"></div>
        <div id="about"></div>
        <div id="contact"></div>

      </main>

    </div>
  );
}

export default Index;