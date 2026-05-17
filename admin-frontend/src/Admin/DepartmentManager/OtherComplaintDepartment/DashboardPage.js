import React, {
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  X,
} from "lucide-react";

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
     STATS
  ===================================================== */

  const stats = [

    {
      title: "Total Complaints",
      value: 820,
      icon:
        <FileText size={28} />,
      color: "#2563eb",
      bg: "#dbeafe",
    },

    {
      title: "Pending",
      value: 210,
      icon:
        <Clock size={28} />,
      color: "#f59e0b",
      bg: "#fef3c7",
    },

    {
      title: "Resolved",
      value: 510,
      icon:
        <CheckCircle size={28} />,
      color: "#16a34a",
      bg: "#dcfce7",
    },

    {
      title: "Escalated",
      value: 100,
      icon:
        <AlertTriangle size={28} />,
      color: "#dc2626",
      bg: "#fee2e2",
    },
  ];

  /* =====================================================
     COMPLAINT DATA
  ===================================================== */

  const complaints = [

    {
      id:
        "GEN-2026-001",

      issue:
        "Street Light Not Working",

      description:
        "Street lights are not working from last 3 days in Shivaji Nagar area.",

      address:
        "Shivaji Nagar, Kolhapur",

      priority:
        "High",

      sla:
        "2 Hours",

      status:
        "Pending",

      department:
        "General Complaint Department",

      createdAt:
        "18 May 2026",

      adminMessage:
        "Electrical team assigned for inspection.",

      images: [

        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",

        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",

        "https://images.unsplash.com/photo-1494526585095-c41746248156",
      ],
    },

    {
      id:
        "GEN-2026-002",

      issue:
        "Garbage Overflow",

      description:
        "Garbage collection has not been done properly in the area.",

      address:
        "Rajarampuri, Kolhapur",

      priority:
        "Medium",

      sla:
        "6 Hours",

      status:
        "In Progress",

      department:
        "General Complaint Department",

      createdAt:
        "17 May 2026",

      adminMessage:
        "Cleaning staff dispatched.",

      images: [

        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",

        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      ],
    },

    {
      id:
        "GEN-2026-003",

      issue:
        "Water Leakage",

      description:
        "Heavy water leakage near main road causing traffic issues.",

      address:
        "Tarabai Park, Kolhapur",

      priority:
        "Urgent",

      sla:
        "1 Hour",

      status:
        "Escalated",

      department:
        "General Complaint Department",

      createdAt:
        "16 May 2026",

      adminMessage:
        "Urgent repair work started.",

      images: [

        "https://images.unsplash.com/photo-1494526585095-c41746248156",

        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      ],
    },
  ];

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
                style={styles.cardTop}
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

            <h2 style={styles.tableTitle}>
              Recent Complaints
            </h2>

            <p style={styles.tableSubtitle}>
              Smart Municipal Complaint Dashboard
            </p>

          </div>

        </div>

        <div style={styles.tableWrapper}>

          <table style={styles.table}>

            <thead>

              <tr style={styles.tableHead}>

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
                  SLA Level
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
                      {item.id}
                    </td>

                    <td style={styles.td}>
                      {item.issue}
                    </td>

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

                        {item.priority}

                      </span>

                    </td>

                    <td style={styles.td}>
                      {item.sla}
                    </td>

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

                        {item.status}

                      </span>

                    </td>

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

            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  Complaint Details
                </h2>

                <p style={styles.modalSubtitle}>
                  Smart Municipal Complaint System
                </p>

              </div>

              <button

                style={styles.closeBtn}

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

            <div style={styles.detailGrid}>

              <div style={styles.detailCard}>
                <label>
                  Complaint ID
                </label>

                <h3>
                  {
                    selectedComplaint.id
                  }
                </h3>
              </div>

              <div style={styles.detailCard}>
                <label>
                  Department
                </label>

                <h3>
                  {
                    selectedComplaint.department
                  }
                </h3>
              </div>

              <div style={styles.detailCard}>
                <label>
                  Priority
                </label>

                <h3>
                  {
                    selectedComplaint.priority
                  }
                </h3>
              </div>

              <div style={styles.detailCard}>
                <label>
                  Status
                </label>

                <h3>
                  {
                    selectedComplaint.status
                  }
                </h3>
              </div>

              <div style={styles.detailCard}>
                <label>
                  SLA Level
                </label>

                <h3>
                  {
                    selectedComplaint.sla
                  }
                </h3>
              </div>

              <div style={styles.detailCard}>
                <label>
                  Created Date
                </label>

                <h3>
                  {
                    selectedComplaint.createdAt
                  }
                </h3>
              </div>

            </div>

            {/* IMAGE SLIDER */}

            <div style={styles.imageSection}>

              <div style={styles.imageHeader}>

                <h3 style={styles.sectionTitle}>
                  Complaint Images
                </h3>

                <div style={styles.sliderControls}>

                  <button

                    style={styles.sliderBtn}

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

                    style={styles.sliderBtn}

                    onClick={() => {

                      setCurrentImageIndex(

                        currentImageIndex ===

                        selectedComplaint
                          .images.length -
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

                src={
                  selectedComplaint
                    .images[
                    currentImageIndex
                  ]
                }

                alt="complaint"

                style={
                  styles.complaintImage
                }
              />

            </div>

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

            <div style={styles.locationCard}>

              <h3 style={styles.sectionTitle}>
                Complaint Location
              </h3>

              <p style={styles.locationText}>
                {
                  selectedComplaint.address
                }
              </p>

              <iframe
                title="map"
                src={`https://maps.google.com/maps?q=${selectedComplaint.address}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                style={styles.mapFrame}
              />

            </div>

            {/* ADMIN */}

            <div style={styles.bigCard}>

              <label>
                Admin Message
              </label>

              <p>
                {
                  selectedComplaint.adminMessage
                }
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* =====================================================
   STYLES
===================================================== */

const styles = {

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
    justifyContent: "center",
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