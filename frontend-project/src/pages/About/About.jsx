import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import "./About.css";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about">

      <header className="about-header">
        <Logo />
        <button className="about-back" onClick={() => navigate("/")}>
          ← Back home
        </button>
      </header>

      <main className="about-hero">

        <div className="about-badge">HOW ATHECURE WORKS</div>

        <h1>
          Smarter training,
          <br />
          powered by <span>computer vision.</span>
        </h1>

        <p className="about-intro">
          Athecure uses computer vision to monitor athlete movement in real
          time, calculates training load metrics like ACWR, and flags
          posture or workload patterns that raise injury risk — combining
          your session data with existing datasets and fitness APIs to
          support safer, smarter training decisions.
        </p>

      </main>

      {/* STEP-BY-STEP FLOW */}

      <section className="about-section">

        <h2>The process</h2>

        <div className="about-steps">

          <div className="about-step">
            <span className="step-number">1</span>
            <h3>Record movement</h3>
            <p>
              Use your camera to capture a training session or movement
              pattern — no wearables required.
            </p>
          </div>

          <div className="about-step">
            <span className="step-number">2</span>
            <h3>Computer vision analysis</h3>
            <p>
              Our model tracks joint positions and movement mechanics
              frame-by-frame to assess form and technique.
            </p>
          </div>

          <div className="about-step">
            <span className="step-number">3</span>
            <h3>Calculate metrics</h3>
            <p>
              We compute your Form Score and ACWR (Acute:Chronic Workload
              Ratio) from session and historical training data.
            </p>
          </div>

          <div className="about-step">
            <span className="step-number">4</span>
            <h3>Dashboard insights</h3>
            <p>
              View trends, risk indicators, and training feedback in one
              place — updated after every session.
            </p>
          </div>

        </div>

      </section>

      {/* METRICS EXPLAINED */}

      <section className="about-section about-section-alt">

        <h2>Understanding your metrics</h2>

        <div className="about-metrics">

          <div className="about-metric-card">
            <h3>Form Score</h3>
            <p>
              A composite score reflecting how closely your movement
              technique matches safe, efficient mechanics for your
              sport or exercise.
            </p>
          </div>

          <div className="about-metric-card">
            <h3>ACWR</h3>
            <p>
              Acute:Chronic Workload Ratio compares your recent training
              load to your longer-term average. Values roughly between
              0.8–1.3 are generally considered a lower-risk training zone,
              while sharp spikes can indicate elevated injury risk.
            </p>
          </div>

          <div className="about-metric-card">
            <h3>Risk indicators</h3>
            <p>
              By combining posture analysis with workload trends and
              reference datasets, Athecure flags patterns worth your
              attention before they become injuries.
            </p>
          </div>

        </div>

      </section>

      {/* MISSION */}

      <section className="about-section">

        <h2>Why we built this</h2>

        <p className="about-mission">
          Overuse injuries and poor movement mechanics are among the most
          preventable setbacks in athletic training — but most athletes
          only get feedback after something goes wrong. Athecure exists to
          bring that feedback earlier, using computer vision and workload
          science that were previously limited to professional sports
          science labs.
        </p>

      </section>

      {/* DISCLAIMER */}

      <section className="about-disclaimer">
        <p>
          <strong>Please note:</strong> Athecure provides risk indicators
          and training feedback based on movement and workload data. It
          does not provide medical diagnosis, and is not a substitute for
          professional medical or sports-medicine advice.
        </p>
      </section>

      <div className="about-cta">
        <button className="hero-button" onClick={() => navigate("/login")}>
          Start tracking your performance
        </button>
      </div>

    </div>
  );
}

export default About;