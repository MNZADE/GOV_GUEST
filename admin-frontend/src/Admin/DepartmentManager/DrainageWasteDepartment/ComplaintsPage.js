import React, {
  useState,
  useEffect,
} from "react";

import axios from "axios";

const ComplaintsPage = ({

  departmentName =
    "Drainage, Sewage & Garbage Collection Department",

}) => {

  /* =====================================
     PRIORITY CONFIG
  ===================================== */

  const PRIORITY_CONFIG = {

    Normal: {

      color: "#22c55e",

      bg: "#dcfce7",

      icon: "🟢",

      sla: 48,
    },

    High: {

      color: "#f97316",

      bg: "#ffedd5",

      icon: "🟠",

      sla: 24,
    },

    Urgent: {

      color: "#ef4444",

      bg: "#fee2e2",

      icon: "🔴",

      sla: 12,
    },

    Escalated: {

      color: "#991b1b",

      bg: "#fecaca",

      icon: "🚨",

      sla: 6,
    },
  };

  /* =====================================
     STATES
  ===================================== */

  const [complaints,
    setComplaints] =
    useState([]);

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [timeNow,
    setTimeNow] =
    useState(new Date());

  const [searchId,
    setSearchId] =
    useState("");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("All");

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    rejectComplaintId,
    setRejectComplaintId,
  ] = useState(null);

  /* =====================================
     PRIORITY DETECTION
  ===================================== */

  const detectPriority = (
    issue,
    description
  ) => {

    const text =
      `${issue} ${description}`
        .toLowerCase();

    if (

      text.includes(
        "drainage overflow"
      ) ||

      text.includes(
        "sewage leakage"
      ) ||

      text.includes(
        "garbage fire"
      ) ||

      text.includes(
        "blocked drainage"
      ) ||

      text.includes(
        "flood"
      )

    ) {

      return "Urgent";
    }

    if (

      text.includes(
        "garbage collection"
      ) ||

      text.includes(
        "waste"
      ) ||

      text.includes(
        "drainage repair"
      ) ||

      text.includes(
        "dirty area"
      ) ||

      text.includes(
        "sewage"
      )

    ) {

      return "High";
    }

    return "Normal";
  };

  /* =====================================
     FETCH COMPLAINTS
  ===================================== */

  useEffect(() => {

    fetchComplaints();

  }, []);

  const fetchComplaints =
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

          const updatedData =
            response.data.complaints.map(
              (c) => {

                const priority =
                  detectPriority(
                    c.issue,
                    c.description
                  );

                return {

                  ...c,

                  priority,
                };
              }
            );

          setComplaints(
            updatedData
          );
        }

      } catch (err) {

        console.error(
          "Fetch Error:",
          err
        );
      }
    };

  /* =====================================
     LIVE CLOCK
  ===================================== */

  useEffect(() => {

    const interval =
      setInterval(() => {

        setTimeNow(
          new Date()
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, []);

  /* =====================================
     SLA TIMER
  ===================================== */

  const getRemainingTime =
    (complaint) => {

      const slaHours =
        PRIORITY_CONFIG[
          complaint.priority
        ]?.sla || 24;

      const created =
        new Date(
          complaint.createdAt
        );

      const deadline =
        new Date(

          created.getTime() +

          slaHours *
            60 *
            60 *
            1000
        );

      const diff =
        deadline - timeNow;

      if (diff <= 0)
        return "Overdue";

      const h =
        Math.floor(

          diff /

          (
            1000 *
            60 *
            60
          )
        );

      const m =
        Math.floor(

          (
            diff /
            (
              1000 * 60
            )
          ) % 60
        );

      const s =
        Math.floor(

          (
            diff / 1000
          ) % 60
        );

      return `${h}h ${m}m ${s}s`;
    };

  /* =====================================
     UPDATE STATUS
  ===================================== */

  const updateStatus =
    async (
      complaint,
      newStatus
    ) => {

      if (
        newStatus ===
        "Rejected"
      ) {

        setRejectComplaintId(
          complaint._id
        );

        return;
      }

      setComplaints(
        (prev) =>

          prev.map((c) =>

            c._id ===
            complaint._id

              ? {

                  ...c,

                  status:
                    newStatus,
                }

              : c
          )
      );
    };

  /* =====================================
     REJECT SUBMIT
  ===================================== */

  const submitRejectedComplaint =
    async () => {

      if (
        rejectionReason.trim() ===
        ""
      ) {

        alert(
          "Please enter rejection reason"
        );

        return;
      }

      setComplaints(
        (prev) =>

          prev.map((c) =>

            c._id ===
            rejectComplaintId

              ? {

                  ...c,

                  status:
                    "Rejected",

                  rejectionReason,
                }

              : c
          )
      );

      setRejectComplaintId(
        null
      );

      setRejectionReason("");
    };

  /* =====================================
     UPDATE PRIORITY
  ===================================== */

  const updatePriority =
    (
      id,
      newPriority
    ) => {

      setComplaints(
        (prev) =>

          prev.map((c) =>

            c._id === id

              ? {

                  ...c,

                  priority:
                    newPriority,
                }

              : c
          )
      );
    };

  /* =====================================
     FILTER
  ===================================== */

  const filteredComplaints =
    complaints.filter((c) => {

      const matchesSearch =

        (
          c.complaintId || ""
        )

          .toLowerCase()

          .includes(
            searchId.toLowerCase()
          );

      const matchesPriority =

        priorityFilter ===
        "All"

          ? true

          : c.priority ===
            priorityFilter;

      return (
        matchesSearch &&
        matchesPriority
      );
    });

  /* =====================================
     UPDATE COMPLAINT
  ===================================== */

  const updateComplaint =
    async (c) => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        await axios.put(

          `http://localhost:5000/api/complaints/manager/update/${c.complaintId}`,

          {

            status:
              c.status,

            priority:
              c.priority,

            rejectionReason:

              c.rejectionReason ||

              "",

            adminMessage:

              c.adminMessage ||

              "",
          },

          {

            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        alert(
          "Complaint Updated Successfully"
        );

        fetchComplaints();

      } catch (err) {

        console.error(err);

        alert(
          "Update Failed"
        );
      }
    };

  return (

    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h2 style={styles.title}>

            {departmentName}

          </h2>

          <p style={styles.subTitle}>

            Drainage & Waste Monitoring Governance System

          </p>

        </div>

        <div style={styles.filterContainer}>

          <input

            type="text"

            placeholder="🔍 Search Complaint ID..."

            value={searchId}

            onChange={(e) =>
              setSearchId(
                e.target.value
              )
            }

            style={styles.search}
          />

          <select

            value={priorityFilter}

            onChange={(e) =>

              setPriorityFilter(
                e.target.value
              )
            }

            style={styles.filterSelect}
          >

            <option value="All">
              All Priorities
            </option>

            <option value="Normal">
              🟢 Normal
            </option>

            <option value="High">
              🟠 High
            </option>

            <option value="Urgent">
              🔴 Urgent
            </option>

            <option value="Escalated">
              🚨 Escalated
            </option>

          </select>

        </div>

      </div>

      {/* TABLE */}

      <div style={styles.card}>

        <table style={styles.table}>

          <thead style={styles.tableHead}>

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
                Change Priority
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                SLA Timer
              </th>

              <th style={styles.th}>
                Date & Time
              </th>

              <th style={styles.th}>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map(
              (c) => {

                const remaining =
                  getRemainingTime(c);

                return (

                  <tr
                    key={c._id}
                    style={styles.row}
                  >

                    <td style={styles.td}>
                      {c.complaintId}
                    </td>

                    <td style={styles.tdIssue}>
                      {c.issue}
                    </td>

                    {/* PRIORITY */}

                    <td style={styles.td}>

                      <div

                        style={{

                          ...styles.priorityCard,

                          background:

                            PRIORITY_CONFIG[
                              c.priority
                            ]?.bg,
                        }}
                      >

                        <span style={styles.priorityIcon}>

                          {

                            PRIORITY_CONFIG[
                              c.priority
                            ]?.icon

                          }

                        </span>

                        <div>

                          <div

                            style={{

                              color:

                                PRIORITY_CONFIG[
                                  c.priority
                                ]?.color,

                              fontWeight: 700,
                            }}
                          >

                            {c.priority}

                          </div>

                          <div style={styles.slaText}>

                            SLA:

                            {

                              PRIORITY_CONFIG[
                                c.priority
                              ]?.sla

                            }h

                          </div>

                        </div>

                      </div>

                    </td>

                    {/* CHANGE PRIORITY */}

                    <td style={styles.td}>

                      <select

                        value={c.priority}

                        onChange={(e) =>

                          updatePriority(

                            c._id,

                            e.target.value
                          )
                        }

                        style={styles.prioritySelect}
                      >

                        <option value="Normal">
                          🟢 Normal
                        </option>

                        <option value="High">
                          🟠 High
                        </option>

                        <option value="Urgent">
                          🔴 Urgent
                        </option>

                        <option value="Escalated">
                          🚨 Escalated
                        </option>

                      </select>

                    </td>

                    {/* STATUS */}

                    <td style={styles.td}>

                      <select

                        value={c.status}

                        onChange={(e) =>

                          updateStatus(
                            c,
                            e.target.value
                          )
                        }

                        style={styles.select}
                      >

                        <option value="Pending">
                          Pending
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>

                        <option value="Escalated">
                          Escalated
                        </option>

                        <option value="Rejected">
                          Rejected
                        </option>

                      </select>

                    </td>

                    {/* SLA */}

                    <td

                      style={{

                        ...styles.td,

                        color:

                          remaining ===
                          "Overdue"

                            ? "#ef4444"

                            : "#0f172a",

                        fontWeight: 700,
                      }}
                    >

                      {remaining}

                    </td>

                    {/* DATE */}

                    <td style={styles.tdDate}>

                      {new Date(
                        c.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </td>

                    {/* ACTIONS */}

                    <td style={styles.td}>

                      <div
                        style={
                          styles.actionButtons
                        }
                      >

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

                        <button

                          style={
                            styles.updateBtn
                          }

                          onClick={() =>
                            updateComplaint(
                              c
                            )
                          }
                        >

                          Update

                        </button>

                      </div>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

      {/* DETAILS MODAL */}
      {/* DETAILS MODAL */}

      {selectedComplaint && (

        <div style={styles.modalOverlay}>

          <div style={styles.detailModal}>

            {/* HEADER */}

            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  Complaint Details
                </h2>

                <p style={styles.modalSubTitle}>
                  Smart Governance Monitoring System
                </p>

              </div>

              <button

                style={
                  styles.closeIconBtn
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

            {/* IMAGE SECTION */}

            <div style={styles.imageSection}>

              {selectedComplaint.images &&
              selectedComplaint.images.length > 0 ? (

                <div style={styles.imageSlider}>

                  {selectedComplaint.images.map(
                    (
                      img,
                      index
                    ) => (

                      <div
                        key={index}
                        style={
                          styles.imageCard
                        }
                      >

                        <img

                          src={img}

                          alt="Complaint"

                          style={
                            styles.sliderImage
                          }
                        />

                      </div>
                    )
                  )}

                </div>

              ) : selectedComplaint.image ? (

                <div
                  style={
                    styles.singleImageWrapper
                  }
                >

                  <img

                    src={
                      selectedComplaint.image
                    }

                    alt="Complaint"

                    style={
                      styles.singleImage
                    }
                  />

                </div>

              ) : (

                <div
                  style={
                    styles.noImageBox
                  }
                >

                  No Complaint Image Uploaded

                </div>
              )}

            </div>

            {/* DETAILS */}

            <div style={styles.detailGrid}>

              {/* COMPLAINT ID */}

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

              {/* MOBILE */}

              <div style={styles.detailCard}>

                <span style={styles.label}>
                  Phone Number
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.mobile ||
                    "N/A"
                  }
                </p>

              </div>

              {/* STATUS */}

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

              {/* PRIORITY */}

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

              {/* ISSUE */}

              <div style={styles.fullWidthCard}>

                <span style={styles.label}>
                  Issue
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.issue
                  }
                </p>

              </div>

              {/* DESCRIPTION */}

              <div style={styles.fullWidthCard}>

                <span style={styles.label}>
                  Description
                </span>

                <p style={styles.descriptionText}>
                  {
                    selectedComplaint.description
                  }
                </p>

              </div>

              {/* ADDRESS */}

              <div style={styles.fullWidthCard}>

                <span style={styles.label}>
                  Address
                </span>

                <p style={styles.value}>
                  {
                    selectedComplaint.address ||
                    "N/A"
                  }
                </p>

              </div>

              {/* REJECTION REASON */}

              {selectedComplaint.rejectionReason && (

                <div
                  style={
                    styles.rejectReasonCard
                  }
                >

                  <span style={styles.label}>
                    Rejection Reason
                  </span>

                  <p style={styles.rejectText}>
                    {
                      selectedComplaint.rejectionReason
                    }
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* REJECT MODAL */}

      {rejectComplaintId && (

        <div style={styles.modalOverlay}>

          <div style={styles.rejectModal}>

            <h2 style={styles.modalTitle}>
              Reject Complaint
            </h2>

            <textarea

              placeholder="Enter rejection reason..."

              value={rejectionReason}

              onChange={(e) =>
                setRejectionReason(
                  e.target.value
                )
              }

              style={
                styles.rejectTextarea
              }
            />

            <div style={styles.rejectActions}>

              <button

                style={styles.cancelBtn}

                onClick={() => {

                  setRejectComplaintId(
                    null
                  );

                  setRejectionReason(
                    ""
                  );
                }}
              >

                Cancel

              </button>
<button

  style={styles.rejectBtn}

  onClick={
    submitRejectedComplaint
  }
>

  Submit Reject

</button>

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

    padding: 24,

    background:
      "linear-gradient(135deg,#ecfeff,#eef2ff,#f8fafc)",

    minHeight: "100vh",

    fontFamily:
      "Segoe UI,sans-serif",
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 24,

    flexWrap: "wrap",

    gap: 16,
  },

  title: {

    margin: 0,

    fontSize: 24,

    fontWeight: 800,

    color: "#0f172a",
  },

  subTitle: {

    marginTop: 6,

    color: "#64748b",

    fontSize: 13,
  },

  filterContainer: {

    display: "flex",

    gap: 10,

    alignItems: "center",

    flexWrap: "wrap",
  },

  search: {

    width: 220,

    padding: "12px 14px",

    borderRadius: 12,

    border:
      "1px solid rgba(59,130,246,0.2)",

    outline: "none",

    fontSize: 13,

    background:
      "rgba(255,255,255,0.95)",
  },

  filterSelect: {

    padding: "12px 14px",

    borderRadius: 12,

    border:
      "1px solid #cbd5e1",

    outline: "none",

    fontWeight: 600,

    cursor: "pointer",

    background: "#fff",

    fontSize: 13,
  },

  card: {

    background:
      "#ffffff",

    borderRadius: 20,

    padding: 18,

    overflowX: "auto",

    boxShadow:
      "0 6px 20px rgba(0,0,0,0.08)",
  },

  table: {

    width: "100%",

    borderCollapse: "collapse",
  },

  tableHead: {

    background:
      "linear-gradient(90deg,#0f172a,#1d4ed8,#2563eb)",
  },

  th: {

    padding: "14px 10px",

    color: "#fff",

    fontWeight: 700,

    fontSize: 13,

    textAlign: "center",
  },

  td: {

    padding: "14px 10px",

    textAlign: "center",

    borderBottom:
      "1px solid #e2e8f0",

    fontSize: 13,
  },

  tdIssue: {

    padding: "14px 10px",

    textAlign: "left",

    borderBottom:
      "1px solid #e2e8f0",

    fontWeight: 600,
  },

  tdDate: {

    padding: "14px 10px",

    borderBottom:
      "1px solid #e2e8f0",

    fontSize: 12,
  },

  row: {

    transition: "0.3s",
  },

  priorityCard: {

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    gap: 8,

    padding: "8px 10px",

    borderRadius: 12,
  },

  priorityIcon: {

    fontSize: 18,
  },

  slaText: {

    fontSize: 10,

    color: "#64748b",

    marginTop: 3,
  },

  prioritySelect: {

    padding: "8px 10px",

    borderRadius: 10,

    border:
      "1px solid #cbd5e1",

    outline: "none",

    width: "100%",

    cursor: "pointer",
  },

  select: {

    padding: "8px 10px",

    borderRadius: 10,

    border:
      "1px solid #cbd5e1",

    outline: "none",

    width: "100%",

    cursor: "pointer",
  },

  actionButtons: {

    display: "flex",

    justifyContent:
      "center",

    gap: 8,

    flexWrap: "wrap",
  },

  viewBtn: {

    background:
      "#0f172a",

    color: "#fff",

    border: "none",

    padding: "8px 14px",

    borderRadius: 8,

    cursor: "pointer",

    fontWeight: 600,
  },

  updateBtn: {

    background:
      "#2563eb",

    color: "#fff",

    border: "none",

    padding: "8px 14px",

    borderRadius: 8,

    cursor: "pointer",

    fontWeight: 600,
  },

  modalOverlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(15,23,42,0.65)",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    zIndex: 999,

    padding: 20,
  },

  detailModal: {

    background: "#fff",

    width: "950px",

    maxWidth: "100%",

    borderRadius: 28,

    padding: 30,

    maxHeight: "92vh",

    overflowY: "auto",

    boxShadow:
      "0 20px 40px rgba(0,0,0,0.25)",
  },

  modalHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 25,
  },

  modalTitle: {

    margin: 0,

    fontSize: 28,

    fontWeight: 800,

    color: "#0f172a",
  },

  modalSubTitle: {

    marginTop: 6,

    color: "#64748b",

    fontSize: 13,
  },

  closeIconBtn: {

    border: "none",

    background: "#ef4444",

    color: "#fff",

    width: 40,

    height: 40,

    borderRadius: "50%",

    cursor: "pointer",

    fontSize: 18,

    fontWeight: 700,
  },

  imageSection: {

    marginBottom: 28,
  },

  imageSlider: {

    display: "flex",

    gap: 18,

    overflowX: "auto",

    paddingBottom: 8,
  },

  imageCard: {

    minWidth: 280,

    borderRadius: 22,

    overflow: "hidden",

    border:
      "2px solid #e2e8f0",

    background: "#fff",

    boxShadow:
      "0 8px 20px rgba(0,0,0,0.08)",
  },

  sliderImage: {

    width: "100%",

    height: 220,

    objectFit: "cover",

    display: "block",
  },

  singleImageWrapper: {

    borderRadius: 22,

    overflow: "hidden",

    border:
      "2px solid #e2e8f0",

    boxShadow:
      "0 8px 20px rgba(0,0,0,0.08)",
  },

  singleImage: {

    width: "100%",

    height: 350,

    objectFit: "cover",

    display: "block",
  },

  noImageBox: {

    height: 240,

    borderRadius: 22,

    background:
      "linear-gradient(135deg,#f8fafc,#e2e8f0)",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    fontWeight: 700,

    color: "#64748b",

    fontSize: 18,
  },

  detailGrid: {

    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: 20,
  },

  detailCard: {

    background:
      "#f8fafc",

    padding: 20,

    borderRadius: 18,

    border:
      "1px solid #e2e8f0",
  },

  fullWidthCard: {

    gridColumn:
      "1 / span 2",

    background:
      "#f8fafc",

    padding: 20,

    borderRadius: 18,

    border:
      "1px solid #e2e8f0",
  },

  label: {

    fontSize: 12,

    color: "#64748b",

    fontWeight: 700,

    textTransform:
      "uppercase",

    letterSpacing: 0.5,
  },

  value: {

    marginTop: 10,

    fontSize: 15,

    color: "#0f172a",

    fontWeight: 600,

    lineHeight: 1.7,
  },

  descriptionText: {

    marginTop: 10,

    fontSize: 15,

    lineHeight: 1.9,

    color: "#334155",

    fontWeight: 500,
  },

  rejectReasonCard: {

    gridColumn:
      "1 / span 2",

    background:
      "#fef2f2",

    padding: 20,

    borderRadius: 18,

    border:
      "1px solid #fecaca",
  },

  rejectText: {

    color: "#b91c1c",

    fontWeight: 600,

    marginTop: 10,

    lineHeight: 1.7,
  },

  rejectModal: {

    background: "#fff",

    width: 450,

    borderRadius: 24,

    padding: 28,

    boxShadow:
      "0 15px 35px rgba(0,0,0,0.2)",
  },

  rejectTextarea: {

    width: "80%",

    height: 120,

    padding: 16,

    borderRadius: 14,

    border:
      "1px solid #cbd5e1",

    resize: "none",

    outline: "none",

    marginTop: 18,

    fontSize: 14,
  },

  rejectActions: {

    display: "flex",

    justifyContent:
      "flex-end",

    gap: 12,

    marginTop: 20,
  },

  cancelBtn: {

    padding: "10px 18px",

    border: "none",

    background: "#e2e8f0",

    borderRadius: 10,

    cursor: "pointer",

    fontWeight: 600,
  },

  rejectBtn: {

    padding: "10px 18px",

    border: "none",

    background: "#dc2626",

    color: "#fff",

    borderRadius: 10,

    cursor: "pointer",

    fontWeight: 600,
  },
};
export default ComplaintsPage;