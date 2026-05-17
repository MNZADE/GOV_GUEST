import React, {
  useState,
  useEffect,
} from "react";

import axios from "axios";

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
};

const chartColors = [

  "#2563eb",

  "#22c55e",

  "#f59e0b",

  "#ef4444",
];

const AuditLogsPage = () => {

  const [complaints, setComplaints] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  /* =========================================
     FETCH COMPLAINTS
  ========================================= */

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

        const apiUrl =
          "http://localhost:5000/api/complaints/manager/roads";

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

        if (
          response.data.success
        ) {

          const updatedData =

            response.data.complaints.map(
              (c) => {

                let priority =
                  "Normal";

                const issueText =

                  `${c.issue} ${c.description}`
                    .toLowerCase();

                const createdHours =

                  (
                    Date.now() -

                    new Date(
                      c.createdAt
                    )

                  ) /

                  (
                    1000 *
                    60 *
                    60
                  );

                if (

                  issueText.includes(
                    "accident"
                  ) ||

                  issueText.includes(
                    "danger"
                  ) ||

                  issueText.includes(
                    "collapsed"
                  )

                ) {

                  priority =
                    "High";
                }

                else if (
                  createdHours > 48
                ) {

                  priority =
                    "Medium";
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

        console.log(err);
      }
    };

  /* =========================================
     FILTER
  ========================================= */

  const filteredComplaints =

    complaints.filter(
      (c) =>

        c.issue
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        c.address
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        c.complaintId
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  /* =========================================
     REPORTS
  ========================================= */

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

  /* =========================================
     MONTHLY DATA
  ========================================= */

  const monthMap = {};

  complaints.forEach((c) => {

    const month =
      new Date(
        c.createdAt
      ).toLocaleString(
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

  const monthlyData =
    Object.keys(
      monthMap
    ).map((m) => ({

      month: m,
      complaints:
        monthMap[m],
    }));

  /* =========================================
     STATUS REPORT
  ========================================= */

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
            Road Department -
            Audit Logs Dashboard
          </h2>

          <p style={styles.subTitle}>
            Smart Complaint Monitoring &
            Analytics
          </p>

        </div>

      </div>

      {/* REPORTS */}

      <div style={styles.reportGrid}>

        <div style={styles.reportCard}>
          <h3>Total</h3>
          <h1>
            {
              totalComplaints
            }
          </h1>
        </div>

        <div style={styles.reportCard}>
          <h3>Resolved</h3>
          <h1>
            {
              resolvedComplaints
            }
          </h1>
        </div>

        <div style={styles.reportCard}>
          <h3>Pending</h3>
          <h1>
            {
              pendingComplaints
            }
          </h1>
        </div>

        <div style={styles.reportCard}>
          <h3>Escalated</h3>
          <h1>
            {
              escalatedComplaints
            }
          </h1>
        </div>

      </div>

      {/* CHARTS */}

      <div style={styles.chartGrid}>

        <div style={styles.chartCard}>

          <h3>
            Monthly Reports
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
            Complaint Status
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
                dataKey="value"
                outerRadius={100}
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

      {/* SEARCH */}

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

      </div>

      {/* TABLE */}

      <div style={styles.card}>

        <table style={styles.table}>

          <thead
            style={
              styles.tableHead
            }
          >

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
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map(
              (c) => (

                <tr
                  key={c._id}
                  style={
                    styles.row
                  }
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
                    {c.address}
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
                      }}
                    >
                      {
                        c.status
                      }
                    </span>

                  </td>

                  <td style={styles.td}>
                    {
                      c.priority
                    }
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

            <div style={styles.modalHeader}>

              <div>

                <h2>
                  Complaint Details
                </h2>

                <p style={styles.modalSub}>
                  Road Department Monitoring
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
                ✕
              </button>

            </div>

            {/* TOP DETAILS */}

            <div style={styles.detailsGrid}>

              <div style={styles.detailCard}>

                <span>
                  Complaint ID
                </span>

                <h3>
                  {
                    selectedComplaint.complaintId
                  }
                </h3>

              </div>

              <div style={styles.detailCard}>

                <span>
                  Status
                </span>

                <h3>
                  {
                    selectedComplaint.status
                  }
                </h3>

              </div>

              <div style={styles.detailCard}>

                <span>
                  Priority
                </span>

                <h3>
                  {
                    selectedComplaint.priority
                  }
                </h3>

              </div>

              <div style={styles.detailCard}>

                <span>
                  Department
                </span>

                <h3>
                  {
                    selectedComplaint.department
                  }
                </h3>

              </div>

            </div>

            {/* COMPLAINT DETAILS */}

            <div style={styles.infoBox}>

              <label>
                Issue
              </label>

              <p>
                {
                  selectedComplaint.issue
                }
              </p>

            </div>

            <div style={styles.infoBox}>

              <label>
                Description
              </label>

              <p>
                {
                  selectedComplaint.description
                }
              </p>

            </div>

            <div style={styles.infoBox}>

              <label>
                Address
              </label>

              <p>
                {
                  selectedComplaint.address
                }
              </p>

            </div>

            {/* OFFICER DETAILS */}

            <div style={styles.sectionTitle}>
              Assigned Officer Details
            </div>

            <div style={styles.detailsGrid}>

              <div style={styles.detailCard}>

                <span>
                  Officer Name
                </span>

                <h3>
                  {
                    selectedComplaint.assignedOfficerName ||
                    "Not Assigned"
                  }
                </h3>

              </div>

              <div style={styles.detailCard}>

                <span>
                  Officer Email
                </span>

                <h3>
                  {
                    selectedComplaint.assignedOfficerEmail ||
                    "N/A"
                  }
                </h3>

              </div>

              <div style={styles.detailCard}>

                <span>
                  Current Status
                </span>

                <h3>
                  {
                    selectedComplaint.status
                  }
                </h3>

              </div>

            </div>

            {/* TIMELINE */}

            <div style={styles.sectionTitle}>
              Complaint Timeline
            </div>

            <div style={styles.detailsGrid}>

              <div style={styles.detailCard}>

                <span>
                  Created At
                </span>

                <h3>

                  {new Date(
                    selectedComplaint.createdAt
                  ).toLocaleString()}

                </h3>

              </div>

              <div style={styles.detailCard}>

                <span>
                  Updated At
                </span>

                <h3>

                  {selectedComplaint.updatedAt

                    ? new Date(
                        selectedComplaint.updatedAt
                      ).toLocaleString()

                    : "N/A"}

                </h3>

              </div>

              <div style={styles.detailCard}>

                <span>
                  Resolved At
                </span>

                <h3>

                  {selectedComplaint.resolvedAt

                    ? new Date(
                        selectedComplaint.resolvedAt
                      ).toLocaleString()

                    : "Not Resolved"}

                </h3>

              </div>

            </div>

            {/* OFFICER REMARK */}

            <div style={styles.infoBox}>

              <label>
                Officer Remark
              </label>

              <p>

                {
                  selectedComplaint.officerRemark ||
                  "No Remarks"
                }

              </p>

            </div>

            {/* USER IMAGE */}

            {selectedComplaint.image && (

              <div style={styles.imageSection}>

                <label>
                  Complaint Image
                </label>

                <img
                  src={`http://localhost:5000/uploads/${selectedComplaint.image}`}
                  alt="Complaint"
                  style={styles.image}
                />

              </div>
            )}

            {/* UPDATED IMAGE */}

            {selectedComplaint.officerUpdatedImage && (

              <div style={styles.imageSection}>

                <label>
                  Resolved / Updated Image
                </label>

                <img
                  src={`http://localhost:5000/uploads/${selectedComplaint.officerUpdatedImage}`}
                  alt="Updated"
                  style={styles.image}
                />

              </div>
            )}

            {/* HISTORY */}

            <div style={styles.sectionTitle}>
              Complaint History
            </div>

            <div style={styles.historyBox}>

              {selectedComplaint.history &&
              selectedComplaint.history.length > 0 ? (

                selectedComplaint.history.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      key={index}
                      style={styles.historyItem}
                    >

                      <div
                        style={
                          styles.historyTop
                        }
                      >

                        <strong>
                          {item.status}
                        </strong>

                        <span>

                          {new Date(
                            item.updatedAt
                          ).toLocaleString()}

                        </span>

                      </div>

                      <p>
                        {item.message}
                      </p>

                      <small>

                        Updated By:
                        {" "}

                        {
                          item.updatedBy
                        }

                      </small>

                    </div>
                  )
                )

              ) : (

                <p>
                  No History Available
                </p>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

const styles = {

  page: {
    padding: 30,
    background: "#f1f5f9",
    minHeight: "100vh",
  },

  header: {
    marginBottom: 25,
  },

  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 700,
  },

  subTitle: {
    color: "#64748b",
    marginTop: 8,
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
    marginBottom: 20,
  },

  input: {
    width: 300,
    padding: 12,
    borderRadius: 12,
    border:
      "1px solid #cbd5e1",
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
    borderRadius: 10,
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
    width: "90%",
    maxWidth: 900,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 25,
    padding: 30,
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  modalSub: {
    color: "#64748b",
  },

  closeBtn: {
    width: 45,
    height: 45,
    border: "none",
    borderRadius: 12,
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: 18,
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: 20,
    marginBottom: 25,
  },

  detailCard: {
    background: "#f8fafc",
    padding: 20,
    borderRadius: 18,
  },

  infoBox: {
    background: "#fff",
    border:
      "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {

    fontSize: 22,

    fontWeight: 700,

    marginTop: 25,

    marginBottom: 18,

    color: "#0f172a",
  },

  imageSection: {

    marginTop: 25,
  },

  image: {

    width: "100%",

    maxHeight: 350,

    objectFit: "cover",

    borderRadius: 20,

    marginTop: 12,
  },

  historyBox: {

    marginTop: 15,

    background: "#f8fafc",

    borderRadius: 18,

    padding: 20,
  },

  historyItem: {

    background: "#fff",

    padding: 18,

    borderRadius: 15,

    marginBottom: 15,

    border:
      "1px solid #e2e8f0",
  },

  historyTop: {

    display: "flex",

    justifyContent:
      "space-between",

    marginBottom: 10,
  },
};

export default AuditLogsPage;