import React from "react";
import "./Footer.css";
import medlyLogo from "../assets/medly.png"; // adjust path if needed

export default function Footer() {
  return (
    <footer className="footer">
      <span>Powered by Medly</span>
      <img src={medlyLogo} alt="Medly Logo" className="medly-logo" />
    </footer>
  );
}
