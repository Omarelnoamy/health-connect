import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaUserMd, FaUsers, FaHospitalAlt, FaSignInAlt } from "react-icons/fa"; // Import icons
import "./Layout.css"; // Make sure your CSS file is correctly linked

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? "expanded" : "collapsed"}`} onMouseEnter={toggleSidebar} onMouseLeave={toggleSidebar}>
        <h2 className="sidebar-logo">{sidebarOpen ? "Medical Information Bank" : "MIB"}</h2>
        <nav>
          <ul>
            <li><Link to="/"><FaHome /> {sidebarOpen && "Dashboard"}</Link></li>
            <li><Link to="/about"><FaUserMd /> {sidebarOpen && "About Us"}</Link></li>
            <li><Link to="/patients"><FaUsers /> {sidebarOpen && "Patients"}</Link></li>
            <li><Link to="/doctors"><FaHospitalAlt /> {sidebarOpen && "Doctors"}</Link></li>
            <li><Link to="/pharmacists"><FaHospitalAlt /> {sidebarOpen && "Pharmacists"}</Link></li>
            <li><Link to="/login"><FaSignInAlt /> {sidebarOpen && "Login"}</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
