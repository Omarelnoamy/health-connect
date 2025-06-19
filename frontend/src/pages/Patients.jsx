import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import "./Patients.css";

const API_BASE_URL = "https://health-connect-api-production.up.railway.app";

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

  return (
    <div className="patients-container">
      <h1>Our Patients</h1>

      <div className="patients-list">
        {patients.map((p) => (
          <div className="patient-card" key={p.patient_id}>
            {/* photo */}
            <div className="patient-photo">
              {p.profile_photo_path ? (
                <img
                  src={`http://${lanHost}:3001${p.profile_photo_path}`}
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
                value={`${API_BASE_URL}/patients/${p.patient_id}`}
                size={120}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
