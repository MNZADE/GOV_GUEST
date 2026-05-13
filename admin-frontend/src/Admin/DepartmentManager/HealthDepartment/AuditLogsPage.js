import React, {
  useState,
  useEffect,
} from "react";

import io from "socket.io-client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const statusColors = {
  Pending: "#f59e0b",
  "In Progress": "#2563eb",
  Resolved: "#22c55e",
  Escalated: "#ef4444",
  Rejected: "#64748b",
};

const chartColors = [
  "#2563eb",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

const AuditLogsPage = ({
  departmentName = "Health Department",
}) => {

  const [complaints, setComplaints] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  /* =====================================================
     SOCKET CONNECTION
  ===================================================== */

  useEffect(() => {

    const socket =
      io("http://localhost:5000");

    socket.on(
      "complaintUpdated",
      (data) => {

        setComplaints((prev) =>

          prev.map((c) =>

            c.complaintId ===
            data.complaintId

              ? data

              : c
          )
        );
      }
    );

    socket.on(
      "newComplaint",
      (data) => {

        setComplaints((prev) => [
          data,
          ...prev,
        ]);
      }
    );

    return () =>
      socket.disconnect();

  }, []);

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

          if (!token) {

            return;
          }

          const response =
            await fetch(
              "http://localhost:5000/api/complaints/manager/health",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          if (
            data.success
          ) {

            const updated =
              data.complaints.map(
                (c) => {

                  let priority =
                    c.priority ||
                    "Normal";

                  const issueText =
                    `${c.issue} ${c.description}`
                      .toLowerCase();

                  /* ===================================
                     AUTO PRIORITY DETECTION
                  =================================== */

                  if (

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
                      "drainage"
                    ) ||

                    issueText.includes(
                      "dirty"
                    ) ||

                    issueText.includes(
                      "medical"
                    ) ||

                    issueText.includes(
                      "toilet"
                    )

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
     FILTER COMPLAINTS
  ===================================================== */

  const filteredComplaints =
    complaints.filter(
      (c) => {

        const matchesSearch =

          (
            c.complaintId ||
            ""
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          (
            c.issue ||
            ""
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          (
            c.address ||
            ""
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesStatus =

          statusFilter ===
            "All" ||

          c.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  /* =====================================================
     REPORT CARDS
  ===================================================== */

  const totalComplaints =
    complaints.length;

  const resolvedComplaints =
    complaints.filter(
      (c) =>
        c.status ===
        "Resolved"
    ).length;

  const pendingComplaints =
    complaints.filter(
      (c) =>
        c.status ===
        "Pending"
    ).length;

  const escalatedComplaints =
    complaints.filter(
      (c) =>
        c.status ===
        "Escalated"
    ).length;

  /* =====================================================
     MONTHLY REPORT
  ===================================================== */

  const monthlyData = [];

  const monthMap = {};

  complaints.forEach((c) => {

    const date =
      new Date(
        c.createdAt
      );

    const month =
      date.toLocaleString(
        "default",
        {
          month: "short",
        }
      );

    if (
      !monthMap[month]
    ) {

      monthMap[month] = 0;
    }

    monthMap[month]++;
  });

  Object.keys(
    monthMap
  ).forEach((m) => {

    monthlyData.push({
      month: m,
      complaints:
        monthMap[m],
    });
  });

  /* =====================================================
     STATUS REPORT
  ===================================================== */

  const statusReport = [

    {
      name: "Pending",
      value:
        pendingComplaints,
    },

    {
      name: "Resolved",
      value:
        resolvedComplaints,
    },

    {
      name: "Escalated",
      value:
        escalatedComplaints,
    },
  ];

  return (

    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h2 style={styles.title}>
            {departmentName} –
            Audit Logs &
            Analytics
          </h2>

          <p style={styles.subTitle}>
            Real-Time Health Complaint Monitoring Dashboard
          </p>

        </div>

      </div>

      {/* REPORT CARDS */}

      <div style={styles.reportGrid}>

        <div style={styles.reportCard}>
          <h3>Total Complaints</h3>
          <h1>
            {totalComplaints}
          </h1>
        </div>

        <div style={styles.reportCard}>
          <h3>Resolved</h3>
          <h1>
            {resolvedComplaints}
          </h1>
        </div>

        <div style={styles.reportCard}>
          <h3>Pending</h3>
          <h1>
            {pendingComplaints}
          </h1>
        </div>

        <div style={styles.reportCard}>
          <h3>Escalated</h3>
          <h1>
            {escalatedComplaints}
          </h1>
        </div>

      </div>

      {/* CHARTS */}

      <div style={styles.chartGrid}>

        <div style={styles.chartCard}>

          <h3>
            Monthly Complaints Report
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={
                monthlyData
              }
            >

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="complaints"
                fill="#2563eb"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div style={styles.chartCard}>

          <h3>
            Complaint Status Overview
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={
                  statusReport
                }
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >

                {statusReport.map(
                  (
                    entry,
                    index
                  ) => (

                    <Cell
                      key={index}
                      fill={
                        chartColors[
                          index
                        ]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* SEARCH + FILTER */}

      <div style={styles.filterRow}>

        <input
          type="text"
          placeholder="Search Complaint..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={styles.input}
        />

        <select
          value={
            statusFilter
          }
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          style={styles.input}
        >

          <option value="All">
            All
          </option>

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
                Address
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Priority
              </th>

              <th style={styles.th}>
                Date
              </th>

              <th style={styles.th}>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map(
              (c) => (

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
                    {c.issue}
                  </td>

                  <td style={styles.td}>
                    {
                      c.address
                    }
                  </td>

                  <td style={styles.td}>

                    <span
                      style={{
                        background:
                          statusColors[
                            c.status
                          ],

                        color:
                          "#fff",

                        padding:
                          "6px 14px",

                        borderRadius:
                          20,

                        fontSize: 12,

                        fontWeight: 600,
                      }}
                    >
                      {
                        c.status
                      }
                    </span>

                  </td>

                  <td style={styles.td}>
                    {
                      c.priority ||
                      "Normal"
                    }
                  </td>

                  <td style={styles.td}>
                    {new Date(
                      c.createdAt
                    ).toLocaleDateString()}
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

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {selectedComplaint && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            {/* HEADER */}

            <div style={styles.modalTop}>

              <div>

                <h2 style={styles.modalTitle}>
                  Complaint Details
                </h2>

                <p style={styles.modalSubtitle}>
                  Smart Health Monitoring System
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
                ✕
              </button>

            </div>

            {/* IMAGE */}

            {selectedComplaint.images?.[0] && (

              <img
                src={`http://localhost:5000/uploads/${selectedComplaint.images[0]}`}
                alt="Complaint"
                style={styles.heroImage}
              />
            )}

            {/* STATUS GRID */}

            <div style={styles.statusGrid}>

              <div style={styles.statusCard}>
                <span style={styles.cardLabel}>
                  Complaint ID
                </span>

                <h3>
                  {
                    selectedComplaint.complaintId
                  }
                </h3>
              </div>

              <div style={styles.statusCard}>
                <span style={styles.cardLabel}>
                  Status
                </span>

                <h3
                  style={{
                    color:
                      statusColors[
                        selectedComplaint.status
                      ],
                  }}
                >
                  {
                    selectedComplaint.status
                  }
                </h3>
              </div>

              <div style={styles.statusCard}>
                <span style={styles.cardLabel}>
                  Priority
                </span>

                <h3>
                  {
                    selectedComplaint.priority ||
                    "Normal"
                  }
                </h3>
              </div>

              <div style={styles.statusCard}>
                <span style={styles.cardLabel}>
                  Department
                </span>

                <h3>
                  Health Department
                </h3>
              </div>

            </div>

            {/* DETAILS */}

            <div style={styles.detailsContainer}>

              <div style={styles.detailBox}>
                <label>
                  Issue
                </label>

                <p>
                  {
                    selectedComplaint.issue
                  }
                </p>
              </div>

              <div style={styles.detailBox}>
                <label>
                  Description
                </label>

                <p>
                  {
                    selectedComplaint.description
                  }
                </p>
              </div>

              <div style={styles.detailBox}>
                <label>
                  Address
                </label>

                <p>
                  {
                    selectedComplaint.address
                  }
                </p>
              </div>

              <div style={styles.detailBox}>
                <label>
                  Admin Message
                </label>

                <p>
                  {
                    selectedComplaint.adminMessage ||
                    "No updates available"
                  }
                </p>
              </div>

            </div>

            {/* TIMELINE */}

            <div style={styles.timelineCard}>

              <h3 style={styles.sectionHeading}>
                Complaint Timeline
              </h3>

              <div style={styles.timelineList}>

                <div style={styles.timelineItem}>

                  <div style={styles.timelineDot}></div>

                  <div>

                    <strong>
                      Complaint Registered
                    </strong>

                    <p>
                      {new Date(
                        selectedComplaint.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>

                <div style={styles.timelineItem}>

                  <div
                    style={{
                      ...styles.timelineDot,
                      background:
                        "#2563eb",
                    }}
                  ></div>

                  <div>

                    <strong>
                      Last Updated
                    </strong>

                    <p>
                      {selectedComplaint.updatedAt
                        ? new Date(
                            selectedComplaint.updatedAt
                          ).toLocaleString()
                        : "Not Updated"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* GOOGLE MAP */}

            {(selectedComplaint.latitude ||
              selectedComplaint.lat) && (

              <div style={styles.mapCard}>

                <h3 style={styles.sectionHeading}>
                  Complaint Location
                </h3>

                <iframe
                  title="map"
                  width="100%"
                  height="280"
                  style={styles.mapFrame}
                  src={`https://www.google.com/maps?q=${
                    selectedComplaint.latitude ||
                    selectedComplaint.lat
                  },${
                    selectedComplaint.longitude ||
                    selectedComplaint.lon
                  }&z=15&output=embed`}
                />

              </div>
            )}

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

  page: {
    padding: 30,
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily:
      "Segoe UI, sans-serif",
  },

  header: {
    marginBottom: 25,
  },

  title: {
    margin: 0,
    color: "#0f172a",
  },

  subTitle: {
    color: "#64748b",
    marginTop: 6,
  },

  reportGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 25,
  },

  reportCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 25,
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.05)",
  },

  chartGrid: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 20,
    marginBottom: 25,
  },

  chartCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 20,
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.05)",
  },

  filterRow: {
    display: "flex",
    gap: 15,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  input: {
    padding: 12,
    borderRadius: 12,
    border:
      "1px solid #cbd5e1",
    minWidth: 250,
    outline: "none",
  },

  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 20,
    overflowX: "auto",
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.05)",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  tableHead: {
    background: "#e2e8f0",
  },

  th: {
    padding: 16,
    textAlign: "center",
    fontWeight: 700,
    color: "#0f172a",
  },

  td: {
    padding: 16,
    textAlign: "center",
    borderBottom:
      "1px solid #e5e7eb",
  },

  row: {
    transition: "0.3s",
  },

  viewBtn: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
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
    width: "95%",
    maxWidth: "800px",
    maxHeight: "60vh",
    overflowY: "center",
    background: "#fff",
    borderRadius: 28,
    padding: 30,
  },

  modalTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  modalTitle: {
    margin: 0,
    fontSize: 28,
  },

  modalSubtitle: {
    color: "#64748b",
    marginTop: 5,
  },

  closeBtn: {
    width: 45,
    height: 45,
    borderRadius: 12,
    border: "none",
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: 18,
  },

  heroImage: {
    width: "100%",
    height: 350,
    objectFit: "cover",
    borderRadius: 20,
    marginBottom: 25,
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 25,
  },

  statusCard: {
    background: "#f8fafc",
    borderRadius: 18,
    padding: 20,
  },

  cardLabel: {
    color: "#64748b",
    fontSize: 13,
  },

  detailsContainer: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(300px,1fr))",
    gap: 20,
    marginBottom: 30,
  },

  detailBox: {
    border:
      "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 20,
    background: "#fff",
  },

  timelineCard: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
  },

  sectionHeading: {
    marginBottom: 20,
  },

  timelineList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  timelineItem: {
    display: "flex",
    gap: 15,
  },

  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#f59e0b",
    marginTop: 6,
  },

  mapCard: {
    marginBottom: 25,
  },

  mapFrame: {
    border: 0,
    borderRadius: 20,
  },
};

export default AuditLogsPage;