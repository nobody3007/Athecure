import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import "./Index.css";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="home">

      <header className="home-header">
        <Logo />
      </header>

      <main className="hero">
        <div className="hero-content">

          <div className="hero-badge">
            ATHLETE PERFORMANCE PLATFORM
          </div>

          <h1>
            Train smarter.
            <br />
            Move <span>safer.</span>
          </h1>

          <p>
            Athecure helps athletes monitor movement,
            training workload, and performance to support
            safer and smarter training.
          </p>

          <div className="hero-buttons">
            <button className="hero-button"
            onClick={() => navigate("/login")}>
              Start tracking your performance
            </button>

            <button
              className="secondary-button"
              onClick={() => navigate("/about")}
            >
              See How It Works
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}

export default Home;