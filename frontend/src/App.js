import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./HomePage";
import CitizenLogin from "./Citizens/CitizenLogin";
import AdminLogin from "./Admin/AdminLogin";
import OTPVerification from "./Citizens/OTPVerification";
import CitizenDashboard from "./Citizens/CitizenDashboard";
import ComplaintForm from "./Citizens/ComplaintForm";
import TrackComplaints from "./Citizens/TrackComplaint";   // ✅ FIXED IMPORT
import AdminDashboard from "./Admin/AdminDashboard";
import OfficerDashboard from "./Admin/OfficerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/citizen-login" element={<CitizenLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
        <Route path="/add-complaint" element={<ComplaintForm />} />
        <Route path="/track-complaints" element={<TrackComplaints />} />  {/* FIXED */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/officer-dashboard" element={<OfficerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
