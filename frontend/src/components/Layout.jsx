import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaUserMd,
  FaUsers,
  FaHospitalAlt,
  FaSignInAlt,
} from "react-icons/fa";
import "./Layout.css";

const COMPACT_QUERY = "(max-width: 767px)";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compactNav, setCompactNav] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(COMPACT_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const onChange = () => setCompactNav(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (compactNav) {
      setSidebarOpen(false);
    }
  }, [compactNav]);

  const showLabels = sidebarOpen && !compactNav;

  return (
    <div className="layout">
      <aside
        className={`sidebar ${sidebarOpen ? "expanded" : "collapsed"}`}
        onMouseEnter={() => {
          if (!compactNav) setSidebarOpen(true);
        }}
        onMouseLeave={() => {
          if (!compactNav) setSidebarOpen(false);
        }}
      >
        <h2 className="sidebar-logo">
          {showLabels ? "My Medical Passport" : "MMP"}
        </h2>
        <nav>
          <ul>
            <li>
              <Link to="/">
                <FaHome /> {showLabels && "Dashboard"}
              </Link>
            </li>
            <li>
              <Link to="/about">
                <FaUserMd /> {showLabels && "About Us"}
              </Link>
            </li>
            <li>
              <Link to="/patients">
                <FaUsers /> {showLabels && "Patients"}
              </Link>
            </li>
            <li>
              <Link to="/doctors">
                <FaHospitalAlt /> {showLabels && "Doctors"}
              </Link>
            </li>
            <li>
              <Link to="/pharmacists">
                <FaHospitalAlt /> {showLabels && "Pharmacists"}
              </Link>
            </li>
            <li>
              <Link to="/login">
                <FaSignInAlt /> {showLabels && "Login"}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
