import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import "./Athlete.css";

function AthletePerformance() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [sport, setSport] = useState("");
  const [trainingDays, setTrainingDays] = useState(5);
  const [sessionDuration, setSessionDuration] = useState("60");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState([]);

  function handleGoalChange(goal) {
    setGoals((currentGoals) => {
      if (currentGoals.includes(goal)) {
        return currentGoals.filter((item) => item !== goal);
      }

      return [...currentGoals, goal];
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const athleteData = {
      username,
      sport,
      trainingDays,
      sessionDuration,
      experience,
      goals,
    };

    localStorage.setItem(
      "athleteData",
      JSON.stringify(athleteData)
    );

    navigate("/dashboard");
  }

  return (
    <div className="athlete-performance-page">

      <header className="athlete-performance-navbar">
        <Logo />
      </header>

      <main className="athlete-performance-main">

        <div className="athlete-performance-container">

          <div className="athlete-performance-heading">
            <p className="athlete-performance-label">
              ATHLETE PERFORMANCE
            </p>

            <h1>
              Let's set up your profile.
            </h1>

            <p>
              Tell us a little about yourself so we can
              personalize your training experience.
            </p>
          </div>


          <form
            className="athlete-performance-form"
            onSubmit={handleSubmit}
          >

            {/* BASIC INFORMATION */}

            <section className="profile-section">

              <div className="profile-section-heading">
                <h2>Basic information</h2>
                <p>Tell us about yourself.</p>
              </div>


              <div className="form-group">

                <label htmlFor="username">
                  Name
                </label>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  required
                />

              </div>


              <div className="form-group">

                <label htmlFor="sport">
                  Sport
                </label>

                <select
                  id="sport"
                  value={sport}
                  onChange={(event) =>
                    setSport(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select your sport
                  </option>

                  <option value="Football">
                    Football
                  </option>

                  <option value="Cricket">
                    Cricket
                  </option>

                  <option value="Basketball">
                    Basketball
                  </option>

                  <option value="Athletics">
                    Athletics
                  </option>

                  <option value="Gym / Fitness">
                    Gym / Fitness
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>

            </section>


            {/* TRAINING */}

            <section className="profile-section">

              <div className="profile-section-heading">
                <h2>Training</h2>
                <p>Tell us about your current routine.</p>
              </div>


              <div className="form-group">

                <label htmlFor="trainingDays">
                  Training days per week
                </label>

                <div className="number-control">

                  <button
                    type="button"
                    onClick={() =>
                      setTrainingDays(
                        Math.max(1, trainingDays - 1)
                      )
                    }
                  >
                    −
                  </button>

                  <span>
                    {trainingDays}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setTrainingDays(
                        Math.min(7, trainingDays + 1)
                      )
                    }
                  >
                    +
                  </button>

                </div>

              </div>


              <div className="form-group">

                <label htmlFor="sessionDuration">
                  Average session duration
                </label>

                <select
                  id="sessionDuration"
                  value={sessionDuration}
                  onChange={(event) =>
                    setSessionDuration(event.target.value)
                  }
                >
                  <option value="30">
                    30 minutes
                  </option>

                  <option value="45">
                    45 minutes
                  </option>

                  <option value="60">
                    60 minutes
                  </option>

                  <option value="90">
                    90 minutes
                  </option>

                  <option value="120">
                    120+ minutes
                  </option>
                </select>

              </div>


              <div className="form-group">

                <label>
                  Training experience
                </label>

                <div className="experience-options">

                  <label className="choice-option">
                    <input
                      type="radio"
                      name="experience"
                      value="Beginner"
                      checked={experience === "Beginner"}
                      onChange={(event) =>
                        setExperience(event.target.value)
                      }
                      required
                    />
                    <span>Beginner</span>
                  </label>


                  <label className="choice-option">
                    <input
                      type="radio"
                      name="experience"
                      value="Intermediate"
                      checked={experience === "Intermediate"}
                      onChange={(event) =>
                        setExperience(event.target.value)
                      }
                    />
                    <span>Intermediate</span>
                  </label>


                  <label className="choice-option">
                    <input
                      type="radio"
                      name="experience"
                      value="Advanced"
                      checked={experience === "Advanced"}
                      onChange={(event) =>
                        setExperience(event.target.value)
                      }
                    />
                    <span>Advanced</span>
                  </label>

                </div>

              </div>

            </section>


            {/* FITNESS GOALS */}

            <section className="profile-section">

              <div className="profile-section-heading">
                <h2>Fitness goals</h2>
                <p>
                  What would you like to improve?
                </p>
              </div>


              <div className="goal-grid">

                {[
                  "Strength",
                  "Endurance",
                  "Performance",
                  "Mobility",
                  "Technique",
                ].map((goal) => (

                  <button
                    key={goal}
                    type="button"
                    className={`goal-option ${
                      goals.includes(goal)
                        ? "goal-selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleGoalChange(goal)
                    }
                  >
                    {goal}
                  </button>

                ))}

              </div>

            </section>


            <button
              type="submit"
              className="continue-button"
            >
              Continue
              <span>→</span>
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

export default AthletePerformance;