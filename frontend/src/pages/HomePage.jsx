import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaChartLine,
  FaClipboardCheck,
  FaDatabase,
  FaFileMedical,
  FaHeartbeat,
  FaHospitalUser,
  FaPeopleArrows,
  FaUserInjured,
  FaUserMd,
  FaUsers,
} from "react-icons/fa";
import { fetchJson } from "../lib/apiClient";
import "./HomePage.css";

const formatDate = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString();
};

const staticKpis = [
  {
    key: "documents",
    label: "Clinical Documents",
    value: "—",
    hint: "Connect documents analytics endpoint",
    icon: <FaFileMedical aria-hidden="true" />,
    tone: "neutral",
  },
  {
    key: "visits",
    label: "Recorded Visits",
    value: "—",
    hint: "Connect visit history aggregation",
    icon: <FaHospitalUser aria-hidden="true" />,
    tone: "neutral",
  },
  {
    key: "vitals",
    label: "Vitals Entries",
    value: "—",
    hint: "Connect vitals summary endpoint",
    icon: <FaHeartbeat aria-hidden="true" />,
    tone: "neutral",
  },
];

const valueCards = [
  {
    title: "Secure Records",
    desc: "Patient data stays centralized with consistent structure and traceable updates.",
    icon: <FaDatabase aria-hidden="true" />,
  },
  {
    title: "Smart Collaboration",
    desc: "Clinical teams can review synchronized records without switching tools.",
    icon: <FaPeopleArrows aria-hidden="true" />,
  },
  {
    title: "Real-Time Readiness",
    desc: "Key care indicators are visible quickly for routine and urgent decisions.",
    icon: <FaChartLine aria-hidden="true" />,
  },
];

const quickLinks = [
  { to: "/patients", label: "Patients", icon: <FaUsers aria-hidden="true" /> },
  { to: "/doctors", label: "Doctors", icon: <FaUserMd aria-hidden="true" /> },
  {
    to: "/pharmacists",
    label: "Pharmacists",
    icon: <FaHospitalUser aria-hidden="true" />,
  },
  {
    to: "/patients",
    label: "Clinical Documents",
    icon: <FaFileMedical aria-hidden="true" />,
    note: "Open from patient profile",
  },
  {
    to: "/patients",
    label: "Visits & History",
    icon: <FaClipboardCheck aria-hidden="true" />,
    note: "Open from patient profile",
  },
];

