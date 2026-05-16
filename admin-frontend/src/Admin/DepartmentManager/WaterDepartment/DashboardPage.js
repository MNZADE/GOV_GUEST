import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Eye,
  X,
  MapPin,
  CalendarDays,
  User,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= STAT CARD ================= */

const StatCard = ({ icon, label, value }) => (
  <div style={styles.card}>
    <div style={styles.iconBox}>{icon}</div>

    <div>
      <p style={styles.cardLabel}>{label}</p>
      <h2 style={styles.cardValue}>{value}</h2>
    </div>
  </div>
);

/* ================= BADGE ================= */

const Badge = ({ text }) => {

  const colors = {

    Urgent: "#ef4444",

    Escalated: "#f97316",

    Resolved: "#22c55e",

    Pending: "#eab308",

    "In Progress": "#3b82f6",

    Normal: "#64748b",

  };

  const color = colors[text] || "#64748b";

  return (
    <span
      style={{

        background: `${color}20`,

        color,

        padding: "8px 15px",

        borderRadius: 30,

        fontSize: 12,

        fontWeight: 700,

        border: `1px solid ${color}40`,

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        minWidth: "90px",

        letterSpacing: "0.3px",

        boxShadow: `0 4px 12px ${color}20`,

        backdropFilter: "blur(6px)",

      }}
    >
      {text}
    </span>
  );
};

/* ================= MAIN ================= */

