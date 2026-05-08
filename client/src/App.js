import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddInternship from "./pages/AddInternship";
import EditInternship from "./pages/EditInternship";
import Account from "./pages/Account";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<AddInternship />} />
        
         {/* EDIT INTERNSHIP — IMPORTANT */}
        <Route path="/edit/:id" element={<EditInternship />} />
        <Route path="/account" element={<Account />} />

      </Routes>
    </Router>
  );
}

export default App;
