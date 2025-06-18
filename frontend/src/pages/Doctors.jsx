import React, { useState } from "react";
import AddPatientModal from "../components/AddPatientModal";
import "./Doctors.css"; // Import the new CSS

export default function Doctors() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPatient = (e) => {
    e.preventDefault();
    console.log("Patient added!");
    setIsModalOpen(false);
  };

  return (
    <div className="doctors-page fade-in">
      <h1>Doctors Information</h1>
      <p>Here you can view and manage doctor details.</p>
      <button className="add-patient-btn" onClick={() => setIsModalOpen(true)}>
        Add Patient
      </button>

      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddPatient}
      />
    </div>
  );
}
