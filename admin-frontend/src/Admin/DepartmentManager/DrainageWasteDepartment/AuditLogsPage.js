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

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

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

        /* DRAINAGE API */

        const apiUrl =
          "http://localhost:5000/api/complaints/manager/drainage";

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

                /* DRAINAGE PRIORITY */

                if (

                  issueText.includes(
                    "sewage overflow"
                  ) ||

                  issueText.includes(
                    "drainage blockage"
                  ) ||

                  issueText.includes(
                    "garbage overflow"
                  ) ||

                  issueText.includes(
                    "water logging"
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

            Drainage, Sewage & Garbage Collection Department -
            Audit Logs Dashboard

          </h2>

          <p style={styles.subTitle}>

            Smart Drainage, Sewage & Garbage Complaint Monitoring &
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

                  Drainage, Sewage & Garbage Monitoring

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
        {/* TOP DETAILS */}

        <div style={styles.detailsGrid}>

          {/* COMPLAINT ID */}

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

          {/* CURRENT STATUS */}

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

          {/* PRIORITY */}

          <div style={styles.detailCard}>

            <span>
              Priority Level
            </span>

            <h3>
              {
                selectedComplaint.priority
              }
            </h3>

          </div>

          {/* DEPARTMENT */}

          <div style={styles.detailCard}>

            <span>
              Department
            </span>

            <h3>

              Drainage, Sewage &
              Garbage Collection

            </h3>

          </div>

          {/* COMPLAINT DATE */}

          <div style={styles.detailCard}>

            <span>
              Complaint Date
            </span>

            <h3>

              {selectedComplaint.createdAt

                ? new Date(
                    selectedComplaint.createdAt
                  ).toLocaleString()

                : "N/A"}

            </h3>

          </div>

          {/* LAST UPDATED */}

          <div style={styles.detailCard}>

            <span>
              Last Updated
            </span>

            <h3>

              {selectedComplaint.updatedAt

                ? new Date(
                    selectedComplaint.updatedAt
                  ).toLocaleString()

                : "Not Updated"}

            </h3>

          </div>

         
          
          

        </div>

        {/* TIMELINE */}

        <div style={styles.infoBox}>

          <label>
            Complaint Timeline
          </label>

          <div style={styles.timelineWrapper}>

            {/* REGISTERED */}

            <div style={styles.timelineItem}>

              <div style={styles.timelineDot}></div>

              <div>

                <h4 style={styles.timelineTitle}>
                  Complaint Registered
                </h4>

                <p style={styles.timelineText}>

                  {selectedComplaint.createdAt

                    ? new Date(
                        selectedComplaint.createdAt
                      ).toLocaleString()

                    : "N/A"}

                </p>

              </div>

            </div>

            {/* ASSIGNED */}

            <div style={styles.timelineItem}>

              <div style={styles.timelineDot}></div>

              <div>

                <h4 style={styles.timelineTitle}>
                  Officer Assigned
                </h4>

                <p style={styles.timelineText}>

                  {selectedComplaint.assignedOfficer ||

                    "Officer Not Assigned"}

                </p>

              </div>

            </div>

            {/* IN PROGRESS */}

            <div style={styles.timelineItem}>

              <div style={styles.timelineDot}></div>

              <div>

                <h4 style={styles.timelineTitle}>
                  Work In Progress
                </h4>

                <p style={styles.timelineText}>

                  {selectedComplaint.inProgressDate

                    ? new Date(
                        selectedComplaint.inProgressDate
                      ).toLocaleString()

                    : "Work Not Started"}

                </p>

              </div>

            </div>

            {/* RESOLVED */}

            <div style={styles.timelineItem}>

              <div style={styles.timelineDot}></div>

              <div>

                <h4 style={styles.timelineTitle}>
                  Complaint Resolved
                </h4>

                <p style={styles.timelineText}>

                  {selectedComplaint.resolvedAt

                    ? new Date(
                        selectedComplaint.resolvedAt
                      ).toLocaleString()

                    : "Pending Resolution"}

                </p>

              </div>

            </div>

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

        {/* GEO TAG */}

        <div style={styles.infoBox}>

          <label>
            Geo Tag Location
          </label>

          <p>

            Latitude:
            {" "}
            {
              selectedComplaint.latitude ||
              "N/A"
            }

            <br />

            Longitude:
            {" "}
            {
              selectedComplaint.longitude ||
              "N/A"
            }

          </p>

        </div>

        {/* IMAGE */}

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

    outline: "none",

    fontSize: 15,
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

    fontSize: 14,

    fontWeight: 700,

    color: "#0f172a",
  },

  td: {

    padding: 16,

    textAlign: "center",

    borderBottom:
      "1px solid #e5e7eb",

    fontSize: 14,
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

    zIndex: 999,
  },

  modal: {

    width: "90%",

    maxWidth: 950,

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

    marginTop: 5,
  },

  closeBtn: {

    width: 45,

    height: 45,

    border: "none",

    borderRadius: 12,

    background: "#f1f5f9",

    cursor: "pointer",

    fontSize: 18,

    fontWeight: 700,
  },

  detailsGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: 20,

    marginBottom: 25,
  },

  detailCard: {

    background: "#f8fafc",

    padding: 20,

    borderRadius: 18,

    border:
      "1px solid #e2e8f0",
  },

  infoBox: {

    background: "#fff",

    border:
      "1px solid #e2e8f0",

    borderRadius: 18,

    padding: 20,

    marginBottom: 20,
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

  timelineWrapper: {

    marginTop: 20,
  },

  timelineItem: {

    display: "flex",

    gap: 16,

    marginBottom: 24,

    alignItems: "flex-start",
  },

  timelineDot: {

    width: 16,

    height: 16,

    borderRadius: "50%",

    background: "#2563eb",

    marginTop: 5,
  },

  timelineTitle: {

    margin: 0,

    fontSize: 16,

    fontWeight: 700,
  },

  timelineText: {

    marginTop: 6,

    color: "#64748b",

    lineHeight: 1.6,
  },
};

export default AuditLogsPage;