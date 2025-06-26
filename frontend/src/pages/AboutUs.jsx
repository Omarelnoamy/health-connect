import React, { useEffect } from "react";
import Layout from "../components/Layout";
import MMPlogo from "../assets/MMP2.png"; // path to your image
import { useNavigate } from "react-router-dom";
import "./AboutUs.css";
import PageWrapper from "../components/PageWrapper";

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
    <PageWrapper>
      <>
        <div className="about-hero">
          <div className="hero-image" />
        </div>

        <div className="about-text">
          <h1>About My Medical Passport</h1>
          <p>
            My Medical Passport (MMP) is a graduation project developed by a
            team of passionate pharmacy students aiming to transform the way
            medical information is stored and accessed.
          </p>
          <p>
            We believe that every patient deserves fast, secure, and
            personalized access to their health records — whether during a
            routine check-up or a medical emergency.
          </p>
          <p>
            Our platform allows healthcare providers to retrieve essential
            patient data through a simple profile number or QR code, ensuring
            accuracy, efficiency, and safety in medical decision-making.
          </p>
          <p>
            We built MMP to be portable, user-friendly, and accessible to all,
            putting control of health information back into the hands of
            patients, while supporting healthcare professionals in delivering
            better care.
          </p>

          <button className="go-back-button" onClick={() => navigate("/")}>
            ⬅ Go Back
          </button>
        </div>
      </>
    </PageWrapper>
  );
}
