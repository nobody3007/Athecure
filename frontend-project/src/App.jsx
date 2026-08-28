import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index/Index";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AthletePerformance from "./pages/Athete_performance/Athlete_profile";
import About from "./pages/About/About";


function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Athlete_performance" element={<AthletePerformance />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;