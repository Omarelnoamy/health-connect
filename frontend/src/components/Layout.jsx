import React, { useState, useEffect } from "react";
import logo from "../assets/MMP.png"; // or wherever your logo is

import { Link } from "react-router-dom";
import {
  FaHome,
  FaUserMd,
  FaUsers,
  FaHospitalAlt,
  FaSignInAlt,
  FaBars,
} from "react-icons/fa";
import "./Layout.css";

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // reset sidebar on desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`layout ${sidebarOpen ? "expanded" : ""}`}>
      {/* Show hamburger only on mobile */}
      {isMobile && (
        <button className="hamburger" onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}

      <aside
        className={`sidebar ${sidebarOpen ? "expanded" : ""}`}
        onMouseEnter={() => !isMobile && setSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setSidebarOpen(false)}
      >
        <h2 className="sidebar-logo">
          {sidebarOpen ? (
            "My Medical Passport"
          ) : (
            <img src={logo} alt="Logo" className="sidebar-logo-img" />
          )}
        </h2>

        <nav>
          <ul>
            <li>
              <Link to="/">
                <FaHome /> {sidebarOpen && "Dashboard"}
              </Link>
            </li>
            <li>
              <Link to="/about">
                <FaUserMd /> {sidebarOpen && "About Us"}
              </Link>
            </li>
            <li>
              <Link to="/patients">
                <FaUsers /> {sidebarOpen && "Patients"}
              </Link>
            </li>
            <li>
              <Link to="/doctors">
                <FaHospitalAlt /> {sidebarOpen && "Doctors"}
              </Link>
            </li>
            <li>
              <Link to="/pharmacists">
                <FaHospitalAlt /> {sidebarOpen && "Pharmacists"}
              </Link>
            </li>
            <li>
              <Link to="/login">
                <FaSignInAlt /> {sidebarOpen && "Login"}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
