import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddInternship from "./pages/AddInternship";
import EditInternship from "./pages/EditInternship";
import Account from "./pages/Account";
import ResumeSetup from "./pages/ResumeSetup";
import Integrations from "./pages/Integrations";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<AddInternship />} />
        
         {/* EDIT INTERNSHIP — IMPORTANT */}
        <Route path="/edit/:id" element={<EditInternship />} />
        <Route path="/account" element={<Account />} />
        <Route path="/resume" element={<ResumeSetup />} />
        <Route path="/integrations" element={<Integrations />} />

      </Routes>
    </Router>
  );
}

export default App;
