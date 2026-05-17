import React, {
  useState,
  useEffect,
} from "react";

import axios from "axios";

const ComplaintsPage = ({
  departmentName =
    "Water Department",
}) => {

  /* =========================================
     SLA RULES
  ========================================= */

  const SLA_RULES = {

    Normal: 48,

    Urgent: 12,

    Escalated: 6,
  };

  /* =========================================
     STATES
  ========================================= */

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    timeNow,
    setTimeNow,
  ] = useState(new Date());

  const [
    searchId,
    setSearchId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =========================================
     FETCH COMPLAINTS
  ========================================= */

  useEffect(() => {

    const fetchComplaints =
      async () => {

        try {

          setLoading(true);

          const token =
            localStorage.getItem(
              "kmc_token"
            );

          const user =
            JSON.parse(
              localStorage.getItem(
                "kmc_user"
              )
            );

          if (
            !token ||
            !user
          ) {

            console.log(
              "No token"
            );

            return;
          }

          const role =
            user.role;

          const deptMap = {

            "health department":
              "health",

            "sanitation department":
              "sanitation",

            "water supply department":
              "water",

            "electricity department":
              "electricity department",

            "road & transportation department":
              "roads",

            "drainage & sewage department":
              "drainage",

            "general complaint department":
              "other",
          };

          const department =

            deptMap[
              user.department
                ?.toLowerCase()
            ] ||

            user.department
              ?.toLowerCase()
              .replace(
                " supply department",
                ""
              )
              .replace(
                " department",
                ""
              )
              .trim();

          let apiUrl = "";

          /* =============================
             SYSTEM MANAGER
          ============================= */

          if (
            role ===
            "system_manager"
          ) {

            apiUrl =
              "http://localhost:5000/api/complaints/system/all";
          }

          /* =============================
             DEPARTMENT MANAGER
          ============================= */

          else if (
            role ===
            "department_manager"
          ) {

            apiUrl =
              `http://localhost:5000/api/complaints/manager/${department}`;
          }

          /* =============================
             FETCH API
          ============================= */

          const response =
            await axios.get(
              apiUrl,
              {
                headers: {

                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          console.log(
            "FETCH RESPONSE:",
            response.data
          );

          if (
            response.data
              .success
          ) {

            const updatedData =

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

                  /* =====================
                     AUTO PRIORITY
                  ===================== */

                  if (

                    issueText.includes(
                      "pipe burst"
                    ) ||

                    issueText.includes(
                      "water leakage"
                    ) ||

                    issueText.includes(
                      "no water"
                    ) ||

                    issueText.includes(
                      "overflow"
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
                      "Urgent";
                  }

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
            "Fetch Complaint Error:",
            err
          );

        } finally {

          setLoading(false);
        }
      };

    fetchComplaints();

  }, []);

  /* =========================================
     LIVE CLOCK
  ========================================= */

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

  /* =========================================
     AUTO ESCALATION
  ========================================= */

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
              "Escalated" &&

            c.status !==
              "Resolved"

          ) {

            return {

              ...c,

              status:
                "Escalated",

              priority:
                "Urgent",
            };
          }

          return c;
        })
    );

  }, [timeNow]);

  /* =========================================
     SLA TIMER
  ========================================= */

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

      const h =
        Math.floor(
          diff /
            (1000 *
              60 *
              60)
        );

      const m =
        Math.floor(
          (diff /
            (1000 *
              60)) %
            60
        );

      const s =
        Math.floor(
          (diff / 1000) %
            60
        );

      return `${h}h ${m}m ${s}s`;
    };

  /* =========================================
     UPDATE STATUS
  ========================================= */

  const updateStatus = (
    complaintId,
    newStatus
  ) => {

    setComplaints(
      (prev) =>

        prev.map((c) =>

          c.complaintId ===
          complaintId

            ? {

                ...c,

                status:
                  newStatus,
              }

            : c
        )
    );
  };

  /* =========================================
     UPDATE COMPLAINT
  ========================================= */

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
            "Admin message required"
          );
        }

        const response =
          await axios.put(

            `http://localhost:5000/api/complaints/manager/update/${complaint.complaintId}`,

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
          response.data
            .success
        ) {

          alert(
            "Complaint updated successfully"
          );
        }

      } catch (err) {

        console.error(
          err
        );

        alert(
          "Update failed"
        );
      }
    };

  /* =========================================
     DELETE COMPLAINT
  ========================================= */

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

        console.error(
          err
        );

        alert(
          "Delete failed"
        );
      }
    };

  /* =========================================
     PRIORITY COLOR
  ========================================= */

  const getPriorityColor =
    (priority) => {

      if (
        priority ===
        "Normal"
      )
        return "#22c55e";

      if (
        priority ===
        "Urgent"
      )
        return "#f97316";

      if (
        priority ===
        "Escalated"
      )
        return "#ef4444";

      return "#64748b";
    };

  /* =========================================
     FILTER
  ========================================= */

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

            {departmentName}
            {" "}
            – Complaint Control Room

          </h2>

          <p style={styles.subTitle}>

            Real-time Monitoring & SLA Governance System

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

      {/* LOADING */}

      {loading && (

        <div style={styles.loading}>
          Loading Complaints...
        </div>
      )}

      {/* TABLE */}

      <div style={styles.card}>

        <table style={styles.table}>

          <thead style={styles.tableHead}>

            <tr>

              <th style={styles.thLeft}>
                ID
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

                const isOverdue =

                  remaining ===
                  "Overdue";

                return (

                  <tr
                    key={
                      c.complaintId
                    }
                    style={{
                      ...styles.row,

                      background:

                        c.priority ===
                        "Urgent"

                          ? "#fff7ed"

                          : c.priority ===
                            "Escalated"

                          ? "#fef2f2"

                          : "#ffffff",
                    }}
                  >

                    <td style={styles.tdLeft}>
                      {
                        c.complaintId
                      }
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
                        {
                          c.priority
                        }
                      </span>

                    </td>

                    <td style={styles.tdCenter}>

                      <select
                        value={c.status}
                        onChange={(e) =>
                          updateStatus(
                            c.complaintId,
                            e.target
                              .value
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

                    <td
                      style={{

                        ...styles.tdCenter,

                        color:

                          isOverdue
                            ? "#ef4444"
                            : "#0f172a",

                        fontWeight: 700,
                      }}
                    >

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

            {selectedComplaint.images?.[0] && (

              <img
                src={`http://localhost:5000/uploads/${selectedComplaint.images?.[0]}`}
                alt="complaint"
                style={styles.modalImage}
              />
            )}

            <div style={styles.detailsGrid}>

              <Detail
                label="Complaint ID"
                value={
                  selectedComplaint.complaintId
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
                label="SLA Remaining"
                value={getRemainingTime(
                  selectedComplaint
                )}
              />

              <Detail
                label="Admin Message"
                value={
                  selectedComplaint.adminMessage ||
                  "No updates yet"
                }
              />

            </div>

            <p style={{
              marginTop: 20,
            }}>

              <strong>
                Address:
              </strong>

              {" "}

              {
                selectedComplaint.address
              }

            </p>

            {/* MAP */}

            {(selectedComplaint.lat ||
              selectedComplaint.latitude) && (

              <iframe
                title="map"
                width="100%"
                height="250"
                style={{
                  border: 0,
                  marginTop: 15,
                  borderRadius: 12,
                }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${
                  selectedComplaint.lat ||
                  selectedComplaint.latitude
                },${
                  selectedComplaint.lon ||
                                   selectedComplaint.longitude
                }&z=15&output=embed`}
              ></iframe>
            )}

            <div style={{
              marginTop: 20,
              textAlign:
                "right",
            }}>

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

/* =========================================
   DETAIL COMPONENT
========================================= */

const Detail = ({
  label,
  value,
}) => (

  <div>

    <strong>
      {label}
    </strong>

    <p style={{
      margin: "4px 0",
    }}>
      {value}
    </p>

  </div>
);

/* =========================================
   STYLES
========================================= */

const styles = {

  page: {

    padding: "40px",

    background:
      "#f1f5f9",

    minHeight:
      "100vh",

    fontFamily:
      "Segoe UI, sans-serif",
  },

  loading: {

    marginBottom: 20,

    fontWeight: "bold",

    color: "#2563eb",
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom:
      "30px",
  },

  title: {

    margin: 0,
  },

  subTitle: {

    fontSize: 13,

    color: "#64748b",

    marginTop: 4,
  },

  search: {

    width: "260px",

    padding:
      "12px 16px",

    borderRadius: 12,

    border:
      "1px solid #cbd5e1",

    outline: "none",
  },

  card: {

    background:
      "#ffffff",

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

    background:
      "#e2e8f0",
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

    textAlign: "left",

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

    transition:
      "0.3s",
  },

  select: {

    padding:
      "8px 12px",

    borderRadius: 8,

    border:
      "1px solid #cbd5e1",
  },

  viewBtn: {

    background:
      "#0f172a",

    color: "#fff",

    border: "none",

    padding:
      "8px 14px",

    borderRadius: 8,

    marginRight: 6,

    cursor: "pointer",
  },

  updateBtn: {

    background:
      "#2563eb",

    color: "#fff",

    border: "none",

    padding:
      "8px 14px",

    borderRadius: 8,

    cursor: "pointer",
  },

  deleteBtn: {

    background:
      "#dc2626",

    color: "#fff",

    border: "none",

    padding:
      "10px 18px",

    borderRadius: 8,

    cursor: "pointer",
  },

  priorityBadge: {

    color: "#fff",

    padding:
      "6px 14px",

    borderRadius: 20,

    fontSize: 12,

    fontWeight: 700,
  },

  overlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.6)",

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    zIndex: 999,
  },

  modal: {

    background:
      "#fff",

    width: "850px",

    maxHeight:
      "90vh",

    overflowY:
      "auto",

    borderRadius: 20,

    padding: 30,
  },

  modalHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",
  },

  modalImage: {

    width: "100%",

    height: 300,

    objectFit:
      "cover",

    borderRadius: 12,

    marginTop: 15,
  },

  detailsGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(2,1fr)",

    gap: 20,

    marginTop: 20,
  },

  closeBtn: {

    background:
      "none",

    border: "none",

    fontSize: 20,

    cursor: "pointer",
  },
};

export default ComplaintsPage;