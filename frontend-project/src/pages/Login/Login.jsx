import PasswordGenerator from "../../components/random_password";
import { useState } from "react";
import Logo from "../../components/Logo/Logo";
import "./Login.css";

function Login() {
  const [password, setPassword] = useState("");
   const [email, setEmail] = useState("");

  function login(event) {
    event.preventDefault();

    localStorage.setItem("email", email);
    localStorage.setItem("password", password);

    console.log("Email and password stored");
  }

  return (
    <div className="login-page">

      <section className="login-left">

        <div className="login-logo">
          <Logo />
        </div>

        <div className="login-left-content">

          <div className="login-label">
            ATHLETE PERFORMANCE PLATFORM
          </div>

          <h1>
            Train smarter.
            <br />
            Move <span>safer.</span>
          </h1>

          <p>
            Monitor your movement, training workload,
            and performance to support safer and
            smarter training.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <span className="feature-check">✓</span>
              <span>Movement analysis</span>
            </div>

            <div className="login-feature">
              <span className="feature-check">✓</span>
              <span>Training workload tracking</span>
            </div>

            <div className="login-feature">
              <span className="feature-check">✓</span>
              <span>Performance tracking</span>
            </div>

          </div>

        </div>


        {/* PERFORMANCE CARD */}

        <div className="performance-card">

          <div className="performance-header">

            <span>PERFORMANCE OVERVIEW</span>

            <span className="performance-status">
              <span></span>
              Good
            </span>

          </div>


          <div className="performance-content">

            <div className="performance-metric">

              <small>FORM SCORE</small>

              <strong>92%</strong>

              <p>↑ 8% vs last week</p>

            </div>


            <div className="performance-divider"></div>


            <div className="performance-metric">

              <small>ACWR</small>

              <strong>0.92</strong>

              <p>Optimal</p>

            </div>


            <div className="performance-divider"></div>


            <div className="weekly-load">

              <small>WEEKLY LOAD</small>

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

          </div>


          <div className="performance-footer">
            Weekly Training Load
          </div>

        </div>

      </section>


      <section className="login-right">

        <div className="login-box">

          <div className="mobile-login-logo">
            <Logo />
          </div>


          <div className="login-heading">

            <h2>Sign in</h2>

            <p>
              Sign in to your Athecure account.
            </p>

          </div>


          <form className="login-form" onsubmit={login}>

            <div className="input-group">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />

            </div>


            <div className="input-group">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <PasswordGenerator onGenerate={setPassword} />

              </div>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

            </div>


            <button
              type="submit"
              className="login-button"
            >
              <span>Sign In</span>

              <span className="login-arrow">
                →
              </span>

            </button>

          </form>

        </div>

      </section>

    </div>
  );
}

export default Login;