import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./PatientProfile.css";

export default function PatientProfile() {
  const host = window.location.hostname;
  const { id } = useParams();

  const { search } = useLocation();
  const readOnly = new URLSearchParams(search).get("mode") === "view";

  const [patient, setPatient] = useState(null);

  const [medicalHistory, setMedicalHistory] = useState(null);
  const [editMedicalHistory, setEditMedicalHistory] = useState(false);
  const [medicalForm, setMedicalForm] = useState({
    allergies: "",
    current_medications: "",
    past_medical_history: "",
    surgical_history: "",
    family_history: "",
    immunization_records: "",
    chronic_conditions: "",
    mental_health_conditions: "",
  });

  const [clinicalDocs, setClinicalDocs] = useState([]);
  const [editclinicalDocs, setEditClinicalDocs] = useState(false);
  const [clinicalForm, setClinicalForm] = useState({
    document_name: "",
    file: null, // for uploading file
  });

  const [vitals, setVitals] = useState(null);
  const [editVitals, setEditVitals] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    temperature: "",
    blood_pressure: "",
    heart_rate: "",
    height_cm: "",
    weight_kg: "",
    notes: "",
  });

  const [contactInfo, setContactInfo] = useState({});
  const [editContact, setEditContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    phone: "",
    email: "",
    address: "",
    emergency_name: "",
    emergency_phone: "",
    emergency_relation: "",
  });

  const [visits, setVisits] = useState(null);
  const [editVisit, setEditVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({
    visit_date: "",
    doctor_name: "",
    reason: "",
    diagnosis: "",
    treatment: "",
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          patientRes,
          contactRes,
          historyRes,
          docsRes,
          visitsRes,
          vitalsRes,
        ] = await Promise.all([
          fetch(`http://localhost:3001/patients/${id}`),
          fetch(`http://localhost:3001/patients/${id}/contact_info`),
          fetch(`http://localhost:3001/patients/${id}/medical_history`),
          fetch(`http://localhost:3001/patients/${id}/clinical_documents`),
          fetch(`http://localhost:3001/patients/${id}/visits`),
          fetch(`http://localhost:3001/patients/${id}/vitals`),
        ]);

        const safeJson = async (res, label) => {
          const text = await res.text();
          if (!res.ok) {
            console.warn(`${label} fetch failed: ${res.status}`);
            // decide default: if label indicates a list endpoint, return []
            if (label.includes("Visits") || label.includes("Clinical Docs")) {
              return [];
            }
            // else return empty object
            return {};
          }
          if (!text) {
            console.warn(`${label} is empty`);
            // similar default
            if (label.includes("Visits") || label.includes("Clinical Docs")) {
              return [];
            }
            return {};
          }
          try {
            return JSON.parse(text);
          } catch (err) {
            console.error(`${label} JSON parse error:`, err);
            throw err;
          }
        };

        const [
          patientData,
          contactData,
          historyData,
          docsData,
          visitsData,
          vitalsData,
        ] = await Promise.all([
          safeJson(patientRes, "Patient Data"),
          safeJson(contactRes, "Contact Info"),
          safeJson(historyRes, "Medical History"),
          safeJson(docsRes, "Clinical Docs"),
          safeJson(visitsRes, "Visits"),
          safeJson(vitalsRes, "Vitals"),
        ]);

        console.log("Patient Data:", patientData);
        setPatient(patientData);

        console.log("Contact Info", contactData);
        //setContactInfo(Array.isArray(contactData) ? contactData : []);
        setContactInfo(contactData);

        console.log("Medical History", historyData);
        setMedicalHistory(historyData);

        console.log("Clinical Docs", docsData);
        //setClinicalDocs(Array.isArray(docsData) ? docsData : []);
        setClinicalDocs(docsData);

        console.log("Visits Data:", visitsData);
        //setVisits(Array.isArray(visitsData) ? visitsData : [visitsData]);
        setVisits(visitsData);

        console.log("Vitals Data:", vitalsData);
        //setVitals(Array.isArray(vitalsData) ? vitalsData : []);
        setVitals(vitalsData);

        setMedicalForm({
          allergies: historyData?.allergies || "",
          current_medications: historyData?.current_medications || "",
          past_medical_history: historyData?.past_medical_history || "",
          surgical_history: historyData?.surgical_history || "",
          family_history: historyData?.family_history || "",
          immunization_records: historyData?.immunization_records || "",
          chronic_conditions: historyData?.chronic_conditions || "",
          mental_health_conditions: historyData?.mental_health_conditions || "",
        });

        setVitalsForm({
          temperature: vitalsData?.temperature || "",
          blood_pressure: vitalsData?.blood_pressure || "",
          heart_rate: vitalsData?.heart_rate || "",
          height_cm: vitalsData?.height_cm || "",
          weight_kg: vitalsData?.weight_kg || "",
          notes: vitalsData?.notes || "",
        });

        setClinicalForm({
          document_name: docsData?.document_name || "",
          upload_date: docsData?.upload_date || "",
          file_type: docsData?.file_type || "",
          file_path: docsData?.file_path || "",
        });

        setVisitForm({
          visit_date: visitsData?.visit_date || "",
          doctor_name: visitsData?.doctor_name || "",
          reason: visitsData?.reason || "",
          diagnosis: visitsData?.diagnosis || "",
          treatment: visitsData?.treatment || "",
        });

        setContactForm({
          phone: contactData?.phone || "",
          email: contactData?.email || "",
          address: contactData?.address || "",
          emergency_name: contactData?.emergency_name || "",
          emergency_relation: contactData?.emergency_relation || "",
          emergency_phone: contactData?.emergency_phone || "",
        });
      } catch (err) {
        console.error("Error loading patient data:", err);
      }
    };

    fetchData();
  }, [id]);

  const handleAddMedicalHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/patients/${id}/medical_history`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            allergies: medicalForm.allergies,
            current_medications: medicalForm.current_medications,
            past_medical_history: medicalForm.past_medical_history,
            surgical_history: medicalForm.surgical_history,
            family_history: medicalForm.family_history,
            immunization_records: medicalForm.immunization_records,
            chronic_conditions: medicalForm.chronic_conditions,
            mental_health_conditions: medicalForm.mental_health_conditions,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.error("Server error:", data);
        alert("Failed to save MedicalHistory.");
        return;
      }
      setMedicalHistory(data);
      setEditMedicalHistory(false);
    } catch (err) {
      console.error("Error saving MedicalHistory:", err);
      alert("Failed to save MedicalHistory.");
    }
  };

  const handleVitalsSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/patients/${id}/vitals`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            temperature: vitalsForm.temperature,
            blood_pressure: vitalsForm.blood_pressure,
            heart_rate: vitalsForm.heart_rate,
            height_cm: vitalsForm.height_cm,
            weight_kg: vitalsForm.weight_kg,
            notes: vitalsForm.notes,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.error("Server error:", data);
        alert("Failed to save vitals.");
        return;
      }
      setVitals(data);
      setEditVitals(false);
    } catch (err) {
      console.error("Error saving vitals:", err);
      alert("Failed to save vitals.");
    }
  };

  const handleAddClinicalDoc = async () => {
    if (!clinicalForm.document_name || !clinicalForm.file) {
      alert("Please enter a document name and choose a file.");
      return;
    }
    const formData = new FormData();
    formData.append("document_name", clinicalForm.document_name);
    formData.append("file", clinicalForm.file);
    try {
      const response = await fetch(
        `http://localhost:3001/patients/${id}/clinical_documents`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) throw new Error("Failed to upload clinical document");
      const newDoc = await response.json();
      setClinicalDocs((prev) => [...prev, newDoc]);
      setClinicalForm({ document_name: "", file: null });
      setEditClinicalDocs(false);
    } catch (error) {
      console.error("Error uploading clinical document:", error);
      alert("Upload failed.");
    }
  };

  const handleAddVisit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/patients/${id}/visits`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visit_date: visitForm.visit_date,
            doctor_name: visitForm.doctor_name,
            reason: visitForm.reason,
            diagnosis: visitForm.diagnosis,
            treatment: visitForm.treatment,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.error("Server error:", data);
        alert("Failed to save visit.");
        return;
      }
      setVisits((prevVisits) => [...prevVisits, data]);
      setEditVisit(false);
    } catch (err) {
      console.error("Error saving visit:", err);
      alert("Failed to save visit.");
    }
  };

  const handleContactSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/patients/${id}/contact_info`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: contactForm.phone,
            email: contactForm.email,
            address: contactForm.address,
            emergency_name: contactForm.emergency_name,
            emergency_relation: contactForm.emergency_relation,
            emergency_phone: contactForm.emergency_phone,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        console.error("Server error:", data);
        alert("Failed to save Contact.");
        return;
      }
      setContactInfo(data);
      setEditContact(false);
    } catch (err) {
      console.error("Error saving Contact Info:", err);
      alert("Failed to save Contact Info.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch(
        `http://localhost:3001/patients/${patient.patient_id}/photo`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Profile photo updated!");
        setPatient((prev) => ({
          ...prev,
          profile_photo_path: data.profile_photo_path,
        }));
      } else {
        alert("Failed to upload photo.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  if (!patient) return <h2>Loading...</h2>;

  return (
    <div className="profile-page">
      {/* Top Patient Card */}
      <div className="profile-header">
        <div className="photo-wrapper">
          {patient.profile_photo_path ? (
            <img
              src={`http://${host}:3001${patient.profile_photo_path}`}
              alt={`${patient.full_name}'s profile`}
            />
          ) : (
            <img src="/default-avatar.png" alt="Default avatar" />
          )}

          {!readOnly && (
            <>
              <label
                htmlFor="photo-upload"
                className="camera-button"
                title="Change Photo"
              >
                📷
              </label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
            </>
          )}
        </div>

        <div>
          <h1>{patient.full_name}</h1>
          {patient.birth_date && (
            <p>
              <strong>Birthdate:</strong> {formatDate(patient.birth_date)}
            </p>
          )}
          <p>
            <strong>Gender:</strong> {patient.gender}
          </p>
          <p>
            <strong>Nationality:</strong> {patient.nationality}
          </p>
          <p>
            <strong>Language:</strong> {patient.language_spoken}
          </p>
        </div>
      </div>

      {/* Vitals Section */}
      <div className="profile-section">
        <h2>Vitals</h2>
        {!editVitals ? (
          <>
            {Object.keys(vitals || {}).length > 0 ? (
              <div className="grid-two">
                <div>
                  <strong>Temperature:</strong> {vitals?.temperature || "N/A"}{" "}
                  °C
                </div>
                <div>
                  <strong>Blood Pressure:</strong>{" "}
                  {vitals?.blood_pressure || "N/A"}
                </div>
                <div>
                  <strong>Heart Rate:</strong> {vitals?.heart_rate || "N/A"} bpm
                </div>
                <div>
                  <strong>Height:</strong> {vitals?.height_cm || "N/A"} cm
                </div>
                <div>
                  <strong>Weight:</strong> {vitals?.weight_kg || "N/A"} kg
                </div>
                <div>
                  <strong>Notes:</strong> {vitals?.notes || "N/A"}
                </div>
              </div>
            ) : (
              <p>No vitals info available.</p>
            )}

            {!readOnly && (
              <button
                className="edit-btn"
                onClick={() => {
                  setVitalsForm(vitals); // prefill form
                  setEditVitals(true);
                }}
              >
                {Object.keys(vitals || {}).length > 0
                  ? "Edit Vitals"
                  : "Add Vitals"}
              </button>
            )}
          </>
        ) : (
          <div className="vitals-form">
            <input
              type="number"
              placeholder="Temperature (°C)"
              min="35"
              max="42"
              step="0.1"
              value={vitalsForm.temperature}
              onChange={(e) =>
                setVitalsForm({ ...vitalsForm, temperature: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Blood Pressure (e.g., 120/80)"
              value={vitalsForm.blood_pressure}
              onChange={(e) =>
                setVitalsForm({ ...vitalsForm, blood_pressure: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Heart Rate (bpm)"
              value={vitalsForm.heart_rate}
              onChange={(e) =>
                setVitalsForm({ ...vitalsForm, heart_rate: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Height (cm)"
              value={vitalsForm.height_cm}
              onChange={(e) =>
                setVitalsForm({ ...vitalsForm, height_cm: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={vitalsForm.weight_kg}
              onChange={(e) =>
                setVitalsForm({ ...vitalsForm, weight_kg: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Notes"
              value={vitalsForm.notes}
              onChange={(e) =>
                setVitalsForm({ ...vitalsForm, notes: e.target.value })
              }
            />
            <div className="btn-group">
              <button className="save-btn" onClick={handleVitalsSave}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditVitals(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Medical History */}
      <div className="profile-section">
        <h2>Medical History</h2>

        {!editMedicalHistory ? (
          medicalHistory && Object.keys(medicalHistory).length > 0 ? (
            <ul>
              <li>
                <strong>Allergies:</strong> {medicalHistory.allergies || "N/A"}
              </li>
              <li>
                <strong>Current Medications:</strong>{" "}
                {medicalHistory.current_medications || "N/A"}
              </li>
              <li>
                <strong>Past Medical History:</strong>{" "}
                {medicalHistory.past_medical_history || "N/A"}
              </li>
              <li>
                <strong>Surgical History:</strong>{" "}
                {medicalHistory.surgical_history || "N/A"}
              </li>
              <li>
                <strong>Family History:</strong>{" "}
                {medicalHistory.family_history || "N/A"}
              </li>
              <li>
                <strong>Immunization Records:</strong>{" "}
                {medicalHistory.immunization_records || "N/A"}
              </li>
              <li>
                <strong>Chronic Conditions:</strong>{" "}
                {medicalHistory.chronic_conditions || "N/A"}
              </li>
              <li>
                <strong>Mental Health Conditions:</strong>{" "}
                {medicalHistory.mental_health_conditions || "N/A"}
              </li>
            </ul>
          ) : (
            <p>No medical history available.</p>
          )
        ) : null}

        {!readOnly && !editMedicalHistory && (
          <button
            className="add-btn"
            onClick={() => {
              setMedicalForm({
                allergies: medicalHistory?.allergies || "",
                current_medications: medicalHistory?.current_medications || "",
                past_medical_history:
                  medicalHistory?.past_medical_history || "",
                surgical_history: medicalHistory?.surgical_history || "",
                family_history: medicalHistory?.family_history || "",
                immunization_records:
                  medicalHistory?.immunization_records || "",
                chronic_conditions: medicalHistory?.chronic_conditions || "",
                mental_health_conditions:
                  medicalHistory?.mental_health_conditions || "",
              });
              setEditMedicalHistory(true);
            }}
          >
            {medicalHistory && Object.keys(medicalHistory).length > 0
              ? "Edit Medical History"
              : "Add Medical History"}
          </button>
        )}

        {editMedicalHistory && (
          <div className="medical-history-form">
            <input
              type="text"
              placeholder="Allergies"
              value={medicalForm.allergies}
              onChange={(e) =>
                setMedicalForm({ ...medicalForm, allergies: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Current Medications"
              value={medicalForm.current_medications}
              onChange={(e) =>
                setMedicalForm({
                  ...medicalForm,
                  current_medications: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Past Medical History"
              value={medicalForm.past_medical_history}
              onChange={(e) =>
                setMedicalForm({
                  ...medicalForm,
                  past_medical_history: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Surgical History"
              value={medicalForm.surgical_history}
              onChange={(e) =>
                setMedicalForm({
                  ...medicalForm,
                  surgical_history: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Family History"
              value={medicalForm.family_history}
              onChange={(e) =>
                setMedicalForm({
                  ...medicalForm,
                  family_history: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Immunization Records"
              value={medicalForm.immunization_records}
              onChange={(e) =>
                setMedicalForm({
                  ...medicalForm,
                  immunization_records: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Chronic Conditions"
              value={medicalForm.chronic_conditions}
              onChange={(e) =>
                setMedicalForm({
                  ...medicalForm,
                  chronic_conditions: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Mental Health Conditions"
              value={medicalForm.mental_health_conditions}
              onChange={(e) =>
                setMedicalForm({
                  ...medicalForm,
                  mental_health_conditions: e.target.value,
                })
              }
            />
            <div className="btn-group">
              <button className="save-btn" onClick={handleAddMedicalHistory}>
                {medicalHistory && Object.keys(medicalHistory).length > 0
                  ? "Update"
                  : "Save"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditMedicalHistory(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Documents */}
      <div className="profile-section">
        <h2>Clinical Documents</h2>

        {clinicalDocs && clinicalDocs.length > 0 ? (
          <ul>
            {clinicalDocs.map((doc) => (
              <li key={doc.document_id}>
                <strong>{doc.document_name}</strong> -{" "}
                {formatDate(doc.upload_date)} - {doc.file_type}
                <br />
                <a
                  href={`http://localhost:3001/${doc.file_path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Document
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No clinical documents available.</p>
        )}

        {!readOnly && !editclinicalDocs && (
          <button className="add-btn" onClick={() => setEditClinicalDocs(true)}>
            Add Clinical Document
          </button>
        )}

        {editclinicalDocs && (
          <div className="clinical-doc-form">
            <input
              type="text"
              placeholder="Document Name"
              value={clinicalForm.document_name}
              onChange={(e) =>
                setClinicalForm({
                  ...clinicalForm,
                  document_name: e.target.value,
                })
              }
            />
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                setClinicalForm({ ...clinicalForm, file: e.target.files[0] })
              }
            />
            <div className="btn-group">
              <button className="save-btn" onClick={handleAddClinicalDoc}>
                Upload
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditClinicalDocs(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visit History */}
      <div className="profile-section">
        <h2>Visit History</h2>

        {!editVisit ? (
          Array.isArray(visits) && visits.length > 0 ? (
            <ul>
              {visits.map((visit, index) => (
                <li key={index}>
                  <strong>Date:</strong> {formatDate(visit.visit_date) || "N/A"}
                  <br />
                  <strong>Doctor:</strong> {visit.doctor_name || "N/A"}
                  <br />
                  <strong>Reason:</strong> {visit.reason || "N/A"}
                  <br />
                  <strong>Diagnosis:</strong> {visit.diagnosis || "N/A"}
                  <br />
                  <strong>Treatment:</strong> {visit.treatment || "N/A"}
                  <hr />
                </li>
              ))}
            </ul>
          ) : (
            <p>No visits available.</p>
          )
        ) : null}

        {!readOnly && !editVisit && (
          <button
            className="add-btn"
            onClick={() => {
              if (Array.isArray(visits) && visits.length > 0) {
                setVisitForm({
                  visit_date: "",
                  doctor_name: "",
                  reason: "",
                  diagnosis: "",
                  treatment: "",
                });
              }
              setEditVisit(true);
            }}
          >
            {Array.isArray(visits) && visits.length > 0
              ? "Add another Visit"
              : "Add Visit History"}
          </button>
        )}

        {editVisit && (
          <div className="visit-history-form">
            <input
              type="date"
              value={visitForm.visit_date}
              onChange={(e) =>
                setVisitForm({ ...visitForm, visit_date: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Doctor Name"
              value={visitForm.doctor_name}
              onChange={(e) =>
                setVisitForm({ ...visitForm, doctor_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Reason"
              value={visitForm.reason}
              onChange={(e) =>
                setVisitForm({ ...visitForm, reason: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Diagnosis"
              value={visitForm.diagnosis}
              onChange={(e) =>
                setVisitForm({ ...visitForm, diagnosis: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Treatment"
              value={visitForm.treatment}
              onChange={(e) =>
                setVisitForm({ ...visitForm, treatment: e.target.value })
              }
            />

            <div className="btn-group">
              <button className="save-btn" onClick={handleAddVisit}>
                {Array.isArray(visits) && visits.length > 0 ? "Add" : "Save"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditVisit(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="profile-section contact-footer">
        <h2>Contact Info</h2>
        {!editContact ? (
          <>
            {Object.keys(contactInfo).length > 0 ? (
              <div className="grid-two">
                <p>
                  <strong>Email:</strong> {contactForm.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {contactForm.phone || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {contactForm.address || "N/A"}
                </p>
              </div>
            ) : (
              <p>No contact info available.</p>
            )}
            {!readOnly && (
              <button
                className="edit-btn"
                onClick={() => {
                  if (Object.keys(contactInfo).length > 0) {
                    setContactForm({ ...contactForm });
                    console.log("anagowa");
                  } else {
                    console.log("md5lt4");
                    setContactForm({
                      phone: "",
                      email: "",
                      address: "",
                      emergency_name: "",
                      emergency_phone: "",
                      emergency_relation: "",
                    });
                  }
                  setEditContact(true);
                }}
              >
                {Object.keys(contactInfo).length > 0
                  ? "Edit Contact Info"
                  : "Add Contact Info"}
              </button>
            )}
          </>
        ) : (
          <div className="contact-form">
            <input
              type="text"
              placeholder="Email"
              value={contactForm.email}
              onChange={(e) =>
                setContactForm({ ...contactForm, email: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Phone"
              value={contactForm.phone}
              onChange={(e) =>
                setContactForm({ ...contactForm, phone: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Address"
              value={contactForm.address}
              onChange={(e) =>
                setContactForm({ ...contactForm, address: e.target.value })
              }
            />
            <div className="btn-group">
              <button className="save-btn" onClick={handleContactSave}>
                {Object.keys(contactForm).length > 0 ? "Update" : "Save"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditContact(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="profile-section emergency-footer">
        <h2>Emergency Info</h2>
        {!editContact ? (
          <>
            {Object.keys(contactInfo).length > 0 ? (
              <div className="grid-two">
                <p>
                  <strong>Name:</strong> {contactForm.emergency_name || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {contactForm.emergency_phone || "N/A"}
                </p>
                <p>
                  <strong>Relation:</strong>{" "}
                  {contactForm.emergency_relation || "N/A"}
                </p>
              </div>
            ) : (
              <p>No emergency info available.</p>
            )}
            {!readOnly && (
              <button
                className="edit-btn"
                onClick={() => {
                  if (Object.keys(contactInfo).length > 0) {
                    setContactForm({ ...contactForm });
                  } else {
                    setContactForm({
                      phone: "",
                      email: "",
                      address: "",
                      emergency_name: "",
                      emergency_phone: "",
                      emergency_relation: "",
                    });
                  }
                  setEditContact(true);
                }}
              >
                {Object.keys(contactInfo).length > 0
                  ? "Edit Emergency Info"
                  : "Add Emergency Info"}
              </button>
            )}
          </>
        ) : (
          <div className="emergency-form">
            <input
              type="text"
              placeholder="Emergency Name"
              value={contactForm.emergency_name}
              onChange={(e) =>
                setContactForm({
                  ...contactForm,
                  emergency_name: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Emergency Phone"
              value={contactForm.emergency_phone}
              onChange={(e) =>
                setContactForm({
                  ...contactForm,
                  emergency_phone: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Emergency Relation"
              value={contactForm.emergency_relation}
              onChange={(e) =>
                setContactForm({
                  ...contactForm,
                  emergency_relation: e.target.value,
                })
              }
            />
            <div className="btn-group">
              <button className="save-btn" onClick={handleContactSave}>
                {Object.keys(contactInfo).length > 0 ? "Update" : "Save"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditContact(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
