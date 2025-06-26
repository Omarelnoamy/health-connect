import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/MMP2.png";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login data:", form);
    // Add login logic here
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <img src={logo} alt="MMP Logo" className="login-logo" />
        <h2 className="login-heading">Welcome to MMP</h2>
        <p className="login-sub">Access your medical passport</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              placeholder=" "
            />
            <label>Email</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              placeholder=" "
            />
            <label>Password</label>
          </div>
          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>
        <p className="login-footer">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </div>
  );
}
