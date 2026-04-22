import React from "react";
import { useNavigate } from "react-router-dom";
import "./AboutUs.css";

const heroImageUrl = `${process.env.PUBLIC_URL || ""}/MMP.png`;

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <header className="about-hero">
        <img
          src={heroImageUrl}
          alt="Medical Management Partner"
          className="about-hero-logo"
        />
      </header>

      <article className="about-card">
        <h1>About My Medical Passport</h1>
        <p>
          MMP is your trusted digital partner in healthcare. It enables doctors
          and other healthcare professionals to securely access vital patient
          information — including medical history, past reservations, treatment
          outcomes, and shared impressions from healthcare professionals.
        </p>
        <p>
          With MMP, healthcare providers can make faster, more informed
          decisions and deliver personalized care.
        </p>
        <p>
          This platform brings a new level of transparency and collaboration to
          healthcare — improving outcomes, saving time, and building trust.
        </p>

        <button
          type="button"
          className="about-back-btn"
          onClick={() => navigate("/")}
        >
          ← Back to home
        </button>
      </article>
    </div>
  );
}
