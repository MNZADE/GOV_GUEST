import React, { useState } from "react";
import { Eye, Trash2, Clock, RefreshCw } from "lucide-react";

const ComplaintsPage = ({ departmentName }) => {

  const [complaints, setComplaints] = useState([
    {
      id: "SAN-1001",
      title: "Garbage Not Collected",
      ward: "Ward 5",
      address: "MG Road, Andheri East, Mumbai",
      description: "Garbage not collected for 3 days.",
      status: "Pending",
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
      lat: 19.1136,
      lng: 72.8697,
      images: [
        "https://images.unsplash.com/photo-1581579185169-8d8e8c5c91a5",
        "https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62",
      ],
    },
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusDraft, setStatusDraft] = useState({});
  const [zoomImage, setZoomImage] = useState(null);

  /* ================= SLA TIMER ================= */

  const getSLATime = (createdAt) => {
    const SLA_HOURS = 24;
    const diff = Date.now() - createdAt;
    const remaining = SLA_HOURS * 60 * 60 * 1000 - diff;

    if (remaining <= 0) return { text: "SLA Breached", breached: true };

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return { text: `${hours}h ${minutes}m`, breached: false };
  };

  const handleUpdate = (id) => {
    if (!statusDraft[id]) return;

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: statusDraft[id] } : c
      )
    );
  };

  const deleteComplaint = (id) => {
    setComplaints((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div style={pageContainer}>
      <h1 style={title}>{departmentName} – Complaint Monitoring</h1>

      {/* ================= TABLE ================= */}

      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr style={headerRow}>
              <th style={th}>ID</th>
              <th style={th}>Title</th>
              <th style={th}>Ward</th>
              <th style={th}>SLA</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((c) => {
              const sla = getSLATime(c.createdAt);

              return (
                <tr key={c.id} style={rowStyle}>
                  <td style={tdStrong}>{c.id}</td>
                  <td style={td}>{c.title}</td>
                  <td style={td}>{c.ward}</td>

                  <td style={td}>
                    <span
                      style={{
                        ...slaText,
                        color: sla.breached ? "#dc2626" : "#059669",
                      }}
                    >
                      <Clock size={14} style={{ marginRight: 5 }} />
                      {sla.text}
                    </span>
                  </td>

                  <td style={td}>
                    <select
                      defaultValue={c.status}
                      onChange={(e) =>
                        setStatusDraft({
                          ...statusDraft,
                          [c.id]: e.target.value,
                        })
                      }
                      style={dropdown}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Escalated</option>
                      <option>Resolved</option>
                    </select>
                  </td>

                  <td style={td}>
                    <div style={actionButtons}>
                      <button
                        style={updateButton}
                        onClick={() => handleUpdate(c.id)}
                      >
                        <RefreshCw size={14}/> Update
                      </button>

                      <button
                        style={viewButton}
                        onClick={() => setSelectedComplaint(c)}
                      >
                        <Eye size={14}/> View
                      </button>

                      <button
                        style={deleteButton}
                        onClick={() => deleteComplaint(c.id)}
                      >
                        <Trash2 size={14}/> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= IAS LEVEL VIEW MODAL ================= */}

      {selectedComplaint && (
        <div style={overlay}>
          <div style={iasModal}>

            <div style={iasHeader}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedComplaint.id}</h2>
                <p style={headerSub}>Official Complaint Record</p>
              </div>

              <div style={headerRight}>
                <span style={iasStatusBadge(selectedComplaint.status)}>
                  {selectedComplaint.status}
                </span>

                <button
                  onClick={() => setSelectedComplaint(null)}
                  style={closeBtn}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={iasBody}>

              {/* LEFT SIDE */}
              <div style={iasColumn}>
                <Section title="Complaint Information">
                  <InfoRow label="Title" value={selectedComplaint.title} />
                  <InfoRow label="Ward" value={selectedComplaint.ward} />
                  <InfoRow label="Address" value={selectedComplaint.address} />
                  <InfoRow label="Description" value={selectedComplaint.description} />
                </Section>
              </div>

              {/* RIGHT SIDE */}
              <div style={iasColumn}>

                <Section title="Image Evidence">
                  <div style={imageGallery}>
                    {selectedComplaint.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt=""
                        style={galleryImage}
                        onClick={() => setZoomImage(img)}
                      />
                    ))}
                  </div>
                </Section>

                <Section title="Geo Location">
                  <iframe
                    title="map"
                    width="100%"
                    height="220"
                    style={mapStyle}
                    src={`https://www.google.com/maps?q=${selectedComplaint.lat},${selectedComplaint.lng}&z=15&output=embed`}
                  ></iframe>
                </Section>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= IMAGE ZOOM LIGHTBOX ================= */}

      {zoomImage && (
        <div style={overlay} onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="" style={zoomStyle}/>
        </div>
      )}

    </div>
  );
};

/* ================= COMPONENTS ================= */

const Section = ({ title, children }) => (
  <div style={sectionBox}>
    <h3 style={sectionTitle}>{title}</h3>
    <div style={{ marginTop: 15 }}>{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={infoRow}>
    <span style={infoLabel}>{label}</span>
    <span style={infoValue}>{value}</span>
  </div>
);

/* ================= STYLES ================= */

const pageContainer = {
  padding: 40,
  background: "#eef2f7",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui",
};

const title = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 25,
};

const tableContainer = {
  background: "#ffffff",
  borderRadius: 14,
  padding: 25,
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
};

const table = { width: "100%", borderCollapse: "collapse" };
const headerRow = { background: "#f8fafc" };
const th = { textAlign: "left", padding: 14, fontSize: 13, color: "#64748b" };
const td = { padding: 14, fontSize: 14 };
const tdStrong = { ...td, fontWeight: 600 };
const rowStyle = { borderBottom: "1px solid #f1f5f9" };

const slaText = { display: "flex", alignItems: "center", fontWeight: 600 };
const dropdown = { padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 12 };

const actionButtons = { display: "flex", gap: 8 };

const updateButton = {
  background: "#0ea5e9",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const viewButton = {
  background: "#2563eb",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const deleteButton = {
  background: "#dc2626",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const iasModal = {
  background: "#ffffff",
  width: "95%",
  maxWidth: 1100,
  borderRadius: 18,
  padding: 30,
  boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
  maxHeight: "92vh",
  overflowY: "auto",
};

const iasHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: 15,
  marginBottom: 25,
};

const headerSub = { fontSize: 13, color: "#64748b", marginTop: 4 };

const headerRight = { display: "flex", alignItems: "center", gap: 15 };

const iasBody = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 30,
};

const iasColumn = { display: "flex", flexDirection: "column", gap: 25 };

const sectionBox = {
  background: "#f9fafb",
  borderRadius: 14,
  padding: 20,
  border: "1px solid #e5e7eb",
};

const sectionTitle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#1f2937",
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
};

const infoLabel = { fontSize: 13, color: "#6b7280" };
const infoValue = { fontSize: 14, fontWeight: 500, color: "#111827" };

const imageGallery = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
  gap: 10,
};

const galleryImage = {
  width: "100%",
  height: 90,
  objectFit: "cover",
  borderRadius: 8,
  cursor: "zoom-in",
};

const mapStyle = { borderRadius: 12, marginTop: 10 };

const iasStatusBadge = (status) => ({
  padding: "6px 14px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    status === "Resolved"
      ? "#dcfce7"
      : status === "Escalated"
      ? "#fee2e2"
      : "#fef3c7",
  color:
    status === "Resolved"
      ? "#166534"
      : status === "Escalated"
      ? "#991b1b"
      : "#92400e",
});

const closeBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
};

const zoomStyle = {
  maxWidth: "90%",
  maxHeight: "90%",
  borderRadius: 12,
};

export default ComplaintsPage;