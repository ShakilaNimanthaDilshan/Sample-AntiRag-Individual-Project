// client/src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [isStudent, setIsStudent] = useState(true); // Default to being a student
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [profession, setProfession] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");

  // For the university dropdown
  const [universityId, setUniversityId] = useState("");
  const [universities, setUniversities] = useState([]);
  const [otherUniversityName, setOtherUniversityName] = useState("");

  const nav = useNavigate();

  // Fetch universities when the component loads
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const u = await api("/api/universities");
        if (Array.isArray(u)) {
          setUniversities(u.filter((uni) => uni.status !== "pending"));
        }
      } catch (err) {
        console.error("Failed to fetch universities", err);
      }
    };
    fetchUniversities();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // --- Frontend Validation ---
    if (!terms) {
      setError("You must accept the terms and conditions to register.");
      return;
    }
    if (isStudent) {
      if (!universityId) return setError("Please select a university.");
      if (universityId === "OTHER" && !otherUniversityName.trim()) {
        return setError("Please enter your university name.");
      }
      if (!yearOfStudy) return setError("Please select your year of study.");
    } else {
      if (!profession.trim()) return setError("Please enter your profession.");
    }
    // --- End Validation ---

    try {
      const payload = {
        name,
        email,
        password,
        city,
        isStudent,
        universityId,
        otherUniversityName,
        yearOfStudy,
        profession,
        terms,
      };

      const res = await api("/api/auth/register", {
        method: "POST",
        body: payload,
      });

      if (res.message === "User registered successfully") {
        alert("Registration successful! Please log in.");
        nav("/login");
      } else {
        // This should be caught by the catch block, but as a fallback
        let errorMsg = res.message || "Registration failed.";
        if (res.errors && Array.isArray(res.errors) && res.errors.length > 0) {
          errorMsg = res.errors[0].msg;
        }
        setError(errorMsg);
      }
    } catch (err) {
      let errorMsg = "Registration failed. Please try again.";
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        errorMsg = err.errors[0].msg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    }
  };

  // Helper styles
  const inputStyle = { padding: "10px", fontSize: "16px" };
  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>Register</h2>
      <form
        onSubmit={submit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          placeholder="Full name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          style={inputStyle}
        />
        <input
          placeholder="Password (min 6 characters) *"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          placeholder="City *"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          style={inputStyle}
        />

        <hr />

        {/* --- This is the new conditional logic --- */}

        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={isStudent}
            onChange={(e) => setIsStudent(e.target.checked)}
          />
          I am a university student
        </label>

        {isStudent ? (
          <>
            {/* --- STUDENT FIELDS --- */}
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="" disabled>
                -- Select your University --
              </option>
              {universities.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
              <option value="OTHER">Other (Please specify)</option>
            </select>

            {universityId === "OTHER" && (
              <input
                type="text"
                placeholder="Please enter university name *"
                value={otherUniversityName}
                onChange={(e) => setOtherUniversityName(e.target.value)}
                required
                style={inputStyle}
              />
            )}

            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="" disabled>
                -- Select Year of Study --
              </option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </>
        ) : (
          <>
            {/* --- NON-STUDENT FIELD --- */}
            <input
              type="text"
              placeholder="Your Profession (e.g., Lecturer, Journalist, Activist) *"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              required
              style={inputStyle}
            />
          </>
        )}
        {/* --- End of conditional logic --- */}

        <hr />

        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">
              Terms and Conditions
            </Link>
          </span>
        </label>

        <button
          type="submit"
          style={{
            padding: "10px",
            fontSize: "16px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Register
        </button>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      </form>
    </div>
  );
}
