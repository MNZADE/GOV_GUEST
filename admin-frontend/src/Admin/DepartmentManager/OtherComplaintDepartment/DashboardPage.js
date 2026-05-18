import React, {
  useState,
  useEffect,
} from "react";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  X,
} from "lucide-react";

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";

const DashboardPage = () => {

  /* =====================================================
     MODAL STATE
  ===================================================== */

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    currentImageIndex,
    setCurrentImageIndex,
  ] = useState(0);

  /* =====================================================
     STATES
  ===================================================== */

  const [stats, setStats] =
    useState([]);

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */

  useEffect(() => {

    const loadDashboard =
      async () => {

        try {

          setLoading(true);

          const token =
            localStorage.getItem(
              "kmc_token"
            );

          const savedUser =
            localStorage.getItem(
              "kmc_user"
            );

          if (
            !token ||
            !savedUser
          ) {

            console.log(
              "No token found"
            );

            return;
          }

          const user =
            JSON.parse(savedUser);

          /* =====================================================
             DEPARTMENT NORMALIZE
          ===================================================== */

          const deptMap = {

            "Health Department":
              "health department",

            "Sanitation Department":
              "sanitation department",

            "Water Supply Department":
              "water supply department",

            "Electricity Department":
              "electricity department",

            "Road & Transportation Department":
              "road & transportation department",

            "Drainage & Sewage Department":
              "drainage & sewage department",

            "General Complaint Department":
              "general complaint department",
          };

          const department =
            deptMap[
              user.department
            ] ||
            user.department;

          /* =====================================================
             FETCH DASHBOARD
          ===================================================== */

          const res =
            await fetch(

              `${BACKEND}/api/complaints/manager/${department}`,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await res.json();

          console.log(
            "Dashboard Data:",
            data
          );

          if (data.success) {

            setComplaints(
              data.complaints
            );

            const all =
              data.complaints;

            /* =====================================================
               STATS
            ===================================================== */

            const total =
              all.length;

            const pending =
              all.filter(
                (c) =>
                  c.status ===
                  "Pending"
              ).length;

            const resolved =
              all.filter(
                (c) =>
                  c.status ===
                  "Resolved"
              ).length;

            const escalated =
              all.filter(
                (c) =>
                  c.status ===
                  "Escalated"
              ).length;

            setStats([

              {
                title:
                  "Total Complaints",

                value: total,

                icon:
                  <FileText size={28} />,

                color:
                  "#2563eb",

                bg:
                  "#dbeafe",
              },

              {
                title:
                  "Pending",

                value:
                  pending,

                icon:
                  <Clock size={28} />,

                color:
                  "#f59e0b",

                bg:
                  "#fef3c7",
              },

              {
                title:
                  "Resolved",

                value:
                  resolved,

                icon:
                  <CheckCircle size={28} />,

                color:
                  "#16a34a",

                bg:
                  "#dcfce7",
              },

              {
                title:
                  "Escalated",

                value:
                  escalated,

                icon:
                  <AlertTriangle size={28} />,

                color:
                  "#dc2626",

                bg:
                  "#fee2e2",
              },
            ]);
          }

        } catch (err) {

          console.log(err);

        } finally {

          setLoading(false);
        }
      };

    loadDashboard();

  }, []);

  /* =====================================================
     SLA TIMER
  ===================================================== */

  const getSLATime = (
    createdAt,
    slaHours
  ) => {

    if (
      !createdAt ||
      !slaHours
    ) {

      return "N/A";
    }

    const endTime =
      new Date(createdAt)
        .getTime() +
      slaHours *
        60 *
        60 *
        1000;

    const now =
      new Date().getTime();

    const diff =
      endTime - now;

    if (diff <= 0) {

      return "SLA Breached";
    }

    const hours =
      Math.floor(
        diff /
          (1000 *
            60 *
            60)
      );

    const minutes =
      Math.floor(
        (
          diff %
          (1000 *
            60 *
            60)
        ) /
          (1000 * 60)
      );

    return `${hours}h ${minutes}m`;
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div
        style={
          styles.loadingContainer
        }
      >

        <h2>
          Loading Dashboard...
        </h2>

      </div>
    );
  }

  return (

    <div>

      {/* =====================================================
          STATS CARDS
      ===================================================== */}

      <div style={styles.grid}>

        {stats.map(
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

                <div>

                  <p
                    style={
                      styles.cardTitle
                    }
                  >
                    {
                      item.title
                    }
                  </p>

                  <h1
                    style={
                      styles.cardValue
                    }
                  >
                    {
                      item.value
                    }
                  </h1>

                </div>

                <div

                  style={{

                    ...styles.iconBox,

                    background:
                      item.bg,

                    color:
                      item.color,
                  }}
                >

                  {item.icon}

                </div>

              </div>

            </div>
          )
        )}

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div style={styles.tableCard}>

        <div style={styles.tableHeader}>

          <div>

            <h2
              style={
                styles.tableTitle
              }
            >
              Recent Complaints
            </h2>

            <p
              style={
                styles.tableSubtitle
              }
            >
              Smart Municipal Complaint Dashboard
            </p>

          </div>

        </div>

        <div style={styles.tableWrapper}>

          <table style={styles.table}>

            <thead>

              <tr
                style={
                  styles.tableHead
                }
              >

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
                  SLA Timer
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

              {complaints.map(
                (
                  item,
                  index
                ) => (

                  <tr
                    key={index}
                    style={styles.row}
                  >

                    <td style={styles.td}>
                      {
                        item.complaintId
                      }
                    </td>

                    <td style={styles.td}>
                      {
                        item.issue
                      }
                    </td>

                    {/* PRIORITY */}

                    <td style={styles.td}>

                      <span

                        style={{

                          ...styles.priorityBadge,

                          background:

                            item.priority ===
                            "Urgent"

                              ? "#fee2e2"

                              : item.priority ===
                                "High"

                              ? "#fef3c7"

                              : "#dbeafe",

                          color:

                            item.priority ===
                            "Urgent"

                              ? "#dc2626"

                              : item.priority ===
                                "High"

                              ? "#d97706"

                              : "#2563eb",
                        }}
                      >

                        {
                          item.priority
                        }

                      </span>

                    </td>

                    {/* SLA */}

                    <td style={styles.td}>

                      <span

                        style={{

                          ...styles.slaBadge,

                          background:

                            getSLATime(
                              item.createdAt,
                              item.slaHours
                            ) ===
                            "SLA Breached"

                              ? "#fee2e2"

                              : "#dcfce7",

                          color:

                            getSLATime(
                              item.createdAt,
                              item.slaHours
                            ) ===
                            "SLA Breached"

                              ? "#dc2626"

                              : "#16a34a",
                        }}
                      >

                        {getSLATime(
                          item.createdAt,
                          item.slaHours
                        )}

                      </span>

                    </td>

                    {/* STATUS */}

                    <td style={styles.td}>

                      <span

                        style={{

                          ...styles.statusBadge,

                          background:

                            item.status ===
                            "Resolved"

                              ? "#dcfce7"

                              : item.status ===
                                "Escalated"

                              ? "#fee2e2"

                              : item.status ===
                                "Pending"

                              ? "#fef3c7"

                              : "#dbeafe",

                          color:

                            item.status ===
                            "Resolved"

                              ? "#16a34a"

                              : item.status ===
                                "Escalated"

                              ? "#dc2626"

                              : item.status ===
                                "Pending"

                              ? "#d97706"

                              : "#2563eb",
                        }}
                      >

                        {
                          item.status
                        }

                      </span>

                    </td>

                    {/* ACTION */}

                    <td style={styles.td}>

                      <button

                        style={
                          styles.viewBtn
                        }

                        onClick={() => {

                          setSelectedComplaint(
                            item
                          );

                          setCurrentImageIndex(
                            0
                          );
                        }}
                      >

                        <Eye size={16} />

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

      {/* =====================================================
          MODAL
      ===================================================== */}

      {selectedComplaint && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            {/* HEADER */}

            <div
              style={
                styles.modalHeader
              }
            >

              <div>

                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  Complaint Details
                </h2>

                <p
                  style={
                    styles.modalSubtitle
                  }
                >
                  Smart Municipal Complaint System
                </p>

              </div>

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

                <X size={20} />

              </button>

            </div>

            {/* DETAILS */}

            <div
              style={
                styles.detailGrid
              }
            >

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  Complaint ID
                </label>

                <h3>
                  {
                    selectedComplaint.complaintId
                  }
                </h3>

              </div>

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  Priority
                </label>

                <h3>
                  {
                    selectedComplaint.priority
                  }
                </h3>

              </div>

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  SLA Time
                </label>

                <h3>
                  {getSLATime(
                    selectedComplaint.createdAt,
                    selectedComplaint.slaHours
                  )}
                </h3>

              </div>

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  Status
                </label>

                <h3>
                  {
                    selectedComplaint.status
                  }
                </h3>

              </div>

            </div>

            {/* IMAGE */}

            {selectedComplaint.images
              ?.length > 0 && (

              <div
                style={
                  styles.imageSection
                }
              >

                <div
                  style={
                    styles.imageHeader
                  }
                >

                  <h3
                    style={
                      styles.sectionTitle
                    }
                  >
                    Complaint Images
                  </h3>

                  <div
                    style={
                      styles.sliderControls
                    }
                  >

                    <button

                      style={
                        styles.sliderBtn
                      }

                      onClick={() => {

                        setCurrentImageIndex(

                          currentImageIndex ===
                          0

                            ? selectedComplaint
                                .images
                                .length -
                              1

                            : currentImageIndex -
                              1
                        );
                      }}
                    >
                      ◀
                    </button>

                    <button

                      style={
                        styles.sliderBtn
                      }

                      onClick={() => {

                        setCurrentImageIndex(

                          currentImageIndex ===

                          selectedComplaint
                            .images
                            .length -
                            1

                            ? 0

                            : currentImageIndex +
                              1
                        );
                      }}
                    >
                      ▶
                    </button>

                  </div>

                </div>

                <img

                  src={`${BACKEND}/uploads/${
                    selectedComplaint
                      .images[
                      currentImageIndex
                    ]
                  }`}

                  alt="complaint"

                  style={
                    styles.complaintImage
                  }
                />

              </div>
            )}

            {/* ISSUE */}

            <div style={styles.bigCard}>

              <label>
                Complaint Issue
              </label>

              <h3>
                {
                  selectedComplaint.issue
                }
              </h3>

            </div>

            {/* DESCRIPTION */}

            <div style={styles.bigCard}>

              <label>
                Description
              </label>

              <p>
                {
                  selectedComplaint.description
                }
              </p>

            </div>

            {/* LOCATION */}

            <div
              style={
                styles.locationCard
              }
            >

              <h3
                style={
                  styles.sectionTitle
                }
              >
                Complaint Location
              </h3>

              <p
                style={
                  styles.locationText
                }
              >
                {
                  selectedComplaint.address
                }
              </p>

              <iframe
                title="map"
                src={`https://maps.google.com/maps?q=${selectedComplaint.address}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                style={
                  styles.mapFrame
                }
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

const styles = {

  loadingContainer: {

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    height: "70vh",

    fontSize: 24,

    fontWeight: 700,

    color: "#2563eb",
  },

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",

    gap: 24,

    marginBottom: 35,
  },

  card: {

    background: "#ffffff",

    padding: 28,

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",

    border:
      "1px solid #e2e8f0",
  },

  cardTop: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",
  },

  cardTitle: {

    margin: 0,

    color: "#64748b",

    fontSize: 15,
  },

  cardValue: {

    margin: 0,

    marginTop: 10,

    fontSize: 38,

    fontWeight: 700,

    color: "#0f172a",
  },

  iconBox: {

    width: 65,

    height: 65,

    borderRadius: 20,

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",
  },

  tableCard: {

    background: "#ffffff",

    borderRadius: 26,

    padding: 28,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",

    border:
      "1px solid #e2e8f0",
  },

  tableHeader: {

    marginBottom: 25,
  },

  tableTitle: {

    margin: 0,

    fontSize: 26,

    fontWeight: 700,

    color: "#0f172a",
  },

  tableSubtitle: {

    color: "#64748b",

    marginTop: 8,
  },

  tableWrapper: {

    overflowX: "auto",
  },

  table: {

    width: "100%",

    borderCollapse:
      "collapse",
  },

  tableHead: {

    background: "#f8fafc",
  },

  th: {

    padding: 18,

    textAlign: "left",

    fontSize: 14,

    fontWeight: 700,

    color: "#334155",
  },

  td: {

    padding: 18,

    borderBottom:
      "1px solid #e2e8f0",

    fontSize: 14,
  },

  row: {

    transition: "0.3s",
  },

  priorityBadge: {

    padding: "8px 14px",

    borderRadius: 30,

    fontSize: 12,

    fontWeight: 700,
  },

  slaBadge: {

    padding: "8px 14px",

    borderRadius: 30,

    fontSize: 12,

    fontWeight: 700,
  },

  statusBadge: {

    padding: "8px 14px",

    borderRadius: 30,

    fontSize: 12,

    fontWeight: 700,
  },

  viewBtn: {

    display: "flex",

    alignItems: "center",

    gap: 8,

    background: "#2563eb",

    color: "#fff",

    border: "none",

    padding: "10px 16px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
  },

  overlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.6)",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    zIndex: 9999,

    padding: 20,
  },

  modal: {

    width: "100%",

    maxWidth: 1100,

    background: "#fff",

    borderRadius: 28,

    padding: 30,

    maxHeight: "90vh",

    overflowY: "auto",
  },

  modalHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 30,
  },

  modalTitle: {

    margin: 0,

    fontSize: 30,

    fontWeight: 700,
  },

  modalSubtitle: {

    color: "#64748b",

    marginTop: 8,
  },

  closeBtn: {

    width: 50,

    height: 50,

    borderRadius: 14,

    border: "none",

    background: "#f1f5f9",

    cursor: "pointer",
  },

  detailGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",

    gap: 20,

    marginBottom: 30,
  },

  detailCard: {

    background: "#f8fafc",

    padding: 22,

    borderRadius: 20,

    border:
      "1px solid #e2e8f0",
  },

  imageSection: {

    background: "#f8fafc",

    padding: 24,

    borderRadius: 22,

    marginBottom: 24,

    border:
      "1px solid #e2e8f0",
  },

  imageHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 18,
  },

  sectionTitle: {

    margin: 0,

    fontSize: 22,

    fontWeight: 700,

    color: "#0f172a",
  },

  sliderControls: {

    display: "flex",

    gap: 10,
  },

  sliderBtn: {

    width: 42,

    height: 42,

    borderRadius: 12,

    border: "none",

    background: "#2563eb",

    color: "#fff",

    cursor: "pointer",

    fontWeight: 700,

    fontSize: 16,
  },

  complaintImage: {

    width: "100%",

    height: 400,

    objectFit: "cover",

    borderRadius: 20,
  },

  bigCard: {

    background: "#f8fafc",

    padding: 24,

    borderRadius: 20,

    marginBottom: 24,

    border:
      "1px solid #e2e8f0",
  },

  locationCard: {

    background: "#f8fafc",

    padding: 24,

    borderRadius: 22,

    border:
      "1px solid #e2e8f0",

    marginBottom: 24,
  },

  locationText: {

    color: "#475569",

    marginTop: 10,

    marginBottom: 20,

    fontSize: 15,
  },

  mapFrame: {

    width: "100%",

    height: 320,

    border: 0,

    borderRadius: 18,
  },
};

export default DashboardPage;