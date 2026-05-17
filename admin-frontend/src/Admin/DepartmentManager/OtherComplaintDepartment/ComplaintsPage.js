import React, {
  useState,
  useEffect,
} from "react";

const ComplaintsPage = () => {

  const [
    complaints,
    setComplaints,
  ] = useState([

    {
      id: "OC-101",

      issue:
        "Public Noise Complaint",

      citizen:
        "Rahul Sharma",

      phone:
        "9876543210",

      description:
        "Loud music and public disturbance during night hours near the residential area.",

      status: "Pending",

      priority: "Urgent",

      date: "18 May 2026",

      rejectReason: "",

      slaHours: 6,

      createdAt:
        new Date().getTime() -
        2 * 60 * 60 * 1000,

      geoTag: {

        latitude:
          "16.7050",

        longitude:
          "74.2433",

        address:
          "Near Main Market Road, Kolhapur",
      },

      images: [

        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",

        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",

        "https://images.unsplash.com/photo-1494526585095-c41746248156",
      ],
    },

    {
      id: "OC-102",

      issue:
        "Illegal Parking",

      citizen:
        "Amit Patil",

      phone:
        "9988776655",

      description:
        "Vehicles are parked illegally blocking the main road.",

      status: "Resolved",

      priority: "Normal",

      date: "17 May 2026",

      rejectReason: "",

      slaHours: 48,

      createdAt:
        new Date().getTime() -
        10 * 60 * 60 * 1000,

      geoTag: {

        latitude:
          "16.7082",

        longitude:
          "74.2401",

        address:
          "Station Road, Kolhapur",
      },

      images: [

        "https://images.unsplash.com/photo-1503376780353-7e6692767b70",

        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",

        "https://images.unsplash.com/photo-1489824904134-891ab64532f1",
      ],
    },

    {
      id: "OC-103",

      issue:
        "Public Disturbance",

      citizen:
        "Sneha Verma",

      phone:
        "8877665544",

      description:
        "Public fight and disturbance created in market area.",

      status:
        "In Progress",

      priority: "Medium",

      date: "16 May 2026",

      rejectReason: "",

      slaHours: 12,

      createdAt:
        new Date().getTime() -
        5 * 60 * 60 * 1000,

      geoTag: {

        latitude:
          "16.7099",

        longitude:
          "74.2455",

        address:
          "Market Area, Kolhapur",
      },

      images: [

        "https://images.unsplash.com/photo-1517841905240-472988babdf9",

        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",

        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
      ],
    },
  ]);

  const [
    rejectModal,
    setRejectModal,
  ] = useState(false);

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    rejectReason,
    setRejectReason,
  ] = useState("");

  const [
    viewComplaint,
    setViewComplaint,
  ] = useState(null);

  const [
    currentImage,
    setCurrentImage,
  ] = useState(0);

  const [, setRefresh] =
    useState(false);

  /* =====================================================
     LIVE TIMER
  ===================================================== */

  useEffect(() => {

    const interval =
      setInterval(() => {

        setRefresh(
          (prev) => !prev
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, []);

  /* =====================================================
     STATUS UPDATE
  ===================================================== */

  const handleStatusChange = (
    complaintId,
    newStatus
  ) => {

    if (
      newStatus ===
      "Rejected"
    ) {

      setSelectedComplaint(
        complaintId
      );

      setRejectModal(true);

      return;
    }

    const updated =
      complaints.map((item) =>

        item.id ===
        complaintId

          ? {
              ...item,
              status:
                newStatus,
            }

          : item
      );

    setComplaints(updated);
  };

  /* =====================================================
     SAVE REJECT REASON
  ===================================================== */

  const saveRejectReason =
    () => {

      if (
        rejectReason.trim() ===
        ""
      ) {

        alert(
          "Please enter reject reason"
        );

        return;
      }

      const updated =
        complaints.map(
          (item) =>

            item.id ===
            selectedComplaint

              ? {
                  ...item,
                  status:
                    "Rejected",
                  rejectReason:
                    rejectReason,
                }

              : item
        );

      setComplaints(updated);

      setRejectModal(false);

      setRejectReason("");

      setSelectedComplaint(
        null
      );
    };

  /* =====================================================
     SLA TIMER
  ===================================================== */

  const getRemainingTime = (
    createdAt,
    slaHours
  ) => {

    const endTime =
      createdAt +
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

    const seconds =
      Math.floor(
        (
          diff %
          (1000 * 60)
        ) / 1000
      );

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  /* =====================================================
     STATUS STYLE
  ===================================================== */

  const getStatusStyle = (
    status
  ) => {

    switch (status) {

      case "Pending":
        return {

          background:
            "#fef3c7",

          color:
            "#d97706",
        };

      case "Resolved":
        return {

          background:
            "#dcfce7",

          color:
            "#16a34a",
        };

      case "In Progress":
        return {

          background:
            "#dbeafe",

          color:
            "#2563eb",
        };

      case "Escalated":
        return {

          background:
            "#fee2e2",

          color:
            "#dc2626",
        };

      case "Rejected":
        return {

          background:
            "#e2e8f0",

          color:
            "#475569",
        };

      default:
        return {

          background:
            "#f1f5f9",

          color:
            "#334155",
        };
    }
  };

  /* =====================================================
     PRIORITY STYLE
  ===================================================== */

  const getPriorityStyle = (
    priority
  ) => {

    switch (priority) {

      case "Urgent":
        return {

          background:
            "#fee2e2",

          color:
            "#dc2626",
        };

      case "Medium":
        return {

          background:
            "#fef3c7",

          color:
            "#d97706",
        };

      case "Normal":
        return {

          background:
            "#dcfce7",

          color:
            "#16a34a",
        };

      default:
        return {

          background:
            "#e2e8f0",

          color:
            "#475569",
        };
    }
  };

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Complaints Management
          </h1>

          <p style={styles.subtitle}>
            Monitor complaints
            with SLA tracking
          </p>

        </div>

      </div>

      {/* TABLE */}

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
                SLA Timer
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {complaints.map((c) => (

              <tr
                key={c.id}
                style={styles.tr}
              >

                <td style={styles.td}>
                  <strong>
                    {c.id}
                  </strong>
                </td>

                <td style={styles.td}>
                  {c.issue}
                </td>

                <td style={styles.td}>

                  <span
                    style={{
                      ...styles.priorityBadge,
                      ...getPriorityStyle(
                        c.priority
                      ),
                    }}
                  >
                    {c.priority}
                  </span>

                </td>

                <td style={styles.td}>

                  <span
                    style={
                      styles.slaTimer
                    }
                  >
                    {getRemainingTime(
                      c.createdAt,
                      c.slaHours
                    )}
                  </span>

                </td>

                <td style={styles.td}>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(
                        c.status
                      ),
                    }}
                  >
                    {c.status}
                  </span>

                </td>

                <td style={styles.td}>

                  <div
                    style={
                      styles.actionWrapper
                    }
                  >

                    <select

                      value={c.status}

                      style={
                        styles.dropdown
                      }

                      onChange={(
                        e
                      ) =>
                        handleStatusChange(
                          c.id,
                          e.target
                            .value
                        )
                      }
                    >

                      <option>
                        Pending
                      </option>

                      <option>
                        In Progress
                      </option>

                      <option>
                        Escalated
                      </option>

                      <option>
                        Resolved
                      </option>

                      <option>
                        Rejected
                      </option>

                    </select>

                    <button
                      style={
                        styles.updateButton
                      }
                    >
                      Update
                    </button>

                    <button

                      style={
                        styles.viewButton
                      }

                      onClick={() => {

                        setViewComplaint(
                          c
                        );

                        setCurrentImage(
                          0
                        );
                      }}
                    >
                      View
                    </button>

                  </div>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* VIEW MODAL */}

      {viewComplaint && (

        <div style={styles.modalOverlay}>

          <div style={styles.viewModal}>

            <div style={styles.modalTop}>

              <h2
                style={
                  styles.modalTitle
                }
              >
                Complaint Details
              </h2>

              <button

                style={
                  styles.closeIcon
                }

                onClick={() =>
                  setViewComplaint(
                    null
                  )
                }
              >
                ✕
              </button>

            </div>

            {/* IMAGE SLIDER */}

            <div
              style={
                styles.sliderContainer
              }
            >

              <img

                src={
                  viewComplaint
                    .images[
                    currentImage
                  ]
                }

                alt="complaint"

                style={
                  styles.sliderImage
                }
              />

              <button

                style={{
                  ...styles.sliderBtn,
                  left: 10,
                }}

                onClick={() => {

                  if (
                    currentImage >
                    0
                  ) {

                    setCurrentImage(
                      currentImage -
                        1
                    );
                  }
                }}
              >
                ‹
              </button>

              <button

                style={{
                  ...styles.sliderBtn,
                  right: 10,
                }}

                onClick={() => {

                  if (
                    currentImage <
                    viewComplaint
                      .images
                      .length -
                      1
                  ) {

                    setCurrentImage(
                      currentImage +
                        1
                    );
                  }
                }}
              >
                ›
              </button>

            </div>

            {/* DETAILS */}

            <div
              style={
                styles.detailsGrid
              }
            >

              <div>

                <strong>
                  Complaint ID
                </strong>

                <p>
                  {
                    viewComplaint.id
                  }
                </p>

              </div>

              <div>

                <strong>
                  Citizen Name
                </strong>

                <p>
                  {
                    viewComplaint.citizen
                  }
                </p>

              </div>

              <div>

                <strong>
                  Phone Number
                </strong>

                <p>
                  {
                    viewComplaint.phone
                  }
                </p>

              </div>

              <div>

                <strong>
                  Priority
                </strong>

                <p>
                  {
                    viewComplaint.priority
                  }
                </p>

              </div>

              <div>

                <strong>
                  Status
                </strong>

                <p>
                  {
                    viewComplaint.status
                  }
                </p>

              </div>

              <div>

                <strong>
                  SLA Time
                </strong>

                <p>
                  {getRemainingTime(
                    viewComplaint.createdAt,
                    viewComplaint.slaHours
                  )}
                </p>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div
              style={
                styles.descriptionBox
              }
            >

              <strong>
                Complaint Description
              </strong>

              <p
                style={{
                  marginTop: 10,
                }}
              >
                {
                  viewComplaint.description
                }
              </p>

            </div>

            {/* GEO TAG */}

            <div
              style={
                styles.geoTagBox
              }
            >

              <h3
                style={
                  styles.geoTitle
                }
              >
                Geo Tag Location
              </h3>

              <p>
                📍
                {" "}
                {
                  viewComplaint
                    .geoTag
                    .address
                }
              </p>

              <p>
                Latitude:
                {" "}
                {
                  viewComplaint
                    .geoTag
                    .latitude
                }
              </p>

              <p>
                Longitude:
                {" "}
                {
                  viewComplaint
                    .geoTag
                    .longitude
                }
              </p>

            </div>

            {/* REJECT */}

            {viewComplaint.rejectReason &&
              (

                <div
                  style={
                    styles.rejectBox
                  }
                >

                  <strong>
                    Reject Reason
                  </strong>

                  <p>
                    {
                      viewComplaint.rejectReason
                    }
                  </p>

                </div>
              )}

          </div>

        </div>
      )}

      {/* REJECT MODAL */}

      {rejectModal && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <h2
              style={
                styles.modalTitle
              }
            >
              Reject Complaint
            </h2>

            <textarea

              placeholder="Enter reject reason..."

              style={
                styles.textarea
              }

              value={rejectReason}

              onChange={(e) =>
                setRejectReason(
                  e.target.value
                )
              }
            />

            <div
              style={
                styles.modalButtons
              }
            >

              <button

                style={
                  styles.cancelButton
                }

                onClick={() => {

                  setRejectModal(
                    false
                  );

                  setRejectReason(
                    ""
                  );
                }}
              >
                Cancel
              </button>

              <button

                style={
                  styles.saveButton
                }

                onClick={
                  saveRejectReason
                }
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

const styles = {

  container: {

    padding: 10,
  },

  header: {

    marginBottom: 25,
  },

  title: {

    margin: 0,

    fontSize: 30,

    fontWeight: 700,

    color: "#0f172a",
  },

  subtitle: {

    marginTop: 8,

    color: "#64748b",
  },

  tableWrapper: {

    overflowX: "auto",

    background: "#fff",

    borderRadius: 20,

    padding: 20,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.05)",
  },

  table: {

    width: "100%",

    borderCollapse:
      "collapse",
  },

  th: {

    background:
      "#f1f5f9",

    padding: "16px",

    textAlign: "left",

    color: "#475569",
  },

  tr: {

    borderBottom:
      "1px solid #e2e8f0",
  },

  td: {

    padding:
      "18px 16px",
  },

  statusBadge: {

    padding:
      "8px 14px",

    borderRadius: 30,

    fontSize: 13,

    fontWeight: 700,
  },

  priorityBadge: {

    padding:
      "8px 14px",

    borderRadius: 30,

    fontSize: 13,

    fontWeight: 700,
  },

  slaTimer: {

    fontWeight: 700,

    color: "#dc2626",
  },

  actionWrapper: {

    display: "flex",

    gap: 10,

    alignItems:
      "center",
  },

  dropdown: {

    padding:
      "10px 14px",

    borderRadius: 10,

    border:
      "1px solid #cbd5e1",

    minWidth: 150,
  },

  updateButton: {

    background:
      "#2563eb",

    color: "#fff",

    border: "none",

    padding:
      "10px 18px",

    borderRadius: 10,

    cursor: "pointer",

    fontWeight: 600,
  },

  viewButton: {

    background:
      "#0f172a",

    color: "#fff",

    border: "none",

    padding:
      "10px 18px",

    borderRadius: 10,

    cursor: "pointer",

    fontWeight: 600,
  },

  modalOverlay: {

    position: "fixed",

    top: 0,

    left: 0,

    width: "100%",

    height: "100%",

    background:
      "rgba(0,0,0,0.45)",

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    zIndex: 999,
  },

  modal: {

    width: 420,

    background: "#fff",

    borderRadius: 20,

    padding: 30,
  },

  viewModal: {

    width: 750,

    maxHeight: "90vh",

    overflowY: "auto",

    background: "#fff",

    borderRadius: 24,

    padding: 30,
  },

  modalTop: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 20,
  },

  modalTitle: {

    marginTop: 0,
  },

  closeIcon: {

    border: "none",

    background:
      "#fee2e2",

    width: 40,

    height: 40,

    borderRadius: "50%",

    cursor: "pointer",

    fontSize: 18,

    fontWeight: 700,

    color: "#dc2626",
  },

  sliderContainer: {

    position: "relative",

    width: "100%",

    height: 320,

    marginBottom: 25,
  },

  sliderImage: {

    width: "100%",

    height: "100%",

    objectFit: "cover",

    borderRadius: 20,
  },

  sliderBtn: {

    position: "absolute",

    top: "50%",

    transform:
      "translateY(-50%)",

    width: 45,

    height: 45,

    borderRadius: "50%",

    border: "none",

    background:
      "rgba(15,23,42,0.8)",

    color: "#fff",

    fontSize: 28,

    cursor: "pointer",
  },

  detailsGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(2,1fr)",

    gap: 20,
  },

  descriptionBox: {

    marginTop: 25,

    background:
      "#f8fafc",

    padding: 20,

    borderRadius: 16,
  },

  geoTagBox: {

    marginTop: 20,

    background:
      "#eff6ff",

    padding: 20,

    borderRadius: 18,

    border:
      "1px solid #bfdbfe",
  },

  geoTitle: {

    marginTop: 0,

    color: "#1d4ed8",
  },

  rejectBox: {

    marginTop: 20,

    background:
      "#fee2e2",

    padding: 18,

    borderRadius: 16,

    color: "#dc2626",
  },

  textarea: {

    width: "100%",

    height: 120,

    borderRadius: 14,

    border:
      "1px solid #cbd5e1",

    padding: 14,

    resize: "none",

    boxSizing:
      "border-box",
  },

  modalButtons: {

    display: "flex",

    justifyContent:
      "flex-end",

    gap: 12,

    marginTop: 20,
  },

  cancelButton: {

    background:
      "#e2e8f0",

    border: "none",

    padding:
      "12px 18px",

    borderRadius: 10,

    cursor: "pointer",
  },

  saveButton: {

    background:
      "#dc2626",

    color: "#fff",

    border: "none",

    padding:
      "12px 18px",

    borderRadius: 10,

    cursor: "pointer",
  },
};

export default ComplaintsPage;