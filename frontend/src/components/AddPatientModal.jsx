import React, { useState } from "react";
import axios from "axios";
import "./AddPatientModal.css"; // Custom styles if needed

const API_BASE_URL = "https://health-connect-api-production.up.railway.app";
const VERCEL_URL = "https://health-connect-huqa.vercel.app";

const AddPatientModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    full_name: "",
    birth_date: "",
    gender: "",
    nationality: "",
    language_spoken: "",
    blood_type: "",
    national_id: "",
    profile_photo_path: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevents page reload

    try {
      console.log("Sending to:", `${API_BASE_URL}/patients`);
      const response = await axios.post(`${API_BASE_URL}/patients`, form);
      console.log("Patient added:", response.data);
      alert("Patient added successfully!");
      onClose(); // Close modal after success
    } catch (error) {
      console.error("Error adding patient:", error);
      alert("Error adding patient");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="birth_date"
              placeholder="Date of Birth"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="gender"
              placeholder="Gender"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="national_id"
              placeholder="National ID"
              onChange={handleChange}
            />
            <input
              type="text"
              name="nationality"
              placeholder="Nationality"
              onChange={handleChange}
            />
            <input
              type="text"
              name="language_spoken"
              placeholder="Language Spoken"
              onChange={handleChange}
            />
            <input
              type="text"
              name="blood_type"
              placeholder="Blood Type"
              onChange={handleChange}
            />
            <input
              type="text"
              name="profile_photo_path"
              placeholder="Profile Photo URL"
              onChange={handleChange}
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;
