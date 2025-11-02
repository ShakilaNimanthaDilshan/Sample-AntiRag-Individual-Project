import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ padding: 10, borderBottom: "1px solid #eee", display: "flex", gap: "10px", alignItems: "center" }}>
      <Link to="/">Feed</Link>
      <Link to="/analytics">Analytics</Link>
      <Link to="/help-resources" style={{ color: 'red', fontWeight: 'bold' }}> Get Help </Link>
      <Link to="/new">New Report</Link>

      {/* This div pushes everything else to the right */}
      <div style={{ flex: 1 }}></div> 

      {user ? (
        <>
          {/* --- THIS IS THE NEW/UPDATED BLOCK --- */}
          {user.role === "admin" && (
            <Link to="/admin" style={{ color: "red" }}>
              Admin
            </Link>
          )}
          {(user.role === "admin" || user.role === "moderator") && (
            <Link to="/moderation" style={{ color: "orange" }}>
              Moderation
            </Link>
          )}
          {/* --- END OF NEW/UPDATED BLOCK --- */}

          <Link to="/profile">
            Profile ({user.name})
          </Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}