import React, { useState } from "react";

const AddPatientForm = ({ onAdd }) => {
  const [patient, setPatient] = useState({
    fullName: "",
    dob: "",
    gender: "",
    nationality: "",
    language: "",
    emergencyContact: "",
    contactRelation: "",
    contactPhone: "",
  });

  const handleChange = (e) => {
    setPatient({ ...patient, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(patient);
    setPatient({
      fullName: "",
      dob: "",
      gender: "",
      nationality: "",
      language: "",
      emergencyContact: "",
      contactRelation: "",
      contactPhone: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center">Add New Patient</h2>

      <input name="fullName" value={patient.fullName} onChange={handleChange} placeholder="Full Name" className="w-full border p-2 rounded" required />
      <input type="date" name="dob" value={patient.dob} onChange={handleChange} className="w-full border p-2 rounded" required />
      <input name="gender" value={patient.gender} onChange={handleChange} placeholder="Gender" className="w-full border p-2 rounded" required />
      <input name="nationality" value={patient.nationality} onChange={handleChange} placeholder="Nationality" className="w-full border p-2 rounded" />
      <input name="language" value={patient.language} onChange={handleChange} placeholder="Language Spoken" className="w-full border p-2 rounded" />
      <input name="emergencyContact" value={patient.emergencyContact} onChange={handleChange} placeholder="Emergency Contact Name" className="w-full border p-2 rounded" />
      <input name="contactRelation" value={patient.contactRelation} onChange={handleChange} placeholder="Relation" className="w-full border p-2 rounded" />
      <input name="contactPhone" value={patient.contactPhone} onChange={handleChange} placeholder="Contact Phone" className="w-full border p-2 rounded" />

      <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Patient</button>
    </form>
  );
};

export default AddPatientForm;
