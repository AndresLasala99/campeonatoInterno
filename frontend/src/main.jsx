import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Publica from "./pages/Publica.jsx";
import Admin from "./pages/Admin.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Publica />} />
    </Routes>
  </BrowserRouter>
);
