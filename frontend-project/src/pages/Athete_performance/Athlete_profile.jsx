import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo/Logo";
import "./Athlete.css";

function AthletePerformance() {
  const navigate = useNavigate();

  // Basic information
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [sport, setSport] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Training information
  const [trainingDays, setTrainingDays] = useState(5);
  const [sessionDuration, setSessionDuration] = useState("60");
  const [experience, setExperience] = useState("");

  // Goals
  const [goals, setGoals] = useState([]);
  const [otherGoal, setOtherGoal] = useState("");

  // Advanced settings
  const [intensity, setIntensity] = useState("");
  const [familiarity, setFamiliarity] = useState("");
  const [previousInjury, setPreviousInjury] = useState("");
  const [yearsTraining, setYearsTraining] = useState("");
  const [trainingEnvironment, setTrainingEnvironment] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  function handleGoalChange(goal) {
    setGoals((currentGoals) => {
      if (currentGoals.includes(goal)) {
        return currentGoals.filter((item) => item !== goal);
      }

      return [...currentGoals, goal];
    });
  }

  function handleEquipmentChange(item) {
    setEquipment((currentEquipment) => {
      if (currentEquipment.includes(item)) {
        return currentEquipment.filter(
          (equipmentItem) => equipmentItem !== item
        );
      }

      return [...currentEquipment, item];
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (goals.length === 0 && otherGoal.trim() === "") {
      alert("Please select at least one fitness goal.");
      return;
    }

    const athleteData = {
      username,
      age,
      sport,
      height,
      weight,
      trainingDays,
      sessionDuration,
      experience,
      goals,
      otherGoal,
      intensity,
      familiarity,
      previousInjury,
      yearsTraining,
      trainingEnvironment,
      equipment,
      additionalInfo,
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

          {/* PAGE HEADING */}

          <div className="athlete-performance-heading">

            <p className="athlete-performance-label">
              ATHLETE PERFORMANCE
            </p>

            <h1>
              Let's set up your profile.
            </h1>

            <p>
              Tell us about yourself so we can personalize
              your training experience and help you perform
              at your best.
            </p>

          </div>


          <form
            className="athlete-performance-form"
            onSubmit={handleSubmit}
          >

            {/* =========================
                BASIC INFORMATION
            ========================= */}

            <section className="profile-section">

              <div className="profile-section-heading">

                <div>
                  <h2>Basic information</h2>

                  <p>
                    These details help us understand you better.
                  </p>
                </div>

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label htmlFor="username">
                    Name <span>*</span>
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

                  <label htmlFor="age">
                    Age <span>*</span>
                  </label>

                  <input
                    id="age"
                    type="number"
                    min="10"
                    max="100"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(event) =>
                      setAge(event.target.value)
                    }
                    required
                  />

                </div>

              </div>


              <div className="form-group">

                <label htmlFor="sport">
                  Sport <span>*</span>
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

                  <option value="Badminton">
                    Badminton
                  </option>

                  <option value="Tennis">
                    Tennis
                  </option>

                  <option value="Swimming">
                    Swimming
                  </option>

                  <option value="Gym / Fitness">
                    Gym / Fitness
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label htmlFor="height">
                    Height <small>(optional)</small>
                  </label>

                  <div className="input-with-unit">

                    <input
                      id="height"
                      type="number"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(event) =>
                        setHeight(event.target.value)
                      }
                    />

                    <span>cm</span>

                  </div>

                </div>


                <div className="form-group">

                  <label htmlFor="weight">
                    Weight <small>(optional)</small>
                  </label>

                  <div className="input-with-unit">

                    <input
                      id="weight"
                      type="number"
                      placeholder="e.g. 68"
                      value={weight}
                      onChange={(event) =>
                        setWeight(event.target.value)
                      }
                    />

                    <span>kg</span>

                  </div>

                </div>

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label htmlFor="trainingDays">
                    Training days per week <span>*</span>
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
                    Average session duration <span>*</span>
                  </label>

                  <select
                    id="sessionDuration"
                    value={sessionDuration}
                    onChange={(event) =>
                      setSessionDuration(event.target.value)
                    }
                    required
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

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label>
                    Training experience <span>*</span>
                  </label>

                  <div className="experience-options">

                    <label className="choice-option">

                      <input
                        type="radio"
                        name="experience"
                        value="Beginner"
                        checked={
                          experience === "Beginner"
                        }
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
                        checked={
                          experience === "Intermediate"
                        }
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
                        checked={
                          experience === "Advanced"
                        }
                        onChange={(event) =>
                          setExperience(event.target.value)
                        }
                      />

                      <span>Advanced</span>

                    </label>

                  </div>

                </div>


                <div className="form-group">

                  <label>
                    Primary fitness goal <span>*</span>
                  </label>

                  <div className="goal-grid">

                    {[
                      "Strength",
                      "Endurance",
                      "Performance",
                      "Mobility",
                      "Technique",
                      "Recovery",
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

                </div>

              </div>

            </section>


            {/* =========================
                ADVANCED SETTINGS
            ========================= */}

            <details className="advanced-settings">

              <summary>

                <div>

                  <strong>
                    Advanced settings
                  </strong>

                  <span>
                    Provide more details for deeper personalization.
                  </span>

                </div>

                <span className="advanced-arrow">
                  ↓
                </span>

              </summary>


              <div className="advanced-content">


                {/* TRAINING INTENSITY */}

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Typical training intensity
                    </label>

                    <div className="intensity-options">

                      {[
                        "Low",
                        "Moderate",
                        "High",
                      ].map((level) => (

                        <button
                          key={level}
                          type="button"
                          className={`intensity-option ${
                            intensity === level
                              ? "selected-option"
                              : ""
                          }`}
                          onClick={() =>
                            setIntensity(level)
                          }
                        >
                          {level}
                        </button>

                      ))}

                    </div>

                  </div>


                  {/* EXERCISE FAMILIARITY */}

                  <div className="form-group">

                    <label>
                      Exercise familiarity
                    </label>

                    <div className="experience-options">

                      {[
                        "New to exercise",
                        "Some experience",
                        "Experienced",
                      ].map((level) => (

                        <label
                          key={level}
                          className="choice-option"
                        >

                          <input
                            type="radio"
                            name="familiarity"
                            value={level}
                            checked={
                              familiarity === level
                            }
                            onChange={(event) =>
                              setFamiliarity(
                                event.target.value
                              )
                            }
                          />

                          <span>
                            {level}
                          </span>

                        </label>

                      ))}

                    </div>

                  </div>

                </div>


                {/* INJURY + YEARS */}

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="previousInjury">
                      Previous injury or movement limitation
                    </label>

                    <select
                      id="previousInjury"
                      value={previousInjury}
                      onChange={(event) =>
                        setPreviousInjury(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select an option
                      </option>

                      <option value="None">
                        None
                      </option>

                      <option value="Knee">
                        Knee
                      </option>

                      <option value="Shoulder">
                        Shoulder
                      </option>

                      <option value="Lower back">
                        Lower back
                      </option>

                      <option value="Neck">
                        Neck
                      </option>

                      <option value="Ankle">
                        Ankle
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>

                    <small className="field-help">
                      You can select "None" if not applicable.
                    </small>

                  </div>


                  <div className="form-group">

                    <label htmlFor="yearsTraining">
                      Years of training experience
                    </label>

                    <select
                      id="yearsTraining"
                      value={yearsTraining}
                      onChange={(event) =>
                        setYearsTraining(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Select an option
                      </option>

                      <option value="Less than 1 year">
                        Less than 1 year
                      </option>

                      <option value="1-3 years">
                        1–3 years
                      </option>

                      <option value="3-5 years">
                        3–5 years
                      </option>

                      <option value="5+ years">
                        5+ years
                      </option>
                    </select>

                  </div>

                </div>


                {/* ENVIRONMENT */}

                <div className="form-group">

                  <label htmlFor="trainingEnvironment">
                    Preferred training environment
                  </label>

                  <select
                    id="trainingEnvironment"
                    value={trainingEnvironment}
                    onChange={(event) =>
                      setTrainingEnvironment(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Select an option
                    </option>

                    <option value="Gym">
                      Gym
                    </option>

                    <option value="Home">
                      Home
                    </option>

                    <option value="Field / Track">
                      Field / Track
                    </option>

                    <option value="Multiple">
                      Multiple locations
                    </option>
                  </select>

                </div>


                {/* EQUIPMENT */}

                <div className="form-group">

                  <label>
                    Equipment available
                  </label>

                  <div className="equipment-grid">

                    {[
                      "None",
                      "Dumbbells",
                      "Barbell",
                      "Resistance bands",
                      "Machines",
                      "Other",
                    ].map((item) => (

                      <label
                        key={item}
                        className="equipment-option"
                      >

                        <input
                          type="checkbox"
                          checked={equipment.includes(item)}
                          onChange={() =>
                            handleEquipmentChange(item)
                          }
                        />

                        <span>
                          {item}
                        </span>

                      </label>

                    ))}

                  </div>

                </div>


                {/* OTHER GOAL */}

                <div className="form-group">

                  <label htmlFor="otherGoal">
                    Other goal
                    <small> (optional)</small>
                  </label>

                  <input
                    id="otherGoal"
                    type="text"
                    placeholder="Tell us your specific goal..."
                    value={otherGoal}
                    onChange={(event) =>
                      setOtherGoal(event.target.value)
                    }
                  />

                </div>


                {/* ADDITIONAL INFORMATION */}

                <div className="form-group">

                  <label htmlFor="additionalInfo">
                    Anything else you'd like to tell us?
                    <small> (optional)</small>
                  </label>

                  <textarea
                    id="additionalInfo"
                    placeholder="Specific goals, equipment you have, preferences, or anything else that may help us personalize your training."
                    value={additionalInfo}
                    onChange={(event) =>
                      setAdditionalInfo(event.target.value)
                    }
                    rows="4"
                  />

                </div>

              </div>

            </details>


            {/* =========================
                COMPLETE
            ========================= */}

            <button
              type="submit"
              className="continue-button"
            >
              Complete Setup
              <span>→</span>
            </button>


            <p className="privacy-note">
              Your information is private and secure.
            </p>

          </form>

        </div>

      </main>

    </div>
  );
}

export default AthletePerformance;