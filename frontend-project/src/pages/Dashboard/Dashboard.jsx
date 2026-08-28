import Logo from "../../components/Logo/Logo";
import "./Dashboard.css";

function Dashboard() {
  const email = localStorage.getItem("email");

  return (
    <div className="dashboard-page">

      <header className="dashboard-navbar">
        <Logo />

        <div className="dashboard-user">
          {email || "Athlete"}
        </div>
      </header>


      <main className="dashboard-content">

        <div className="dashboard-heading">
          <p className="dashboard-label">
            ATHLETE DASHBOARD
          </p>

          <h1>
            Your performance overview
          </h1>

          <p>
            Track your movement, workload, and progress from one place.
          </p>
        </div>


        <div className="dashboard-cards">

          <div className="dashboard-card">
            <small>FORM SCORE</small>
            <strong>92%</strong>
            <span>↑ 8% this week</span>
          </div>

          <div className="dashboard-card">
            <small>ACWR</small>
            <strong>0.92</strong>
            <span>Optimal</span>
          </div>

          <div className="dashboard-card">
            <small>TRAINING LOAD</small>
            <strong>78%</strong>
            <span>Moderate</span>
          </div>

        </div>


        <div className="dashboard-panel">

          <div className="panel-header">
            <h2>Weekly Training Load</h2>
            <span>Last 7 days</span>
          </div>

          <div className="dashboard-chart">
            <div style={{ height: "40%" }}></div>
            <div style={{ height: "55%" }}></div>
            <div style={{ height: "48%" }}></div>
            <div style={{ height: "70%" }}></div>
            <div style={{ height: "62%" }}></div>
            <div style={{ height: "82%" }}></div>
            <div style={{ height: "92%" }}></div>
          </div>

        </div>


        <div className="dashboard-coming-soon">
          <h2>More features coming soon</h2>

          <p>
            Movement analysis, injury-risk insights, and detailed
            performance tracking will appear here.
          </p>
        </div>

      </main>

    </div>
  );
}

export default Dashboard;