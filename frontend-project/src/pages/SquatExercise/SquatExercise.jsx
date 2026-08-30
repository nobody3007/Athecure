import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SquatExercise.css";

function SquatExercise() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const sendingRef = useRef(false);

  const [cameraStarted, setCameraStarted] =
    useState(false);

  const [error, setError] = useState("");

  const [reps, setReps] = useState(0);

  const [kneeAngle, setKneeAngle] =
    useState(0);

  const [leftKneeAngle, setLeftKneeAngle] =
    useState(0);

  const [rightKneeAngle, setRightKneeAngle] =
    useState(0);

  const [depth, setDepth] = useState(0);

  const [stage, setStage] =
    useState("up");

  const [form, setForm] =
    useState("Standing");

  const [formScore, setFormScore] =
    useState(0);

  const [command, setCommand] =
    useState("Start the exercise");

  const [suggestions, setSuggestions] =
    useState([]);


  async function startCamera() {

    try {

      setError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
          },
          audio: false,
        });


      videoRef.current.srcObject =
        stream;


      await videoRef.current.play();


      setCameraStarted(true);


      /*
        IMPORTANT:

        Squat uses /ws/squat.
        Neck uses /ws/neck.

        Therefore they receive completely
        different CV analyses.
      */

      const socket = new WebSocket(
        "ws://127.0.0.1:8000/ws/squat"
      );


      socketRef.current = socket;


      socket.onopen = () => {

        console.log(
          "Connected to squat CV backend"
        );

        sendingRef.current = true;

        sendFrame();

      };


      socket.onmessage = (event) => {

        const data =
          JSON.parse(event.data);


        setReps(
          data.reps ?? 0
        );


        setKneeAngle(
          data.kneeAngle ?? 0
        );


        setLeftKneeAngle(
          data.leftKneeAngle ?? 0
        );


        setRightKneeAngle(
          data.rightKneeAngle ?? 0
        );


        setDepth(
          data.depth ?? 0
        );


        setStage(
          data.stage ?? "up"
        );


        setForm(
          data.form ?? ""
        );


        setFormScore(
          data.formScore ?? 0
        );


        setCommand(
          data.command ?? ""
        );


        setSuggestions(
          data.suggestions ?? []
        );


        /*
          Save only valid squat results.

          This keeps squat data completely
          separate from neck data.
        */

        if (data.detected) {

          const squatAnalysis = {

            exercise: "Squat",

            reps:
              data.reps ?? 0,

            kneeAngle:
              data.kneeAngle ?? 0,

            leftKneeAngle:
              data.leftKneeAngle ?? 0,

            rightKneeAngle:
              data.rightKneeAngle ?? 0,

            depth:
              data.depth ?? 0,

            stage:
              data.stage ?? "up",

            form:
              data.form ?? "",

            formScore:
              data.formScore ?? 0,

            command:
              data.command ?? "",

            suggestions:
              data.suggestions ?? [],

            detected:
              true,

            timestamp:
              new Date().toISOString(),

          };


          localStorage.setItem(
            "latestSquatAnalysis",
            JSON.stringify(squatAnalysis)
          );

        }

      };


      socket.onerror = () => {

        setError(
          "Could not connect to the squat CV backend."
        );

      };


      socket.onclose = () => {

        sendingRef.current = false;

        console.log(
          "Squat CV backend disconnected"
        );

      };

    } catch (err) {

      console.error(err);

      setError(
        "Camera permission was denied or the camera could not be opened."
      );

    }

  }


  function sendFrame() {

    if (!sendingRef.current) {
      return;
    }


    const video = videoRef.current;
    const canvas = canvasRef.current;
    const socket = socketRef.current;


    if (
      !video ||
      !canvas ||
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {

      setTimeout(
        sendFrame,
        100
      );

      return;

    }


    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {

      setTimeout(
        sendFrame,
        100
      );

      return;

    }


    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;


    const context =
      canvas.getContext("2d");


    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    const imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.6
      );


    const base64Image =
      imageData.split(",")[1];


    socket.send(
      base64Image
    );


    setTimeout(
      sendFrame,
      100
    );

  }


  useEffect(() => {

    return () => {

      sendingRef.current = false;


      if (
        videoRef.current?.srcObject
      ) {

        videoRef.current.srcObject
          .getTracks()
          .forEach(
            (track) => track.stop()
          );

        videoRef.current.srcObject =
          null;

      }


      if (socketRef.current) {
        socketRef.current.close();
      }

    };

  }, []);


  return (

    <div className="squat-exercise-page">


      {/* HEADER */}

      <header className="squat-exercise-header">

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>


        <h1>
          Squat Exercise
        </h1>


        <span>
          AI Movement Analysis
        </span>

      </header>


      <main className="squat-exercise-main">


        {/* CAMERA */}

        <section className="camera-section">

          <div className="camera-container">

            <video
              ref={videoRef}
              className="camera-video"
              muted
              playsInline
            />


            <canvas
              ref={canvasRef}
              className="hidden-canvas"
            />


            {!cameraStarted && (

              <div className="camera-start">

                <div className="camera-icon">
                  ◉
                </div>


                <h2>
                  Start squat analysis
                </h2>


                <p>
                  Allow camera access so Athecure
                  can analyze your squat movement.
                </p>


                <button
                  type="button"
                  onClick={startCamera}
                >
                  Allow Camera &amp; Start
                </button>

              </div>

            )}


            {cameraStarted && (

              <div className="command-overlay">

                <small>
                  CURRENT INSTRUCTION
                </small>


                <strong>
                  {command}
                </strong>

              </div>

            )}

          </div>


          {error && (

            <p className="camera-error">
              {error}
            </p>

          )}

        </section>


        {/* RESULTS */}

        <section className="results-section">


          <div className="results-heading">

            <p>
              ANALYSIS RESULTS
            </p>

            <h2>
              Squat performance
            </h2>

          </div>


          <div className="metrics-grid">


            <div className="metric-card">

              <small>
                REPS
              </small>

              <strong>
                {reps}
              </strong>

            </div>


            <div className="metric-card">

              <small>
                KNEE ANGLE
              </small>

              <strong>
                {kneeAngle}°
              </strong>

            </div>


            <div className="metric-card">

              <small>
                DEPTH
              </small>

              <strong>
                {depth}%
              </strong>

            </div>


            <div className="metric-card">

              <small>
                FORM SCORE
              </small>

              <strong>
                {formScore}%
              </strong>

            </div>

          </div>


          <div className="movement-status">


            <div>

              <small>
                STAGE
              </small>

              <strong>
                {stage}
              </strong>

            </div>


            <div>

              <small>
                FORM
              </small>

              <strong>
                {form}
              </strong>

            </div>

          </div>


          <div className="leg-angles">


            <div>

              <small>
                LEFT KNEE
              </small>

              <strong>
                {leftKneeAngle}°
              </strong>

            </div>


            <div>

              <small>
                RIGHT KNEE
              </small>

              <strong>
                {rightKneeAngle}°
              </strong>

            </div>

          </div>


          <div className="suggestions-card">

            <p>
              SUGGESTIONS
            </p>


            {suggestions.length > 0 ? (

              suggestions.map(
                (suggestion, index) => (

                  <div
                    key={index}
                    className="suggestion"
                  >

                    <span>
                      ✓
                    </span>

                    {suggestion}

                  </div>

                )
              )

            ) : (

              <div className="suggestion">

                <span>
                  ✓
                </span>

                Waiting for squat analysis...

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default SquatExercise;