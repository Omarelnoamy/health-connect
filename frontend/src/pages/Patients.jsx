import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import "./Patients.css";
import { fetchJson } from "../lib/apiClient";
import { getApiOrigin, resolveFileUrl } from "../lib/urlHelpers";

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

function useQrCodeSize() {
  const [size, setSize] = useState(120);
  useEffect(() => {
    const q = () => {
      const w = window.innerWidth;
      if (w < 480) setSize(88);
      else if (w < 768) setSize(100);
      else setSize(120);
    };
    q();
    window.addEventListener("resize", q);
    return () => window.removeEventListener("resize", q);
  }, []);
  return size;
}

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const apiOrigin = getApiOrigin();
  const qrSize = useQrCodeSize();

  useEffect(() => {
    fetchJson("/patients")
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
                  src={resolveFileUrl(p.profile_photo_path)}
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
                  Edit Profile
                </Link>

                <Link
                  to={`/patients/${p.patient_id}?mode=view`}
                  className="view-profile-btn outline"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* QR code */}
            <div className="qr-code">
              <QRCodeSVG
                value={`${apiOrigin}/patients/${p.patient_id}`}
                size={qrSize}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