const DashboardPage = ({
  departmentName = "Water Department",
}) => {
  const [complaints, setComplaints] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [currentImage, setCurrentImage] = useState(0);

  const [, setTick] = useState(0);

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token =
          localStorage.getItem("kmc_token");

        const user = JSON.parse(
          localStorage.getItem("kmc_user")
        );

        if (!token || !user) return;

        const role = user.role;

        const department = user.department
          ?.toLowerCase()
          .replace(" supply department", "")
          .replace(" department", "")
          .trim();

        let apiUrl = "";

        if (role === "system_manager") {
          apiUrl =
            "http://localhost:5000/api/complaints/system/all";
        } else if (
          role === "department_manager"
        ) {
          apiUrl = `http://localhost:5000/api/complaints/manager/${department}`;
        }

        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

/* =====================================
   AUTO PRIORITY ASSIGNMENT
===================================== */

if (data.success) {

  const updatedComplaints = (data.complaints || []).map((c) => {

    let priority = "Normal";

    const issueText =
      `${c.issue} ${c.description}`.toLowerCase();

    const createdHours =
      (Date.now() - new Date(c.createdAt)) /
      (1000 * 60 * 60);

    /* =====================================
       WATER DEPARTMENT URGENT CASES
    ===================================== */

    if (
      issueText.includes("pipe burst") ||
      issueText.includes("pipeline burst") ||
      issueText.includes("water leakage") ||
      issueText.includes("severe leakage") ||
      issueText.includes("no water") ||
      issueText.includes("water not coming") ||
      issueText.includes("dirty water") ||
      issueText.includes("drinking water") ||
      issueText.includes("water overflow")
    ) {
      priority = "Urgent";
    }

    /* =====================================
       NORMAL CASES
    ===================================== */

    if (
      issueText.includes("low pressure") ||
      issueText.includes("minor leakage") ||
      issueText.includes("slow water")
    ) {
      priority = "Normal";
    }

    /* =====================================
       ESCALATION AFTER 48 HOURS
    ===================================== */

    if (
      createdHours > 48 &&
      c.status !== "Resolved"
    ) {
      priority = "Escalated";
    }

    return {
      ...c,
      priority,
    };
  });

  setComplaints(updatedComplaints);

} else {

  setComplaints([]);
}
      } catch (err) {
        console.error(err);
      }
    };

    fetchComplaints();
  }, []);

  /* ================= SLA ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getSLA = (createdAt, status) => {
    const hours =
      (Date.now() - new Date(createdAt)) /
      (1000 * 60 * 60);

    if (status === "Resolved")
      return {
        label: "Resolved",
        color: "#16a34a",
      };

    if (hours > 48)
      return {
        label: "Escalated",
        color: "#dc2626",
      };

    if (hours > 24)
      return {
        label: "Warning",
        color: "#f59e0b",
      };

    return {
      label: "Normal",
      color: "#2563eb",
    };
  };

  /* ================= DATE ================= */

  const formatDateTime = (date) => {
    const d = new Date(date);

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= FILTER ================= */

  const filteredComplaints = complaints.filter(
    (c) => {
      const matchesSearch =
        (c.issue || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (c.complaintId || "").includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        c.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        c.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    }
  );

  /* ================= IMAGE ================= */

  const nextImage = () => {
    if (
      currentImage <
      (selectedComplaint?.images?.length || 0) - 1
    ) {
      setCurrentImage(currentImage + 1);
    }
  };

  const prevImage = () => {
    if (currentImage > 0) {
      setCurrentImage(currentImage - 1);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            {departmentName} Dashboard
          </h1>

          <p style={styles.subtitle}>
            Smart Complaint Monitoring &
            Governance System
          </p>
        </div>
      </div>

      {/* CARDS */}

      <div style={styles.grid}>
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Total Complaints"
          value={complaints.length}
        />

        <StatCard
          icon={<Clock size={24} />}
          label="Pending"
          value={
            complaints.filter(
              (c) => c.status === "Pending"
            ).length
          }
        />

        <StatCard
          icon={<AlertTriangle size={24} />}
          label="Escalated"
          value={
            complaints.filter(
              (c) => c.priority === "Escalated"
            ).length
          }
        />

        <StatCard
          icon={<CheckCircle size={24} />}
          label="Resolved"
          value={
            complaints.filter(
              (c) => c.status === "Resolved"
            ).length
          }
        />
      </div>

      {/* FILTERS */}

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#64748b" />

          <input
            type="text"
            placeholder="Search complaint..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            style={styles.input}
          />
        </div>

       <select
  style={styles.select}
  value={priorityFilter}
  onChange={(e) =>
    setPriorityFilter(e.target.value)
  }
>
  <option>All</option>
  <option>Normal</option>
  <option>Urgent</option>
  <option>Escalated</option>
</select>

        <select
          style={styles.select}
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
        >
          <option>All</option>
          <option>Normal</option>
          <option>Urgent</option>
          <option>Escalated</option>
        </select>
      </div>

      {/* TABLE */}

      <div style={styles.tableWrapper}>
        <div style={styles.tableTop}>
          <h3 style={{ margin: 0 }}>
            Complaint Records
          </h3>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Complaint ID</th>
              <th style={styles.th}>Issue</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>SLA</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c, index) => {
              const sla = getSLA(
                c.createdAt,
                c.status
              );

              return (
                <tr key={c._id} style={styles.tr}>
                  <td style={styles.td}>
                    {index + 1}
                  </td>

                  <td style={styles.tdId}>
                    {c.complaintId}
                  </td>

                  <td style={styles.issueTd}>
                    {c.issue}
                  </td>

                  <td style={styles.td}>
                    <Badge text={c.priority} />
                  </td>

                  <td style={styles.td}>
                    <Badge text={c.status} />
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        background: `${sla.color}15`,
                        color: sla.color,
                        padding: "6px 12px",
                        borderRadius: 30,
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {sla.label}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {formatDateTime(
                      c.createdAt
                    )}
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.viewBtn}
                      onClick={() => {
                        setSelectedComplaint(c);
                        setCurrentImage(0);
                      }}
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}

      {selectedComplaint && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            {/* HEADER */}

            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ margin: 0 }}>
                  Complaint Details
                </h2>

                <p style={styles.modalSub}>
                  Complete complaint information
                </p>
              </div>

              <button
                style={styles.closeBtn}
                onClick={() =>
                  setSelectedComplaint(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            {/* TOP DETAILS */}

            <div style={styles.detailCards}>
              <div style={styles.detailCard}>
                <User size={18} />
                <div>
                  <span style={styles.label}>
                    Complaint ID
                  </span>

                  <h4>
                    {
                      selectedComplaint.complaintId
                    }
                  </h4>
                </div>
              </div>

              <div style={styles.detailCard}>
                <CalendarDays size={18} />
                <div>
                  <span style={styles.label}>
                    Created Date
                  </span>

                  <h4>
                    {formatDateTime(
                      selectedComplaint.createdAt
                    )}
                  </h4>
                </div>
              </div>
            </div>

            {/* MAIN INFO */}

            <div style={styles.infoBox}>
              <h3 style={styles.infoTitle}>
                Complaint Information
              </h3>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <label>Issue</label>

                  <p>
                    {selectedComplaint.issue}
                  </p>
                </div>

                <div style={styles.infoItem}>
                  <label>Status</label>

                  <div>
                    <Badge
                      text={
                        selectedComplaint.status
                      }
                    />
                  </div>
                </div>

                <div style={styles.infoItem}>
                  <label>Priority</label>

                  <div>
                    <Badge
                      text={
                        selectedComplaint.priority
                      }
                    />
                  </div>
                </div>

                <div style={styles.infoItem}>
                  <label>Description</label>

                  <p>
                    {
                      selectedComplaint.description
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* GEO LOCATION */}

            {(selectedComplaint.latitude ||
              selectedComplaint.longitude) && (
              <div style={styles.mapSection}>
                <div style={styles.mapTitle}>
                  <MapPin size={18} />

                  <h3>Complaint Location</h3>
                </div>

                <iframe
                  title="map"
                  width="100%"
                  height="250"
                  style={styles.map}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${selectedComplaint.latitude},${selectedComplaint.longitude}&z=15&output=embed`}
                />

                <div style={styles.locationText}>
                  Latitude:{" "}
                  {selectedComplaint.latitude}
                  <br />
                  Longitude:{" "}
                  {
                    selectedComplaint.longitude
                  }
                </div>
              </div>
            )}
{/* ================= IMAGE SLIDER ================= */}

{selectedComplaint.images &&
  selectedComplaint.images.length > 0 && (
    <div style={styles.galleryBox}>
      <div style={styles.galleryTitle}>
        <ImageIcon size={18} />
        <h3>Complaint Images</h3>
      </div>

      {/* ================= MAIN IMAGE ================= */}

      <div style={styles.sliderContainer}>
        <button
          style={{
            ...styles.arrowBtn,
            opacity: currentImage === 0 ? 0.5 : 1,
            cursor:
              currentImage === 0
                ? "not-allowed"
                : "pointer",
          }}
          onClick={prevImage}
          disabled={currentImage === 0}
        >
          <ChevronLeft />
        </button>

        <img
          src={`http://localhost:5000/uploads/${encodeURIComponent(
            selectedComplaint.images[
              currentImage
            ]
              ?.split(/[\\/]/)
              ?.pop()
          )}`}
          alt="complaint"
          style={styles.mainImage}
          onError={(e) => {
            console.log(
              "❌ Image Load Error:",
              selectedComplaint.images[
                currentImage
              ]
            );

            console.log(
              "❌ Tried URL:",
              e.target.src
            );

            e.target.src =
              "https://dummyimage.com/700x420/e2e8f0/64748b&text=Image+Not+Found";
          }}
        />

        <button
          style={{
            ...styles.arrowBtn,
            opacity:
              currentImage ===
              selectedComplaint.images.length -
                1
                ? 0.5
                : 1,

            cursor:
              currentImage ===
              selectedComplaint.images.length -
                1
                ? "not-allowed"
                : "pointer",
          }}
          onClick={nextImage}
          disabled={
            currentImage ===
            selectedComplaint.images.length -
              1
          }
        >
          <ChevronRight />
        </button>
      </div>

      {/* ================= IMAGE COUNTER ================= */}

      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          color: "#64748b",
          fontWeight: 600,
        }}
      >
        {currentImage + 1} /{" "}
        {selectedComplaint.images.length}
      </div>

      {/* ================= THUMBNAILS ================= */}

      <div style={styles.thumbnailRow}>
        {selectedComplaint.images.map(
          (img, index) => (
            <img
              key={index}
              src={`http://localhost:5000/uploads/${encodeURIComponent(
                img
                  ?.split(/[\\/]/)
                  ?.pop()
              )}`}
              alt={`thumb-${index}`}
              onClick={() =>
                setCurrentImage(index)
              }
              style={{
                ...styles.thumbnail,

                border:
                  currentImage === index
                    ? "3px solid #2563eb"
                    : "2px solid transparent",

                transform:
                  currentImage === index
                    ? "scale(1.05)"
                    : "scale(1)",

                transition: "0.3s",
              }}
              onError={(e) => {
                e.target.src =
                  "https://dummyimage.com/90x90/e2e8f0/64748b&text=No+Image";
              }}
            />
          )
        )}
      </div>
    </div>
  )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: 25,
    background: "#f1f5f9",
    minHeight: "100vh",
  },

  header: {
    marginBottom: 25,
  },

  title: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a",
    fontWeight: 800,
  },

  subtitle: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 15,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: 20,
    marginBottom: 25,
  },

  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 22,
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background:
      "linear-gradient(135deg,#1e3a8a,#2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
  },

  cardValue: {
    marginTop: 4,
    marginBottom: 0,
    fontSize: 28,
    color: "#0f172a",
  },

  filterBar: {
    display: "flex",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 25,
  },

  searchBox: {
    flex: 1,
    minWidth: 260,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    padding: "12px 16px",
    borderRadius: 14,
    boxShadow:
      "0 5px 18px rgba(15,23,42,0.05)",
  },

  input: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: 14,
    background: "transparent",
  },

  select: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #dbeafe",
    background: "#fff",
    outline: "none",
    cursor: "pointer",
    minWidth: 160,
  },

  tableWrapper: {
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow:
      "0 12px 35px rgba(15,23,42,0.06)",
  },

  tableTop: {
    padding: 22,
    borderBottom: "1px solid #e2e8f0",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#f8fafc",
    padding: "18px 16px",
    textAlign: "center",
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
    borderBottom: "1px solid #e2e8f0",
  },

  tr: {
    transition: "0.2s",
  },

  td: {
    padding: "18px 16px",
    textAlign: "center",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
    color: "#0f172a",
    fontWeight: 500,
  },

  tdId: {
    padding: "18px 16px",
    textAlign: "center",
    borderBottom: "1px solid #f1f5f9",
    fontWeight: 700,
    color: "#2563eb",
  },

  issueTd: {
    padding: "18px 16px",
    textAlign: "left",
    borderBottom: "1px solid #f1f5f9",
    maxWidth: 260,
    fontWeight: 600,
    color: "#0f172a",
  },

  viewBtn: {
    border: "none",
    background:
      "linear-gradient(135deg,#1e3a8a,#2563eb)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 600,
  },

  /* MODAL */

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 1100,
    maxHeight: "95vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 28,
    padding: 28,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  modalSub: {
    marginTop: 5,
    color: "#64748b",
  },

  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "none",
    background: "#f1f5f9",
    cursor: "pointer",
  },

  detailCards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: 18,
    marginBottom: 25,
  },

  detailCard: {
    background: "#f8fafc",
    borderRadius: 18,
    padding: 20,
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  label: {
    color: "#64748b",
    fontSize: 13,
  },

  infoBox: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 24,
    marginBottom: 25,
  },

  infoTitle: {
    marginTop: 0,
    marginBottom: 20,
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20,
  },

  infoItem: {
    background: "#f8fafc",
    padding: 18,
    borderRadius: 16,
  },

  mapSection: {
    marginBottom: 25,
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
    padding: 24,
  },

  mapTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },

  map: {
    border: "none",
    borderRadius: 18,
  },

  locationText: {
    marginTop: 12,
    color: "#475569",
    fontWeight: 500,
  },

  galleryBox: {
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
    padding: 24,
  },

  galleryTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },

  sliderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },

  arrowBtn: {
    width: 48,
    height: 48,
    borderRadius: 50,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },

  mainImage: {
    width: "100%",
    maxWidth: 700,
    height: 420,
    objectFit: "cover",
    borderRadius: 20,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.15)",
  },

  thumbnailRow: {
    display: "flex",
    gap: 12,
    marginTop: 20,
    overflowX: "auto",
    paddingBottom: 10,
  },

  thumbnail: {
    width: 90,
    height: 90,
    objectFit: "cover",
    borderRadius: 12,
    cursor: "pointer",
    flexShrink: 0,
  },
};

export default DashboardPage;