function ActivitySkeleton() {
  return (
    <ul className="activity-list skeleton-list" aria-hidden="true">
      {[1, 2, 3].map((key) => (
        <li key={key}>
          <div className="skeleton-line wide" />
          <div className="skeleton-line medium" />
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState("");

  useEffect(() => {
    let mounted = true;
    setIsLoadingPatients(true);
    fetchJson("/patients")
      .then((rows) => {
        if (!mounted) return;
        setPatients(Array.isArray(rows) ? rows : []);
        setPatientsError("");
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("[home] failed loading patients", err);
        setPatients([]);
        setPatientsError("Unable to load patient overview at the moment.");
      })
      .finally(() => {
        if (mounted) setIsLoadingPatients(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const patientStats = useMemo(() => {
    const total = patients.length;
    const withPhoto = patients.filter((p) =>
      Boolean(p.profile_photo_path),
    ).length;
    const noNationalId = patients.filter(
      (p) => !String(p.national_id || "").trim(),
    ).length;
    return { total, withPhoto, noNationalId };
  }, [patients]);

  const recentPatients = useMemo(
    () =>
      [...patients]
        .sort((a, b) => Number(b.patient_id || 0) - Number(a.patient_id || 0))
        .slice(0, 5),
    [patients],
  );

  const kpis = [
    {
      key: "patients",
      label: "Total Patients",
      value: isLoadingPatients ? "..." : String(patientStats.total),
      hint: "Live from patient registry",
      icon: <FaUserInjured aria-hidden="true" />,
      tone: "primary",
    },
    {
      key: "profiles",
      label: "Profiles with Photo",
      value: isLoadingPatients ? "..." : String(patientStats.withPhoto),
      hint: "Visual identity completeness",
      icon: <FaUsers aria-hidden="true" />,
      tone: "success",
    },
    ...staticKpis,
  ];

  return (
    <div className="home-container">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="hero-eyebrow">My Medical Passport</p>
          <h1>
            Operational command center for patient records and care
            collaboration
          </h1>
          <p className="hero-subtitle">
            Keep records organized, monitor operational health, and move between
            patient workflows with speed and confidence.
          </p>
        </div>

        <div className="hero-actions" aria-label="Quick actions">
          <Link to="/doctors" className="action-btn action-btn-primary">
            Add Patient
          </Link>
          <Link to="/patients" className="action-btn action-btn-outline">
            View Patients
          </Link>
          <Link to="/patients" className="action-btn action-btn-outline">
            Upload Document
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h2>Dashboard Snapshot</h2>
          <p>Core operating indicators at a glance.</p>
        </div>

        <div className="kpi-grid">
          {kpis.map((kpi) => (
            <article key={kpi.key} className={`kpi-card tone-${kpi.tone}`}>
              <div className="kpi-icon">{kpi.icon}</div>
              <div>
                <p className="kpi-label">{kpi.label}</p>
                <p className="kpi-value">{kpi.value}</p>
                <p className="kpi-hint">{kpi.hint}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block overview-layout">
        <article className="panel-card">
          <div className="section-head compact">
            <h3>Recent Patient Activity</h3>
            <Link to="/patients" className="inline-link">
              Open registry <FaArrowRight aria-hidden="true" />
            </Link>
          </div>

          {isLoadingPatients ? (
            <ActivitySkeleton />
          ) : patientsError ? (
            <p className="state-text error">{patientsError}</p>
          ) : recentPatients.length === 0 ? (
            <div className="empty-state">
              <p>No patient records yet.</p>
              <Link to="/doctors" className="inline-link">
                Add first patient <FaArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <ul className="activity-list">
              {recentPatients.map((patient) => (
                <li key={patient.patient_id}>
                  <div>
                    <p className="activity-title">
                      {patient.full_name || "Unnamed Patient"}
                    </p>
                    <p className="activity-sub">
                      ID #{patient.patient_id} • {patient.gender || "Unknown"} •{" "}
                      {formatDate(patient.birth_date)}
                    </p>
                  </div>
                  <Link
                    className="activity-link"
                    to={`/patients/${patient.patient_id}?mode=view`}
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel-card">
          <div className="section-head compact">
            <h3>Quick Access</h3>
            <p>Jump to high-use modules.</p>
          </div>
          <div className="shortcut-grid">
            {quickLinks.map((item) => (
              <Link key={item.label} to={item.to} className="shortcut-card">
                <span className="shortcut-icon">{item.icon}</span>
                <span className="shortcut-label">{item.label}</span>
                {item.note ? (
                  <span className="shortcut-note">{item.note}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="section-block two-col">
        <article className="panel-card">
          <div className="section-head compact">
            <h3>Platform Value</h3>
            <p>Capabilities that keep operations reliable and scalable.</p>
          </div>
          <div className="value-grid">
            {valueCards.map((item) => (
              <div key={item.title} className="value-card">
                <span className="value-icon">{item.icon}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="section-head compact">
            <h3>Operational Checklist</h3>
            <p>Monitor data quality and readiness on each shift.</p>
          </div>
          <ul className="checklist">
            <li>
              <span>Profiles missing national ID</span>
              <strong>
                {isLoadingPatients ? "..." : patientStats.noNationalId}
              </strong>
            </li>
            <li>
              <span>Clinical documents this week</span>
              <strong>Connect API</strong>
            </li>
            <li>
              <span>Visit records updated today</span>
              <strong>Connect API</strong>
            </li>
            <li>
              <span>Vitals completion coverage</span>
              <strong>Connect API</strong>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
