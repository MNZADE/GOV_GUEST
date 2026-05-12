import React, { useState, useEffect } from "react";
import axios from "axios";

const ElectricityDepartmentDashboard = () => {

  /* =====================================
     BACKEND
  ===================================== */

  const API_URL =
    "http://localhost:5000/api/complaints";

  const SLA_HOURS = 48;

  /* =====================================
     STATES
  ===================================== */

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    searchId,
    setSearchId,
  ] = useState("");

  const [
    timeNow,
    setTimeNow,
  ] = useState(new Date());

  /* =====================================
     LIVE TIMER
  ===================================== */

  useEffect(() => {

    const timer =
      setInterval(() => {

        setTimeNow(new Date());

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  /* =====================================
     FETCH COMPLAINTS
  ===================================== */

  const fetchComplaints =
    async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await axios.get(
            `${API_URL}/all`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          res.data.success
        ) {

          const electricityComplaints =
            res.data.complaints.filter(
              (c) => {

                const dept =
                  (
                    c.department ||
                    ""
                  )
                    .toLowerCase()
                    .trim();

                return (
                  dept.includes(
                    "electricity"
                  ) ||
                  dept.includes(
                    "street light"
                  ) ||
                  dept.includes(
                    "streetlight"
                  )
                );
              }
            );

          setComplaints(
            electricityComplaints
          );
        }

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchComplaints();

  }, []);

  /* =====================================
     AUTO REFRESH
  ===================================== */

  useEffect(() => {

    const refresh =
      setInterval(() => {

        fetchComplaints();

      }, 60000);

    return () =>
      clearInterval(refresh);

  }, []);

  /* =====================================
     SLA TIMER
  ===================================== */

  const getRemainingMilliseconds =
    (complaint) => {

      const created =
        new Date(
          complaint.createdAt
        );

      const deadline =
        new Date(
          created.getTime() +
            SLA_HOURS *
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
            (1000 * 60 * 60)
        );

      const m =
        Math.floor(
          (diff /
            (1000 * 60)) %
            60
        );

      const s =
        Math.floor(
          (diff / 1000) %
            60
        );

      return `${h}h ${m}m ${s}s`;
    };

  /* =====================================
     AUTO ESCALATION
  ===================================== */

  useEffect(() => {

    complaints.forEach(
      async (c) => {

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

          try {

            await axios.put(

              `${API_URL}/manager/update/${c._id}`,

              {
                status:
                  "Escalated",

                priority:
                  "Escalated",
              }
            );

          } catch (err) {

            console.log(err);
          }
        }
      }
    );

  }, [timeNow]);

  /* =====================================
     UPDATE STATUS
  ===================================== */

  const updateStatus =
    async (
      id,
      status
    ) => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await axios.put(

            `${API_URL}/manager/update/${id}`,

            {
              status,

              updatedAt:
                new Date(),

              priority:
                status ===
                "Escalated"
                  ? "Escalated"
                  : undefined,
            },

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          res.data.success
        ) {

          setComplaints((prev) =>
            prev.map((c) =>
              c._id === id
                ? {
                    ...c,
                    status,
                  }
                : c
            )
          );

          fetchComplaints();

          alert(
            "Complaint updated successfully"
          );
        }

      } catch (error) {

        console.log(error);

        alert(
          "Status update failed"
        );
      }
    };

  /* =====================================
     DELETE COMPLAINT
  ===================================== */

  const deleteComplaint =
    async (
      aadhaar,
      complaintId
    ) => {

      try {

        await axios.delete(

          `${API_URL}/user/${aadhaar}/${complaintId}`

        );

        setComplaints((prev) =>
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

      } catch (error) {

        console.log(error);

        alert(
          "Delete failed"
        );
      }
    };

  /* =====================================
     FILTER
  ===================================== */

  const filteredComplaints =
    complaints.filter((c) =>
      (
        c.complaintId || ""
      )
        .toLowerCase()
        .includes(
          searchId.toLowerCase()
        )
    );

  /* =====================================
     STATS
  ===================================== */

  const total =
    complaints.length;

  const pending =
    complaints.filter(
      (c) =>
        c.status ===
        "Pending"
    ).length;

  const resolved =
    complaints.filter(
      (c) =>
        c.status ===
        "Resolved"
    ).length;

  const escalated =
    complaints.filter(
      (c) =>
        c.status ===
        "Escalated"
    ).length;

  return (

    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Electricity Department Dashboard
          </h1>

          <p style={styles.subTitle}>
            Real-Time Electricity Complaint Monitoring
          </p>

        </div>

        <input
          type="text"
          placeholder="Search Complaint ID..."
          value={searchId}
          onChange={(e) =>
            setSearchId(
              e.target.value
            )
          }
          style={styles.search}
        />

      </div>

      {/* STATS */}

      <div style={styles.statsGrid}>

        <div style={styles.statCard}>
          <h3>Total</h3>
          <h1>{total}</h1>
        </div>

        <div style={styles.statCard}>
          <h3>Pending</h3>
          <h1>{pending}</h1>
        </div>

        <div style={styles.statCard}>
          <h3>Resolved</h3>
          <h1>{resolved}</h1>
        </div>

        <div style={styles.statCard}>
          <h3>Escalated</h3>
          <h1>{escalated}</h1>
        </div>

      </div>

      {/* TABLE */}

      <div style={styles.card}>

        {loading ? (

          <div style={styles.loading}>
            Loading complaints...
          </div>

        ) : (

          <table style={styles.table}>

            <thead style={styles.tableHead}>

              <tr>

                <th style={styles.th}>
                  Complaint ID
                </th>

                <th style={styles.th}>
                  Sub-Categories
                </th>

                <th style={styles.th}>
                  Priority
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  SLA Timer
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
                    getRemainingTime(
                      c
                    );

                  return (

                    <tr
                      key={c._id}
                      style={styles.row}
                    >

                      <td style={styles.td}>
                        {
                          c.complaintId
                        }
                      </td>

                      <td style={styles.td}>

                        {Array.isArray(
                          c.subcategories
                        )
                          ? c.subcategories.join(", ")
                          : c.subcategories || "-"}

                      </td>

                      <td style={styles.td}>

                        <span style={{
                          ...styles.priorityBadge,

                          background:
                            c.priority ===
                            "Escalated"
                              ? "#dc2626"
                              : c.priority ===
                                "Urgent"
                              ? "#f97316"
                              : "#16a34a",
                        }}>

                          {c.priority}

                        </span>

                      </td>

                      <td style={styles.td}>

                        <select
                          value={
                            c.status
                          }
                          onChange={(e) =>
                            updateStatus(
                              c._id,
                              e.target
                                .value
                            )
                          }
                          style={
                            styles.select
                          }
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

                      <td style={{
                        ...styles.td,

                        color:
                          remaining ===
                          "Overdue"
                            ? "#dc2626"
                            : "#0f766e",

                        fontWeight: 700,
                      }}>

                        {remaining}

                      </td>

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

                        <button
                          style={
                            styles.updateBtn
                          }
                          onClick={() =>
                            updateStatus(
                              c._id,
                              c.status
                            )
                          }
                        >
                          Update
                        </button>

                        <button
                          style={
                            styles.deleteBtn
                          }
                          onClick={() =>
                            deleteComplaint(
                              c.aadhaar,
                              c.complaintId
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>
        )}

      </div>

    </div>
  );
};

const styles = {

  page: {
    padding: 30,
    background: "#f8fafc",
    minHeight: "100vh",
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
    borderRadius: 10,
    border:
      "1px solid #cbd5e1",
    width: 260,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 25,
  },

  statCard: {
    background: "#fff",
    padding: 25,
    borderRadius: 18,
    boxShadow:
      "0 4px 20px rgba(0,0,0,0.05)",
  },

  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 25,
    boxShadow:
      "0 5px 25px rgba(0,0,0,0.05)",
  },

  loading: {
    padding: 50,
    textAlign: "center",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  tableHead: {
    background: "#f1f5f9",
  },

  th: {
    padding: 16,
    textAlign: "center",
  },

  td: {
    padding: 16,
    textAlign: "center",
    borderBottom:
      "1px solid #e2e8f0",
  },

  row: {
    transition: "0.3s",
  },

  priorityBadge: {
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
  },

  select: {
    padding: "8px 10px",
    borderRadius: 8,
  },

  viewBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    marginRight: 8,
  },

  updateBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    marginRight: 8,
  },

  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },

};

export default ElectricityDepartmentDashboard;