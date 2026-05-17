import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

const DashboardPage = () => {

  const [stats, setStats] =
    useState({

      total: 0,

      pending: 0,

      resolved: 0,

      escalated: 0,
    });

  const [
    recentComplaints,
    setRecentComplaints,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  /* =====================================
     FETCH DASHBOARD DATA
  ===================================== */

  useEffect(() => {

    fetchDashboardData();

  }, []);

  const fetchDashboardData =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await axios.get(

            "http://localhost:5000/api/complaints/manager/drainage",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          response.data.success
        ) {

          const complaints =
            response.data.complaints ||
            [];

          setStats({

            total:
              complaints.length,

            pending:
              complaints.filter(

                (c) =>
                  c.status ===
                  "Pending"
              ).length,

            resolved:
              complaints.filter(

                (c) =>
                  c.status ===
                  "Resolved"
              ).length,

            escalated:
              complaints.filter(

                (c) =>

                  c.status ===
                    "Escalated" ||

                  c.priority ===
                    "Urgent"
              ).length,
          });

          setRecentComplaints(
            complaints
          );
        }

      } catch (err) {

        console.error(
          "Dashboard Error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================
     DASHBOARD CARDS
  ===================================== */

  const cards = [

    {

      title:
        "Total Complaints",

      value: stats.total,

      icon: "📋",

      color: "#2563eb",

      bg: "#dbeafe",
    },

    {

      title: "Pending",

      value: stats.pending,

      icon: "⏳",

      color: "#f59e0b",

      bg: "#fef3c7",
    },

    {

      title: "Resolved",

      value: stats.resolved,

      icon: "✅",

      color: "#16a34a",

      bg: "#dcfce7",
    },

    {

      title: "Escalated",

      value: stats.escalated,

      icon: "🚨",

      color: "#dc2626",

      bg: "#fee2e2",
    },
  ];

  return (

    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>

            Drainage, Sewage & Garbage Collection Department

          </h1>

          <p style={styles.subTitle}>

            Smart Municipal Governance Dashboard

          </p>

        </div>

        <div style={styles.liveContainer}>

          <span style={styles.liveDot}></span>

          System Active

        </div>

      </div>

      {/* LOADING */}

      {loading ? (

        <div style={styles.loadingBox}>

          Loading Dashboard...

        </div>

      ) : (

        <>
          {/* STATS CARDS */}

          <div style={styles.grid}>

            {cards.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  style={styles.card}
                >

                  <div
                    style={
                      styles.cardTop
                    }
                  >

                    <div

                      style={{

                        ...styles.iconBox,

                        background:
                          item.bg,
                      }}
                    >

                      <span
                        style={
                          styles.icon
                        }
                      >

                        {item.icon}

                      </span>

                    </div>

                    <div

                      style={{

                        ...styles.badge,

                        background:
                          item.bg,

                        color:
                          item.color,
                      }}
                    >

                      Active

                    </div>

                  </div>

                  <h3
                    style={
                      styles.cardTitle
                    }
                  >

                    {item.title}

                  </h3>

                  <h1

                    style={{

                      ...styles.cardValue,

                      color:
                        item.color,
                    }}
                  >

                    {item.value}

                  </h1>

                  <div
                    style={
                      styles.progressBar
                    }
                  >

                    <div

                      style={{

                        ...styles.progressFill,

                        background:
                          item.color,

                        width: `${Math.min(
                          item.value / 10,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>

          {/* RECENT COMPLAINTS */}

          <div style={styles.sectionCard}>

            <div style={styles.sectionHeader}>

              <h2 style={styles.sectionTitle}>
                Recent Complaints
              </h2>

            </div>

            <div style={styles.tableWrapper}>

              <table style={styles.table}>

                <thead>

                  <tr>

                    <th style={styles.th}>
                      Complaint ID
                    </th>

                    <th style={styles.th}>
                      Issue
                    </th>

                    <th style={styles.th}>
                      Priority
                    </th>

                    <th style={styles.th}>
                      SLA
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>

                    <th style={styles.th}>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentComplaints.map(
                    (c) => (

                      <tr
                        key={c._id}
                      >

                        {/* COMPLAINT ID */}

                        <td style={styles.td}>

                          {c.complaintId}

                        </td>

                        {/* ISSUE */}

                        <td style={styles.td}>

                          {c.issue}

                        </td>

                        {/* PRIORITY */}

                        <td style={styles.td}>

                          <span

                            style={{

                              ...styles.priorityBadge,

                              background:

                                c.priority ===
                                "Urgent"

                                  ? "#fee2e2"

                                  : c.priority ===
                                    "Medium"

                                  ? "#fef3c7"

                                  : "#dcfce7",

                              color:

                                c.priority ===
                                "Urgent"

                                  ? "#dc2626"

                                  : c.priority ===
                                    "Medium"

                                  ? "#d97706"

                                  : "#16a34a",
                            }}
                          >

                            {c.priority ||
                              "Normal"}

                          </span>

                        </td>

                        {/* SLA */}

                        <td style={styles.td}>

                          <span

                            style={{

                              ...styles.slaBadge,

                              background:

                                c.priority ===
                                "Urgent"

                                  ? "#fee2e2"

                                  : c.priority ===
                                    "Medium"

                                  ? "#fef3c7"

                                  : "#dcfce7",

                              color:

                                c.priority ===
                                "Urgent"

                                  ? "#dc2626"

                                  : c.priority ===
                                    "Medium"

                                  ? "#d97706"

                                  : "#16a34a",
                            }}
                          >

                            {c.priority ===
                            "Urgent"

                              ? "Urgent SLA"

                              : c.priority ===
                                "Medium"

                              ? "Medium SLA"

                              : "Normal SLA"}

                          </span>

                        </td>

                        {/* STATUS */}

                        <td style={styles.td}>

                          <span

                            style={{

                              ...styles.statusBadge,

                              background:

                                c.status ===
                                "Resolved"

                                  ? "#dcfce7"

                                  : c.status ===
                                    "Pending"

                                  ? "#fef3c7"

                                  : "#fee2e2",

                              color:

                                c.status ===
                                "Resolved"

                                  ? "#16a34a"

                                  : c.status ===
                                    "Pending"

                                  ? "#f59e0b"

                                  : "#dc2626",
                            }}
                          >

                            {c.status}

                          </span>

                        </td>

                        {/* ACTION */}

                        <td style={styles.td}>

                          <button

                            style={
                              styles.viewBtn
                            }

                            onClick={() =>
                              setSelectedComplaint(
                                c
                              )
                            }
                          >

                            View

                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>
        </>
      )}

      {/* MODAL */}

      {selectedComplaint && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            {/* HEADER */}

            <div style={styles.modalHeader}>

              <h2 style={styles.modalTitle}>
                Complaint Details
              </h2>

              <button

                style={
                  styles.closeBtn
                }

                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }
              >

                ✕

              </button>

            </div>

            {/* IMAGE */}

            <div style={styles.imageWrapper}>

              {selectedComplaint.image ? (

                <img

                  src={
                    selectedComplaint.image
                  }

                  alt="Complaint"

                  style={
                    styles.image
                  }
                />

              ) : (

                <div
                  style={
                    styles.noImage
                  }
                >

                  No Image Uploaded

                </div>
              )}

            </div>

            {/* DETAILS */}

            <div style={styles.detailGrid}>

              <div style={styles.detailCard}>

                <span style={styles.label}>
                  Complaint ID
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.complaintId
                  }
                </p>

              </div>

              <div style={styles.detailCard}>

                <span style={styles.label}>
                  Status
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.status
                  }
                </p>

              </div>

              <div style={styles.detailCard}>

                <span style={styles.label}>
                  Priority
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.priority
                  }
                </p>

              </div>

              <div style={styles.detailCard}>

                <span style={styles.label}>
                  SLA
                </span>

                <p style={styles.value}>

                  {selectedComplaint.priority ===
                  "Urgent"

                    ? "Urgent SLA"

                    : selectedComplaint.priority ===
                      "Medium"

                    ? "Medium SLA"

                    : "Normal SLA"}

                </p>

              </div>

              <div style={styles.fullCard}>

                <span style={styles.label}>
                  Issue
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.issue
                  }
                </p>

              </div>

              <div style={styles.fullCard}>

                <span style={styles.label}>
                  Description
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.description
                  }
                </p>

              </div>

              <div style={styles.fullCard}>

                <span style={styles.label}>
                  Address
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.address
                  }
                </p>

              </div>

              <div style={styles.fullCard}>

                <span style={styles.label}>
                  Geo Tag Location
                </span>

                <p style={styles.value}>

                  Latitude:
                  {" "}
                  {
                    selectedComplaint.latitude ||
                    "N/A"
                  }

                  <br />

                  Longitude:
                  {" "}
                  {
                    selectedComplaint.longitude ||
                    "N/A"
                  }

                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* =====================================
   STYLES
===================================== */

const styles = {

  page: {

    padding: 20,
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 30,

    flexWrap: "wrap",

    gap: 15,
  },

  title: {

    margin: 0,

    fontSize: 32,

    fontWeight: 800,

    color: "#0f172a",
  },

  subTitle: {

    marginTop: 8,

    color: "#64748b",

    fontSize: 15,
  },

  liveContainer: {

    display: "flex",

    alignItems: "center",

    gap: 10,

    background:
      "#ffffff",

    padding: "12px 18px",

    borderRadius: 14,

    fontWeight: 700,

    boxShadow:
      "0 6px 20px rgba(0,0,0,0.08)",
  },

  liveDot: {

    width: 10,

    height: 10,

    borderRadius: "50%",

    background:
      "#16a34a",
  },

  loadingBox: {

    height: 300,

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    fontSize: 24,

    fontWeight: 700,
  },

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",

    gap: 24,

    marginBottom: 30,
  },

  card: {

    background:
      "#ffffff",

    padding: 24,

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",

    border:
      "1px solid #e2e8f0",
  },

  cardTop: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",
  },

  iconBox: {

    width: 60,

    height: 60,

    borderRadius: 18,

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",
  },

  icon: {

    fontSize: 28,
  },

  badge: {

    padding: "6px 12px",

    borderRadius: 20,

    fontSize: 12,

    fontWeight: 700,
  },

  cardTitle: {

    marginTop: 20,

    color: "#475569",

    fontSize: 16,

    fontWeight: 600,
  },

  cardValue: {

    marginTop: 10,

    fontSize: 42,

    fontWeight: 800,
  },

  progressBar: {

    width: "100%",

    height: 8,

    background:
      "#e2e8f0",

    borderRadius: 20,

    overflow: "hidden",

    marginTop: 20,
  },

  progressFill: {

    height: "100%",

    borderRadius: 20,
  },

  sectionCard: {

    background:
      "#ffffff",

    padding: 24,

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",

    border:
      "1px solid #e2e8f0",
  },

  sectionHeader: {

    marginBottom: 20,
  },

  sectionTitle: {

    margin: 0,

    fontSize: 22,

    fontWeight: 700,

    color: "#0f172a",
  },

  tableWrapper: {

    overflowX: "auto",
  },

  table: {

    width: "100%",

    borderCollapse: "collapse",
  },

  th: {

    textAlign: "left",

    padding: 14,

    background:
      "#f8fafc",

    color: "#475569",

    fontSize: 13,
  },

  td: {

    padding: 14,

    borderBottom:
      "1px solid #e2e8f0",

    fontSize: 14,
  },

  priorityBadge: {

    padding: "6px 12px",

    borderRadius: 20,

    fontSize: 12,

    fontWeight: 700,
  },

  slaBadge: {

    padding: "6px 12px",

    borderRadius: 20,

    fontSize: 12,

    fontWeight: 700,
  },

  statusBadge: {

    padding: "6px 12px",

    borderRadius: 20,

    fontSize: 12,

    fontWeight: 700,
  },

  viewBtn: {

    border: "none",

    background:
      "#2563eb",

    color: "#fff",

    padding: "8px 14px",

    borderRadius: 10,

    cursor: "pointer",

    fontWeight: 700,
  },

  modalOverlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.5)",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    zIndex: 999,
  },

  modal: {

    width: "900px",

    maxWidth: "95%",

    background:
      "#ffffff",

    borderRadius: 24,

    padding: 30,

    maxHeight: "90vh",

    overflowY: "auto",
  },

  modalHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 20,
  },

  modalTitle: {

    margin: 0,

    fontSize: 28,

    fontWeight: 800,
  },

  closeBtn: {

    width: 40,

    height: 40,

    borderRadius: "50%",

    border: "none",

    background:
      "#ef4444",

    color: "#fff",

    cursor: "pointer",

    fontSize: 18,
  },

  imageWrapper: {

    marginBottom: 25,
  },

  image: {

    width: "100%",

    height: 350,

    objectFit: "cover",

    borderRadius: 20,
  },

  noImage: {

    height: 250,

    borderRadius: 20,

    background:
      "#f1f5f9",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    fontWeight: 700,
  },

  detailGrid: {

    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: 18,
  },

  detailCard: {

    background:
      "#f8fafc",

    padding: 18,

    borderRadius: 16,
  },

  fullCard: {

    gridColumn:
      "1 / span 2",

    background:
      "#f8fafc",

    padding: 18,

    borderRadius: 16,
  },

  label: {

    fontSize: 12,

    color: "#64748b",

    fontWeight: 700,
  },

  value: {

    marginTop: 10,

    lineHeight: 1.7,

    fontWeight: 600,
  },
};

export default DashboardPage;