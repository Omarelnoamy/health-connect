import React from "react";
import "./HomePage.css";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="home-container">
     


      <main className="main-content">
        <header className="main-header">
          <h1>Welcome to the Medical Information Bank</h1>
          <p>Secure, reliable, and modern health data collaboration platform.</p>
        </header>

        <section className="features">
          <div className="feature-box">
            <h3>✔️ Secure Records</h3>
            <p>Store and manage patient data with privacy-first technology.</p>
          </div>
          <div className="feature-box">
            <h3>🧠 Smart Collaboration</h3>
            <p>Doctors and pharmacists can access and share medical info smoothly.</p>
          </div>
          <div className="feature-box">
            <h3>📊 Real-Time Updates</h3>
            <p>Live updates and synchronized views across departments.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
