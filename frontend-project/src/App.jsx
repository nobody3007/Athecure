import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Index/Index";
import Login from "./pages/Login/Login";

function App() {
  return (
   <BrowserRouter basename="/Athecure">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;