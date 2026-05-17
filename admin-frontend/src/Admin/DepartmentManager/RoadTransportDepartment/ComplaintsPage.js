import React, { useState, useEffect } from "react";
import axios from "axios";

const ComplaintsPage = ({
  departmentName = "Road Department",
}) => {

  /* =====================================
     SLA RULES
  ===================================== */

  const SLA_RULES = {
    Normal: 48,
    High: 24,
    Urgent: 12,
    Escalated: 6,
  };

  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [timeNow, setTimeNow] = useState(new Date());
  const [searchId, setSearchId] = useState("");

  /* =====================================
     FETCH COMPLAINTS
  ===================================== */

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("kmc_token");

      const apiUrl =
        "http://localhost:5000/api/complaints/manager/roads";

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {

        const updatedData = response.data.complaints.map((c) => {

          let priority = "Normal";

          const issueText =
            `${c.issue} ${c.description}`.toLowerCase();

          const createdHours =
            (Date.now() - new Date(c.createdAt)) /
            (1000 * 60 * 60);

          /* =====================================
             PRIORITY
          ===================================== */

          if (
            issueText.includes("accident") ||
            issueText.includes("bridge damage") ||
            issueText.includes("road collapse") ||
            issueText.includes("large pothole")
          ) {

            priority = "Urgent";

          } else if (
            issueText.includes("traffic") ||
            issueText.includes("repair") ||
            issueText.includes("blocked road")
          ) {

            priority = "High";

          } else {

            priority = "Normal";
          }

          /* =====================================
             ESCALATION
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

        setComplaints(updatedData);
      }

    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  /* =====================================
     LIVE CLOCK
  ===================================== */

  useEffect(() => {

    const interval = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);

    return () => clearInterval(interval);

  }, []);

  /* =====================================
     AUTO ESCALATION
  ===================================== */

  useEffect(() => {

    setComplaints((prev) =>
      prev.map((c) => {

        const remaining =
          getRemainingMilliseconds(c);

        if (
          remaining <= 0 &&
          c.status !== "Resolved"
        ) {

          return {
            ...c,
            status: "Escalated",
            priority: "Escalated",
          };
        }

        return c;
      })
    );

  }, [timeNow]);

  /* =====================================
     SLA
  ===================================== */

  const getRemainingMilliseconds = (complaint) => {

    const hours =
      SLA_RULES[complaint.priority] || 24;

    const created = new Date(complaint.createdAt);

    const deadline = new Date(
      created.getTime() +
      hours * 60 * 60 * 1000
    );

    return deadline - timeNow;
  };

  const getRemainingTime = (complaint) => {

    const diff =
      getRemainingMilliseconds(complaint);

    if (diff <= 0)
      return "Overdue";

    const h = Math.floor(
      diff / (1000 * 60 * 60)
    );

    const m = Math.floor(
      (diff / (1000 * 60)) % 60
    );

    const s = Math.floor(
      (diff / 1000) % 60
    );

    return `${h}h ${m}m ${s}s`;
  };

  /* =====================================
     UPDATE STATUS
  ===================================== */

  const updateStatus = async (
    id,
    newStatus
  ) => {

    let rejectionReason = "";

    if (newStatus === "Rejected") {

      rejectionReason = prompt(
        "Enter rejection reason for citizen:"
      );

      if (
        !rejectionReason ||
        rejectionReason.trim() === ""
      ) {

        alert("Rejection reason required");
        return;
      }
    }

    setComplaints((prev) =>
      prev.map((c) =>
        c._id === id
          ? {
              ...c,
              status: newStatus,
              rejectionReason,
            }
          : c
      )
    );
  };

  /* =====================================
     UPDATE COMPLAINT
  ===================================== */

  const updateComplaint = async (complaint) => {

    try {

      const token =
        localStorage.getItem("kmc_token");

      const response = await axios.put(
        `http://localhost:5000/api/complaints/manager/update/${complaint.complaintId}`,

        {
          status: complaint.status,
          priority: complaint.priority,
          rejectionReason:
            complaint.rejectionReason || "",
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("Complaint Updated Successfully");
      }

    } catch (err) {

      console.error(err);
      alert("Update Failed");
    }
  };

  /* =====================================
     DELETE COMPLAINT
  ===================================== */

  const deleteComplaint = async (
    complaintId,
    aadhaar
  ) => {

    try {

      await axios.delete(
        `http://localhost:5000/api/complaints/user/${aadhaar}/${complaintId}`
      );

      setComplaints((prev) =>
        prev.filter(
          (c) => c.complaintId !== complaintId
        )
      );

      setSelectedComplaint(null);

      alert("Complaint Deleted");

    } catch (err) {

      console.error(err);
      alert("Delete Failed");
    }
  };

  /* =====================================
     PRIORITY COLORS
  ===================================== */

  const getPriorityColor = (priority) => {

    if (priority === "Normal")
      return "#22c55e";

    if (priority === "High")
      return "#f97316";

    if (priority === "Urgent")
      return "#ef4444";

    if (priority === "Escalated")
      return "#991b1b";

    return "#64748b";
  };

  /* =====================================
     FILTER SEARCH
  ===================================== */

  const filteredComplaints =
    complaints.filter((c) =>
      (c.complaintId || "")
        .toLowerCase()
        .includes(searchId.toLowerCase())
    );

  /* =====================================
     UI
  ===================================== */

  return (

    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h2 style={styles.title}>
            {departmentName} – Complaint Control Room
          </h2>

          <p style={styles.subTitle}>
            Road Monitoring & SLA Governance System
          </p>

        </div>

        <input
          type="text"
          placeholder="🔍 Search Complaint ID..."
          value={searchId}
          onChange={(e) =>
            setSearchId(e.target.value)
          }
          style={styles.search}
        />

      </div>

      {/* TABLE */}

      <div style={styles.card}>

        <table style={styles.table}>

          <thead style={styles.tableHead}>

            <tr>

              <th style={styles.th}>Complaint ID</th>
              <th style={styles.th}>Issue</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>SLA</th>
              <th style={styles.th}>Date & Time</th>
              <th style={styles.th}>Action</th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map((c) => {

              const remaining =
                getRemainingTime(c);

              const isOverdue =
                remaining === "Overdue";

              return (

                <tr
                  key={c._id}
                  style={{
                    ...styles.row,

                    background:
                      c.priority === "Urgent"
                        ? "#fff7ed"
                        : c.priority === "Escalated"
                        ? "#fef2f2"
                        : "#ffffff",
                  }}

                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "#f8fafc";
                  }}

                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      c.priority === "Urgent"
                        ? "#fff7ed"
                        : c.priority === "Escalated"
                        ? "#fef2f2"
                        : "#ffffff";
                  }}
                >

                  <td style={styles.td}>
                    {c.complaintId}
                  </td>

                  <td style={styles.tdIssue}>
                    {c.issue}
                  </td>

                  <td style={styles.td}>

                    <span
                      style={{
                        ...styles.priorityBadge,

                        background:
                          getPriorityColor(c.priority),
                      }}
                    >

                      {c.priority}

                    </span>

                  </td>

                  <td style={styles.td}>

                    <select
                      value={c.status}

                      onChange={(e) =>
                        updateStatus(
                          c._id,
                          e.target.value
                        )
                      }

                      style={{
                        ...styles.select,

                        background:
                          c.status === "Resolved"
                            ? "#dcfce7"
                            : c.status === "Rejected"
                            ? "#fee2e2"
                            : c.status === "Escalated"
                            ? "#fef2f2"
                            : c.status === "In Progress"
                            ? "#dbeafe"
                            : "#ffffff",

                        color:
                          c.status === "Rejected"
                            ? "#b91c1c"
                            : "#0f172a",

                        border:
                          c.status === "Resolved"
                            ? "1px solid #22c55e"
                            : c.status === "Rejected"
                            ? "1px solid #ef4444"
                            : c.status === "Escalated"
                            ? "1px solid #991b1b"
                            : c.status === "In Progress"
                            ? "1px solid #2563eb"
                            : "1px solid #cbd5e1",
                      }}
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

                  <td
                    style={{
                      ...styles.td,

                      color:
                        isOverdue
                          ? "#ef4444"
                          : "#0f172a",

                      fontWeight: 700,
                    }}
                  >

                    {remaining}

                  </td>

                  <td style={styles.tdDate}>

                    {new Date(
                      c.createdAt
                    ).toLocaleString("en-IN")}

                  </td>

                  <td style={styles.tdAction}>

                    <div style={styles.actionButtons}>

                      <button
                        style={styles.viewBtn}
                        onClick={() =>
                          setSelectedComplaint(c)
                        }
                      >

                        View

                      </button>

                      <button
                        style={styles.updateBtn}
                        onClick={() =>
                          updateComplaint(c)
                        }
                      >

                        Update

                      </button>

                    </div>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {selectedComplaint && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <h3>Complaint Details</h3>

              <button
                style={styles.closeBtn}
                onClick={() =>
                  setSelectedComplaint(null)
                }
              >

                ✕

              </button>

            </div>

            {/* IMAGE */}

            <div style={styles.imageSlider}>

              {selectedComplaint.images?.map(
                (img, index) => (

                  <img
                    key={index}
                    src={img}
                    alt="complaint"
                    style={styles.modalImage}
                  />
                )
              )}

            </div>

            {/* DETAILS */}

            <div style={styles.detailsGrid}>

              <Detail
                label="Complaint ID"
                value={selectedComplaint.complaintId}
              />

              <Detail
                label="Priority"
                value={selectedComplaint.priority}
              />

              <Detail
                label="Status"
                value={selectedComplaint.status}
              />

              <Detail
                label="Department"
                value={selectedComplaint.department}
              />

            </div>

            <p style={{ marginTop: 20 }}>
              <strong>Issue:</strong>{" "}
              {selectedComplaint.issue}
            </p>

            <p style={{ marginTop: 15 }}>
              <strong>Description:</strong>{" "}
              {selectedComplaint.description}
            </p>

            <p style={{ marginTop: 15 }}>
              <strong>Address:</strong>{" "}
              {selectedComplaint.address}
            </p>

            {selectedComplaint.status ===
              "Rejected" && (

              <div style={styles.rejectBox}>

                <strong>
                  Rejection Reason:
                </strong>

                <p>
                  {selectedComplaint.rejectionReason ||
                    "No reason provided"}
                </p>

              </div>
            )}

            <iframe
              title="map"
              width="100%"
              height="250"
              style={{
                border: 0,
                marginTop: 20,
                borderRadius: 14,
              }}
              loading="lazy"

              src={`https://www.google.com/maps?q=${
                selectedComplaint.lat ||
                selectedComplaint.latitude
              },${
                selectedComplaint.lon ||
                selectedComplaint.longitude
              }&z=15&output=embed`}
            />

            <div
              style={{
                marginTop: 20,
                textAlign: "right",
              }}
            >

              <button
                style={styles.deleteBtn}
                onClick={() =>
                  deleteComplaint(
                    selectedComplaint.complaintId,
                    selectedComplaint.aadhaar
                  )
                }
              >

                Delete Complaint

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* =====================================
DETAIL COMPONENT
===================================== */

const Detail = ({
  label,
  value,
}) => (

  <div>

    <strong>{label}</strong>

    <p style={{ margin: "4px 0" }}>
      {value}
    </p>

  </div>
);

/* =====================================
STYLES
===================================== */

const styles = {

  page: {
    padding: "40px",
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "Segoe UI,sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    gap: 20,
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: "#0f172a",
  },

  subTitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 6,
  },

  search: {
    width: "300px",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
    background: "#ffffff",
  },

  card: {
    background: "#ffffff",
    borderRadius: 20,
    padding: 25,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.05)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "1250px",
  },

  tableHead: {
    background: "#0f172a",
  },

  th: {
    padding: "16px 14px",
    textAlign: "center",
    fontWeight: "700",
    color: "#ffffff",
    fontSize: "14px",
    borderBottom: "2px solid #cbd5e1",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "16px 14px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    verticalAlign: "middle",
    fontSize: "14px",
    color: "#334155",
  },

  tdIssue: {
    padding: "16px 14px",
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    verticalAlign: "middle",
    fontWeight: 600,
    color: "#0f172a",
    minWidth: "250px",
    lineHeight: 1.5,
  },

  tdDate: {
    padding: "16px 14px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    minWidth: "180px",
    fontSize: "13px",
    color: "#475569",
  },

  tdAction: {
    padding: "16px 14px",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    minWidth: "220px",
  },

  row: {
    transition: "0.3s ease",
  },

  select: {
    width: "160px",
    padding: "10px 14px",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  actionButtons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    flexWrap: "nowrap",
  },

  viewBtn: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    minWidth: "80px",
  },

  updateBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    minWidth: "90px",
  },

  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },

  priorityBadge: {
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    display: "inline-block",
    minWidth: 90,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    background: "#fff",
    width: "950px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: 20,
    padding: 30,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 24,
    cursor: "pointer",
    fontWeight: 700,
  },

  imageSlider: {
    display: "flex",
    gap: 16,
    overflowX: "auto",
    marginTop: 20,
    paddingBottom: 10,
  },

  modalImage: {
    width: 280,
    height: 220,
    objectFit: "cover",
    borderRadius: 14,
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 20,
    marginTop: 20,
  },

  rejectBox: {
    background: "#fee2e2",
    padding: 18,
    borderRadius: 14,
    marginTop: 20,
    color: "#991b1b",
  },
};

export default ComplaintsPage;