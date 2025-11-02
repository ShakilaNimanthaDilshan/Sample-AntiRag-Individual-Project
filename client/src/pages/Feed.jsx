// client/src/pages/Feed.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Feed() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState(""); // <-- State for the search input
  const [isLoading, setIsLoading] = useState(false); // <-- For user feedback

  // Fetch all reports when the page first loads
  useEffect(() => {
    fetchReports();
  }, []);

  // Updated function to handle both all reports AND searches
  const fetchReports = async (searchTerm = "") => {
    setIsLoading(true);
    let url = "/api/reports";

    if (searchTerm) {
      // If we have a search term, add it as a query parameter
      url = `/api/reports?q=${encodeURIComponent(searchTerm)}`;
    }

    try {
      const res = await api(url);

      if (Array.isArray(res)) {
        setReports(res);
      } else {
        console.error("Failed to fetch reports:", res.message);
        setReports([]);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
    }
    setIsLoading(false);
  };

  // --- NEW: Handler for submitting the search ---
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Stop the form from reloading the page
    fetchReports(search); // Call fetchReports with the current search term
  };

  // --- NEW: Handler to clear the search ---
  const handleClearSearch = () => {
    setSearch("");
    fetchReports(""); // Call fetchReports with an empty term to get all reports
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h2>Recent Reports</h2>
      <Link to="/new">Create report</Link>

      {/* --- NEW: SEARCH BAR --- */}
      <form
        onSubmit={handleSearchSubmit}
        style={{ margin: "20px 0", display: "flex", gap: "8px" }}
      >
        <input
          type="text"
          placeholder="Search report titles and content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", flex: 1, fontSize: "16px" }}
        />
        <button type="submit" style={{ padding: "8px 12px" }}>
          Search
        </button>
        <button
          type="button"
          onClick={handleClearSearch}
          style={{ padding: "8px 12px" }}
        >
          Clear
        </button>
      </form>
      {/* --- END OF SEARCH BAR --- */}

      <div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {reports.length === 0 && <p>No reports found.</p>}

            {reports.map((r) => (
              <Link
                to={`/report/${r._id}`}
                key={r._id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article
                  style={{
                    border: "1px solid #ddd",
                    padding: 10,
                    marginTop: 10,
                    cursor: "pointer",
                  }}
                >
                  <h3>{r.title || "Experience"}</h3>
                  <small>
                    {r.university?.name} •{" "}
                    {new Date(r.createdAt).toLocaleString()}
                  </small>
                  <p>
                    {r.anonymous
                      ? "Posted anonymously"
                      : r.author
                      ? r.author.isStudent
                        ? r.author.name // If they are a student, show their name
                        : `A ${r.author.profession || "Public Member"}` // If not a student, show "A (Profession)"
                      : "Unknown"}
                  </p>
                  <p
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {r.body}
                  </p>
                </article>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
