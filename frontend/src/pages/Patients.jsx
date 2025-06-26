import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import "./Patients.css";
import PageWrapper from "../components/PageWrapper";


const API_BASE_URL = "https://health-connect-api-production.up.railway.app";
const VERCEL_URL = "https://health-connect-huqa.vercel.app";

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [lanHost, setLanHost] = useState(window.location.hostname);

  useEffect(() => {
    fetch("/server-info") // same origin → no CORS issues
      .then((res) => res.json())
      .then((info) => setLanHost(info.host))
      .catch(() => {}); // ignore if it fails
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/patients`)
      .then((res) => res.json())
      .then(setPatients)
      .catch(console.error);
  }, []);

  const handleDeletePatient = async (patientId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete patient");

      // remove patient from list without refreshing
      setPatients((prev) => prev.filter((p) => p.patient_id !== patientId));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete patient.");
    }
  };

  return (
    <PageWrapper>
      <div className="patients-container">
        <h1>Our Patients</h1>

        <div className="patients-list">
          {patients.map((p) => (
            <div className="patient-card" key={p.patient_id}>
              {/* DELETE BUTTON */}
              <button
                className="delete-btn"
                onClick={() => handleDeletePatient(p.patient_id)}
                title="Delete Patient"
              >
                ×
              </button>

              {/* photo */}
              <div className="patient-photo">
                {p.profile_photo_path ? (
                  <img
                    src={`${API_BASE_URL}${p.profile_photo_path}`}
                    alt={p.full_name}
                  />
                ) : (
                  <img src="/default-avatar.png" alt="Default avatar" />
                )}
              </div>

              {/* info */}
              <div className="patient-info">
                <h2>{p.full_name}</h2>
                {p.birth_date && <p>Birthdate: {formatDate(p.birth_date)}</p>}
                <p>Gender: {p.gender}</p>
                <p>Blood Type: {p.blood_type}</p>

                {/* NEW BUTTONS */}
                <div className="btn-row">
                  {/* edit profile (current behaviour) */}
                  <Link
                    to={`/patients/${p.patient_id}`}
                    className="view-profile-btn"
                  >
                    Edit Profile
                  </Link>

                  {/* read‑only view */}
                  <Link
                    to={`/patients/${p.patient_id}?mode=view`}
                    className="view-profile-btn outline"
                  >
                    View Profile
                  </Link>
                </div>
              </div>

              {/* QR code */}
              <div className="qr-code">
                <QRCodeSVG
                  value={`http://localhost:3001/patients/${p.patient_id}`}
                  size={120}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
