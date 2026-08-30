import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NeckExercise.css";

function NeckExercise() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const sendingRef = useRef(false);

  const [cameraStarted, setCameraStarted] =
    useState(false);

  const [error, setError] = useState("");

  const [reps, setReps] = useState(0);
  const [angle, setAngle] = useState(0);
  const [direction, setDirection] =
    useState("unknown");

  const [command, setCommand] =
    useState("Start the exercise");

  const [formScore, setFormScore] =
    useState(0);

  const [thrust, setThrust] = useState(0);

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


      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      setCameraStarted(true);


      const socket = new WebSocket(
        "ws://127.0.0.1:8000/ws/neck"
      );

      socketRef.current = socket;


      socket.onopen = () => {

        console.log(
          "Connected to neck CV backend"
        );

        sendingRef.current = true;

        sendFrame();

      };


      socket.onmessage = (event) => {

        const data =
          JSON.parse(event.data);


        setReps(data.reps ?? 0);

        setAngle(data.angle ?? 0);

        setDirection(
          data.direction ?? "unknown"
        );

        setCommand(
          data.command ?? ""
        );

        setFormScore(
          data.formScore ?? 0
        );

        setThrust(
          data.thrust ?? 0
        );

        setSuggestions(
          data.suggestions ?? []
        );


        /*
          Only save VALID detected results.

          This prevents the dashboard from being
          overwritten by "Adjust your position"
          when the user leaves the camera.
        */

        if (data.detected) {

          const neckAnalysis = {

            exercise: "Neck Exercise",

            reps: data.reps ?? 0,

            angle: data.angle ?? 0,

            direction:
              data.direction ?? "unknown",

            command:
              data.command ?? "",

            formScore:
              data.formScore ?? 0,

            thrust:
              data.thrust ?? 0,

            suggestions:
              data.suggestions ?? [],

            detected:
              true,

            timestamp:
              new Date().toISOString(),
          };


          localStorage.setItem(
            "latestNeckAnalysis",
            JSON.stringify(neckAnalysis)
          );

        }

      };


      socket.onerror = () => {

        setError(
          "Could not connect to the neck CV backend."
        );

      };


      socket.onclose = () => {

        sendingRef.current = false;

        console.log(
          "Neck CV backend disconnected"
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
    <div className="neck-exercise-page">


      {/* HEADER */}

      <header className="neck-exercise-header">

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
          Neck Exercise
        </h1>


        <span>
          AI Movement Analysis
        </span>

      </header>


      <main className="neck-exercise-main">


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
                  Start movement analysis
                </h2>


                <p>
                  Allow camera access so Athecure
                  can analyze your neck movement.
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
              Neck performance
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
                NECK ANGLE
              </small>

              <strong>
                {angle}°
              </strong>

            </div>


            <div className="metric-card">

              <small>
                THRUST
              </small>

              <strong>
                {thrust}
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
                MOVEMENT
              </small>

              <strong>
                {direction}
              </strong>

            </div>


            <div>

              <small>
                COMMAND
              </small>

              <strong>
                {command}
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

                Waiting for movement analysis...

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default NeckExercise;