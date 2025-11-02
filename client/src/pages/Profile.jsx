// client/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, setUser } = useAuth(); // Get user and setUser from context

  // Initialize state from the user object in context
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // When user object changes, update the name field
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Check if passwords match
    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Prepare payload. Only include fields that are being updated.
      const payload = { name };
      if (password) {
        payload.password = password;
      }

      const res = await api("/api/users/me", {
        method: "PUT",
        body: payload,
      });

      if (res._id) {
        // --- THIS IS THE CRITICAL PART ---
        // 1. Update the Auth Context
        setUser(res);
        // 2. Update localStorage so it persists on refresh
        localStorage.setItem("user", JSON.stringify(res));
        // --- END CRITICAL PART ---

        setMessage("Profile updated successfully!");
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(res.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>Your Profile</h2>
      <form onSubmit={handleSubmit}>
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ marginBottom: 15 }}>
          <label>Email (cannot be changed)</label>
          <input
            type="email"
            value={email}
            disabled
            style={{ width: "100%", padding: 8, background: "#eee" }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          />
        </div>

        <hr style={{ margin: "20px 0" }} />

        <p>Leave passwords blank to keep your current password.</p>

        <div style={{ marginBottom: 15 }}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
          />
        </div>

        <button type="submit">Update Profile</button>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <p>
            By using this service, you agree to our
            <Link to="/terms" target="_blank" rel="noopener noreferrer">
              {" "}
              Terms and Conditions
            </Link>
            .
          </p>
        </div>
      </form>
    </div>
  );
}
