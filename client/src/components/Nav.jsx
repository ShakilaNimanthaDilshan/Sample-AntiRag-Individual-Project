import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ padding: 10, borderBottom: "1px solid #eee" }}>
      <Link to="/">Feed</Link>
      {" | "}
      <Link to="/analytics">Analytics</Link> {/* <-- ADDED */}
      {" | "}
      <Link to="/new">New Report</Link> {/* <-- ADDED */}
      {" | "}
      {user ? (
        <>
          {user.role === "admin" && (
            <>
              <Link to="/admin" style={{ color: "red", marginRight: "10px" }}>
                Admin
              </Link>
              {" | "}
            </>
          )}

          {/* --- THIS IS THE CHANGE --- */}
          <Link to="/profile" style={{ marginRight: "10px" }}>
            Profile ({user.name})
          </Link>
          <button onClick={logout}>Logout</button>
          {/* --- END OF CHANGE --- */}
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          {" | "}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}