import React, {
  useState,
  useEffect,
} from "react";

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";

const ComplaintsPage = () => {

  /* =====================================================
     STATES
  ===================================================== */

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

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

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState({});

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
     LOAD COMPLAINTS
  ===================================================== */

  useEffect(() => {

    const loadComplaints =
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

          console.log(data);

          if (data.success) {

            setComplaints(
              data.complaints
            );
          }

        } catch (err) {

          console.log(err);

        } finally {

          setLoading(false);
        }
      };

    loadComplaints();

  }, []);

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const handleStatusChange =
    async (
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

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await fetch(

`${BACKEND}/api/complaints/manager/update/${complaintId}`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                status:
                  newStatus,
              }),
            }
          );

        const data =
          await res.json();

        console.log(data);

        if (data.success) {

          const updated =
            complaints.map(
              (item) =>

                item.complaintId ===
                complaintId

                  ? {

                      ...item,

                      status:
                        newStatus,
                    }

                  : item
            );

          setComplaints(updated);

          alert(
            `Complaint updated to ${newStatus}`
          );
        }

      } catch (err) {

        console.log(err);

        alert(
          "Failed to update complaint"
        );
      }
    };

  /* =====================================================
     REJECT COMPLAINT
  ===================================================== */

  const saveRejectReason =
    async () => {

      if (
        rejectReason.trim() ===
        ""
      ) {

        alert(
          "Please enter reject reason"
        );

        return;
      }

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await fetch(

`${BACKEND}/api/complaints/manager/update/${selectedComplaint}`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                status:
                  "Rejected",

                rejectionReason:
                  rejectReason,
              }),
            }
          );

        const data =
          await res.json();

        if (data.success) {

          const updated =
            complaints.map(
              (item) =>

                item.complaintId ===
                selectedComplaint

                  ? {

                      ...item,

                      status:
                        "Rejected",

                      rejectionReason:
                        rejectReason,
                    }

                  : item
            );

          setComplaints(updated);

          setRejectModal(false);

          setRejectReason("");

          alert(
            "Complaint Rejected"
          );
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =====================================================
     SLA TIMER
  ===================================================== */

  const getRemainingTime = (
    createdAt,
    priority
  ) => {

    if (!createdAt) {

      return "N/A";
    }

    let slaHours = 48;

    if (
      priority ===
      "Urgent"
    ) {

      slaHours = 6;
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
     BADGE STYLES
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
          Loading Complaints...
        </h2>

      </div>
    );
  }

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <h1 style={styles.title}>
          Complaints Management
        </h1>

        <p style={styles.subtitle}>
          Live Complaint Monitoring Dashboard
        </p>

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
                key={c._id}
                style={styles.tr}
              >

                <td style={styles.td}>

                  <strong>
                    {
                      c.complaintId
                    }
                  </strong>

                </td>

                <td style={styles.td}>
                  {c.issue}
                </td>

                {/* PRIORITY */}

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

                {/* SLA */}

                <td style={styles.td}>

                  <span
                    style={{
                      ...styles.slaTimer,

                      color:
                        getRemainingTime(
                          c.createdAt,
                          c.priority
                        ) ===
                        "SLA Breached"

                          ? "#dc2626"

                          : "#16a34a",
                    }}
                  >

                    {getRemainingTime(
                      c.createdAt,
                      c.priority
                    )}

                  </span>

                </td>

                {/* STATUS */}

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

                {/* ACTION */}

                <td style={styles.td}>

                  <div
                    style={
                      styles.actionWrapper
                    }
                  >

                    <select

                      value={
                        selectedStatus[
                          c._id
                        ] || c.status
                      }

                      style={
                        styles.dropdown
                      }

                      onChange={(e) =>

                        setSelectedStatus({

                          ...selectedStatus,

                          [c._id]:
                            e.target
                              .value,
                        })
                      }
                    >

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Escalated">
                        Escalated
                      </option>

                      <option value="Resolved">
                        Resolved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                    </select>

                    {/* UPDATE */}

                    <button

                      style={
                        styles.updateButton
                      }

                      onClick={() =>

                        handleStatusChange(

                          c.complaintId,

                          selectedStatus[
                            c._id
                          ] || c.status
                        )
                      }
                    >
                      Update
                    </button>

                    {/* VIEW */}

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

              <h2>
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

            {/* IMAGE */}

            {viewComplaint.images
              ?.length > 0 && (

              <div
                style={
                  styles.sliderContainer
                }
              >

                <img

                  src={`${BACKEND}/uploads/${
                    viewComplaint
                      .images[
                      currentImage
                    ]
                  }`}

                  alt="complaint"

                  style={
                    styles.sliderImage
                  }
                />

              </div>
            )}

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
                    viewComplaint.complaintId
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
                    viewComplaint.priority
                  )}

                </p>

              </div>

              <div>

                <strong>
                  Reject Message
                </strong>

                <p>

                  {
                    viewComplaint.rejectionReason ||
                    "No reject message"
                  }

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
                    .address
                }
              </p>

            </div>

          </div>

        </div>
      )}

      {/* REJECT MODAL */}

      {rejectModal && (

        <div style={styles.modalOverlay}>

          <div style={styles.rejectModal}>

            <h2
              style={
                styles.rejectTitle
              }
            >
              Reject Complaint
            </h2>

            <p
              style={
                styles.rejectSubtitle
              }
            >
              Enter reason for rejection
            </p>

            <textarea

              placeholder="Type reject reason..."

              value={
                rejectReason
              }

              onChange={(e) =>
                setRejectReason(
                  e.target.value
                )
              }

              style={
                styles.textarea
              }
            />

            <div
              style={
                styles.rejectActions
              }
            >

              <button

                style={
                  styles.cancelBtn
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
                  styles.submitBtn
                }

                onClick={
                  saveRejectReason
                }
              >
                Submit
              </button>

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

  container: {

    padding: 20,
  },

  header: {

    marginBottom: 25,
  },

  title: {

    margin: 0,

    fontSize: 32,

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
      "#f8fafc",

    padding: 16,

    textAlign: "left",

    color: "#475569",

    fontWeight: 700,
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

    minWidth: 160,
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

    inset: 0,

    background:
      "rgba(0,0,0,0.45)",

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    zIndex: 999,
  },

  viewModal: {

    width: 800,

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

  rejectModal: {

    width: 500,

    background: "#fff",

    borderRadius: 24,

    padding: 30,
  },

  rejectTitle: {

    marginTop: 0,

    color: "#dc2626",
  },

  rejectSubtitle: {

    color: "#64748b",

    marginBottom: 20,
  },

  textarea: {

    width: "100%",

    minHeight: 140,

    borderRadius: 14,

    border:
      "1px solid #cbd5e1",

    padding: 16,

    resize: "none",

    outline: "none",

    fontSize: 15,
  },

  rejectActions: {

    display: "flex",

    justifyContent:
      "flex-end",

    gap: 14,

    marginTop: 22,
  },

  cancelBtn: {

    background:
      "#e2e8f0",

    color: "#0f172a",

    border: "none",

    padding:
      "12px 18px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
  },

  submitBtn: {

    background:
      "#dc2626",

    color: "#fff",

    border: "none",

    padding:
      "12px 18px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
  },
};

export default ComplaintsPage;