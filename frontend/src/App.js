import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // Correct import path for Layout
import HomePage from "./pages/HomePage"; // Correct import path for Dashboard
import AboutUs from "./pages/AboutUs"; // Correct import path for AboutUs
import Patients from "./pages/Patients"; // Correct import path for Patients
import Doctors from "./pages/Doctors"; // Correct import path for Doctors
import Pharmacists from "./pages/Pharmacists"; // Correct import path for Pharmacists
import Login from "./pages/Login"; // Correct import path for Login
import PatientProfile from "./pages/PatientProfile"; // Adjust path if needed

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/pharmacists" element={<Pharmacists />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientProfile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
