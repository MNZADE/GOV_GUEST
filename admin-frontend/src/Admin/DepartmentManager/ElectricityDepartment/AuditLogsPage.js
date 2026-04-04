import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const statusColors = {
  Pending: "#facc15",
  "In Progress": "#38bdf8",
  Resolved: "#22c55e",
  Escalated: "#ef4444",
};

const AuditLogsPage = ({ departmentName = "Electricity Department" }) => {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("complaintUpdated", (data) => {
      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === data.complaintId ? data : c
        )
      );
    });

    socket.on("newComplaint", (data) => {
      setComplaints((prev) => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/complaints/audit")
      .then((res) => res.json())
      .then((data) => setComplaints(data))
      .catch(() => {
        setComplaints([
          {
            complaintId: "CMP-1001",
            contactNumber: "9876543210",
            location: "Ganesh Temple, Ward 5",
            ward: "Ward 5",
            issue: "Transformer Failure",
            priority: "Urgent",
            status: "Resolved",
            assignedOfficer: "Er. Suresh Jadhav",
            designation: "Junior Engineer",
            siteVisit: "Completed",
            createdAt: "20 Feb 2026",
            assignedAt: "20 Feb 2026",
            visitedAt: "20 Feb 2026",
            resolvedAt: "20 Feb 2026",
            latitude: 16.705,
            longitude: 74.243,
            image: "complaint1.jpg",
            remarks: "Transformer replaced successfully.",
          },
        ]);
      });
  }, []);

  /* ================= FILTER ================= */
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaintId?.toLowerCase().includes(search.toLowerCase()) ||
      c.ward?.toLowerCase().includes(search.toLowerCase()) ||
      c.issue?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ================= TIMELINE ================= */
  const getTimelineWidth = (c) => {
    if (c.resolvedAt) return "100%";
    if (c.visitedAt) return "75%";
    if (c.assignedAt) return "50%";
    return "25%";
  };

  return (
    <div style={{ padding: 25 }}>
      <h2>{departmentName} – Complaint Audit Logs</h2>

      {/* SEARCH + FILTER */}
      <div style={{ display: "flex", gap: 15, margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Search by ID / Ward / Issue"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Escalated">Escalated</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Complaint ID</th>
              <th style={thStyle}>Ward</th>
              <th style={thStyle}>Issue</th>
              <th style={thStyle}>Officer</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((c, index) => (
              <tr key={index}>
                <td style={tdStyle}>{c.complaintId}</td>
                <td style={tdStyle}>{c.ward}</td>
                <td style={tdStyle}>{c.issue}</td>
                <td style={tdStyle}>{c.assignedOfficer}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      background: statusColors[c.status],
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontWeight: "bold",
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    style={viewBtn}
                    onClick={() => setSelectedComplaint(c)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedComplaint && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>{selectedComplaint.complaintId} Details</h3>

            <p><strong>Contact:</strong> {selectedComplaint.contactNumber}</p>
            <p><strong>Location:</strong> {selectedComplaint.location}</p>
            <p><strong>Issue:</strong> {selectedComplaint.issue}</p>
            <p><strong>Officer:</strong> {selectedComplaint.assignedOfficer}</p>

            {selectedComplaint.image && (
              <img
                src={`http://localhost:5000/uploads/${selectedComplaint.image}`}
                alt="Complaint"
                style={imageStyle}
              />
            )}

            {selectedComplaint.latitude && (
              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                <GoogleMap
                  mapContainerStyle={mapStyle}
                  center={{
                    lat: selectedComplaint.latitude,
                    lng: selectedComplaint.longitude,
                  }}
                  zoom={14}
                >
                  <Marker
                    position={{
                      lat: selectedComplaint.latitude,
                      lng: selectedComplaint.longitude,
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            )}

            {/* Timeline */}
            <div style={{ marginTop: 20 }}>
              <div style={timelineContainer}>
                <div
                  style={{
                    ...timelineProgress,
                    width: getTimelineWidth(selectedComplaint),
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={closeBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 20,
};

const thStyle = {
  padding: 12,
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: 12,
  textAlign: "center",
};

const viewBtn = {
  background: "#3b82f6",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContent = {
  background: "#fff",
  padding: 25,
  width: "650px",
  borderRadius: 10,
  maxHeight: "90vh",
  overflowY: "auto",
};

const imageStyle = {
  width: "100%",
  borderRadius: 8,
  marginTop: 10,
};

const mapStyle = {
  width: "100%",
  height: "250px",
  marginTop: 15,
};

const timelineContainer = {
  height: 10,
  background: "#e5e7eb",
  borderRadius: 5,
};

const timelineProgress = {
  height: "100%",
  background: "#22c55e",
  borderRadius: 5,
};

const closeBtn = {
  padding: "8px 15px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

export default AuditLogsPage;