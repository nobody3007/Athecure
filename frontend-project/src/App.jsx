import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index/Index";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AthletePerformance from "./pages/Athete_performance/Athlete_profile";
import About from "./pages/About/About";
import NeckExercise from "./pages/NeckExercise/NeckExercise";
import SquatExercise from "./pages/SquatExercise/SquatExercise";


function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Athlete_performance" element={<AthletePerformance />} />
        <Route path="/about" element={<About />} />
       <Route path="/dashboard/neck"element={<NeckExercise />}
/><Route
  path="/dashboard/squat"
  element={<SquatExercise />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;