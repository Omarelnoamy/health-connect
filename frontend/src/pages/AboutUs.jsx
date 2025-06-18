import React, { useEffect } from "react";
import Layout from "../components/Layout";
import MIBLogo from "../assets/MIB.jpeg"; // path to your image
import { useNavigate } from "react-router-dom";
import "./AboutUs.css";

export default function AboutUs() {
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      const heroImage = document.querySelector(".hero-image");
      if (heroImage) {
        heroImage.style.transform = `translateY(${scrollY * 0.2}px)`; // Adjust multiplier for speed
      }
    });

    return () => {
      window.removeEventListener("scroll", () => {});
    };
  }, []);

  return (
    <>
      <div className="about-hero">
        <div className="hero-image" />
      </div>

      <div className="about-text">
        <h1>About Medical Information Bank</h1>
        <p>
          MIB is your trusted digital partner in healthcare. It enables doctors
          and pharmacists to securely access vital patient information — including
          medical history, past reservations, treatment outcomes, and shared
          impressions from healthcare professionals.
        </p>
        <p>
          With MIB, healthcare providers can make faster, more informed decisions
          and deliver personalized care.
        </p>
        <p>
          This platform brings a new level of transparency and collaboration to
          healthcare — improving outcomes, saving time, and building trust.
        </p>

        <button className="go-back-button" onClick={() => navigate("/")}>
          ⬅ Go Back
        </button>
      </div>
    </>
  );
}
