import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index/Index";
import Login from "./pages/Login/Login";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;