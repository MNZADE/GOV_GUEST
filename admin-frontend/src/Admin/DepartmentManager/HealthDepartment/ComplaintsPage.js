import React, {
  useState,
  useEffect,
} from "react";

import axios from "axios";

const ComplaintsPage = ({
  departmentName = "Health Department",
}) => {

  const SLA_RULES = {
    Normal: 48,
    Urgent: 12,
    Escalated: 6,
  };

  const [complaints, setComplaints] =
    useState([]);

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [timeNow, setTimeNow] =
    useState(new Date());

  const [searchId, setSearchId] =
    useState("");

  /* =====================================================
     FETCH HEALTH COMPLAINTS
  ===================================================== */

  useEffect(() => {

    const fetchComplaints =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "kmc_token"
            );

          const response =
            await axios.get(
              "http://localhost:5000/api/complaints/manager/health",
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

            const updated =
              response.data.complaints.map(
                (c) => {

                  let priority =
                    c.priority ||
                    "Normal";

                  const issueText =
                    `${c.issue} ${c.description}`
                      .toLowerCase();

                  const createdHours =
                    (Date.now() -
                      new Date(
                        c.createdAt
                      )) /
                    (1000 *
                      60 *
                      60);

                  /* =====================================
                     AUTO PRIORITY
                  ===================================== */

                  if (

                    issueText.includes(
                      "overflow"
                    ) ||

                    issueText.includes(
                      "hospital"
                    ) ||

                    issueText.includes(
                      "garbage"
                    ) ||

                    issueText.includes(
                      "mosquito"
                    ) ||

                    issueText.includes(
                      "dirty"
                    )

                  ) {

                    priority =
                      "Urgent";
                  }

                  if (
                    createdHours >
                      48 &&
                    c.status !==
                      "Resolved"
                  ) {

                    priority =
                      "Escalated";
                  }

                  return {
                    ...c,
                    priority,
                  };
                }
              );

            setComplaints(
              updated
            );
          }

        } catch (err) {

          console.error(
            "Fetch Error:",
            err
          );
        }
      };

    fetchComplaints();

  }, []);

  /* =====================================================
     LIVE TIMER
  ===================================================== */

  useEffect(() => {

    const interval =
      setInterval(() => {

        setTimeNow(
          new Date()
        );

      }, 1000);

    return () =>
      clearInterval(
        interval
      );

  }, []);

  /* =====================================================
     AUTO ESCALATION
  ===================================================== */

  useEffect(() => {

    setComplaints(
      (prev) =>

        prev.map((c) => {

          const remaining =
            getRemainingMilliseconds(
              c
            );

          if (

            remaining <= 0 &&

            c.status !==
              "Resolved" &&

            c.status !==
              "Escalated"

          ) {

            return {

              ...c,

              status:
                "Escalated",

              priority:
                "Escalated",
            };
          }

          return c;
        })
    );

  }, [timeNow]);

  /* =====================================================
     SLA TIMER
  ===================================================== */

  const getRemainingMilliseconds =
    (complaint) => {

      const hours =
        SLA_RULES[
          complaint.priority
        ] || 24;

      const created =
        new Date(
          complaint.createdAt
        );

      const deadline =
        new Date(
          created.getTime() +
            hours *
              60 *
              60 *
              1000
        );

      return (
        deadline - timeNow
      );
    };

  const getRemainingTime =
    (complaint) => {

      const diff =
        getRemainingMilliseconds(
          complaint
        );

      if (diff <= 0)
        return "Overdue";

      const h = Math.floor(
        diff /
          (1000 *
            60 *
            60)
      );

      const m = Math.floor(
        (diff /
          (1000 * 60)) %
          60
      );

      const s = Math.floor(
        (diff / 1000) %
          60
      );

      return `${h}h ${m}m ${s}s`;
    };

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const updateStatus = (
    id,
    newStatus
  ) => {

    setComplaints(
      (prev) =>

        prev.map((c) =>

          c._id === id

            ? {
                ...c,
                status:
                  newStatus,
              }

            : c
        )
    );
  };

  /* =====================================================
     UPDATE COMPLAINT
  ===================================================== */

  const updateComplaint =
    async (complaint) => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const adminMessage =
          prompt(
            "Enter update message"
          );

        if (
          !adminMessage
        ) {

          return alert(
            "Message required"
          );
        }

        const response =
          await axios.put(

            `http://localhost:5000/api/complaints/manager/update/${complaint._id}`,

            {
              status:
                complaint.status,

              priority:
                complaint.priority,

              adminMessage,
            },

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

          alert(
            "Complaint updated successfully"
          );
        }

      } catch (err) {

        console.error(err);

        alert(
          "Update failed"
        );
      }
    };

  /* =====================================================
     DELETE COMPLAINT
  ===================================================== */

  const deleteComplaint =
    async (
      complaintId,
      aadhaar
    ) => {

      try {

        await axios.delete(
          `http://localhost:5000/api/complaints/user/${aadhaar}/${complaintId}`
        );

        setComplaints(
          (prev) =>

            prev.filter(
              (c) =>

                c.complaintId !==
                complaintId
            )
        );

        setSelectedComplaint(
          null
        );

        alert(
          "Complaint deleted successfully"
        );

      } catch (err) {

        console.error(err);

        alert(
          "Delete failed"
        );
      }
    };

  /* =====================================================
     PRIORITY COLORS
  ===================================================== */

  const getPriorityColor =
    (priority) => {

      if (
        priority ===
        "Normal"
      )
        return "#16a34a";

      if (
        priority ===
        "Urgent"
      )
        return "#ea580c";

      if (
        priority ===
        "Escalated"
      )
        return "#dc2626";

      return "#64748b";
    };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredComplaints =
    complaints.filter(
      (c) =>

        (
          c.complaintId ||
          ""
        )
          .toLowerCase()
          .includes(
            searchId.toLowerCase()
          )
    );

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h2 style={styles.title}>
            {departmentName} –
            Complaint Dashboard
          </h2>

          <p style={styles.subTitle}>
            Real-time Health Complaint Monitoring System
          </p>

        </div>

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

      </div>

      {/* TABLE */}

      <div style={styles.card}>

        <table style={styles.table}>

          <thead style={styles.tableHead}>

            <tr>

              <th style={styles.thLeft}>
                Complaint ID
              </th>

              <th style={styles.thLeft}>
                Issue
              </th>

              <th style={styles.thCenter}>
                Priority
              </th>

              <th style={styles.thCenter}>
                Status
              </th>

              <th style={styles.thCenter}>
                SLA
              </th>

              <th style={styles.thCenter}>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map(
              (c) => {

                const remaining =
                  getRemainingTime(
                    c
                  );

                return (

                  <tr
                    key={c._id}
                    style={styles.row}
                  >

                    <td style={styles.tdLeft}>
                      {c.complaintId}
                    </td>

                    <td style={styles.tdLeft}>
                      {c.issue}
                    </td>

                    <td style={styles.tdCenter}>

                      <span
                        style={{
                          ...styles.priorityBadge,
                          background:
                            getPriorityColor(
                              c.priority
                            ),
                        }}
                      >
                        {c.priority}
                      </span>

                    </td>

                    <td style={styles.tdCenter}>

                      <select
                        value={c.status}
                        onChange={(e) =>
                          updateStatus(
                            c._id,
                            e.target.value
                          )
                        }
                        style={styles.select}
                      >

                        <option>
                          Pending
                        </option>

                        <option>
                          In Progress
                        </option>

                        <option>
                          Resolved
                        </option>

                        <option>
                          Escalated
                        </option>

                        <option>
                          Rejected
                        </option>

                      </select>

                    </td>

                    <td style={styles.tdCenter}>
                      {remaining}
                    </td>

                    <td style={styles.tdCenter}>

                      <button
                        style={styles.viewBtn}
                        onClick={() =>
                          setSelectedComplaint(
                            c
                          )
                        }
                      >
                        View
                      </button>

                      <button
                        style={styles.updateBtn}
                        onClick={() =>
                          updateComplaint(
                            c
                          )
                        }
                      >
                        Update
                      </button>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {selectedComplaint && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <h3>
                Complaint Details
              </h3>

              <button
                style={styles.closeBtn}
                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }
              >
                ✕
              </button>

            </div>

            <img
              src={
                selectedComplaint
                  .images?.[0]
              }
              alt="complaint"
              style={styles.modalImage}
            />

            <div style={styles.detailsGrid}>

              <Detail
                label="Complaint ID"
                value={
                  selectedComplaint.complaintId
                }
              />

              <Detail
                label="Issue"
                value={
                  selectedComplaint.issue
                }
              />

              <Detail
                label="Priority"
                value={
                  selectedComplaint.priority
                }
              />

              <Detail
                label="Status"
                value={
                  selectedComplaint.status
                }
              />

              <Detail
                label="Address"
                value={
                  selectedComplaint.address
                }
              />

              <Detail
                label="Admin Message"
                value={
                  selectedComplaint.adminMessage ||
                  "No updates"
                }
              />

            </div>

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

/* =====================================================
   DETAIL COMPONENT
===================================================== */

const Detail = ({
  label,
  value,
}) => (

  <div>

    <strong>
      {label}
    </strong>

    <p
      style={{
        marginTop: 5,
      }}
    >
      {value}
    </p>

  </div>
);

/* =====================================================
   STYLES
===================================================== */

const styles = {

  page: {
    padding: 40,
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily:
      "Segoe UI, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    margin: 0,
    color: "#0f172a",
  },

  subTitle: {
    color: "#64748b",
    marginTop: 5,
  },

  search: {
    padding: "12px 16px",
    width: 260,
    borderRadius: 12,
    border:
      "1px solid #cbd5e1",
    outline: "none",
  },

  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 25,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.05)",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  tableHead: {
    background: "#e2e8f0",
  },

  thLeft: {
    padding: 16,
    textAlign: "left",
  },

  thCenter: {
    padding: 16,
    textAlign: "center",
  },

  tdLeft: {
    padding: 16,
    borderBottom:
      "1px solid #e5e7eb",
  },

  tdCenter: {
    padding: 16,
    textAlign: "center",
    borderBottom:
      "1px solid #e5e7eb",
  },

  row: {
    transition: "0.3s",
  },

  select: {
    padding: "8px 12px",
    borderRadius: 8,
    border:
      "1px solid #cbd5e1",
  },

  priorityBadge: {
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },

  viewBtn: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    marginRight: 8,
    cursor: "pointer",
  },

  updateBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },

  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
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
    zIndex: 999,
  },

  modal: {
    background: "#fff",
    width: 850,
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: 20,
    padding: 30,
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  closeBtn: {
    border: "none",
    background: "none",
    fontSize: 22,
    cursor: "pointer",
  },

  modalImage: {
    width: "100%",
    height: 320,
    objectFit: "cover",
    borderRadius: 14,
    marginTop: 15,
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2,1fr)",
    gap: 20,
    marginTop: 20,
  },
};

export default ComplaintsPage;