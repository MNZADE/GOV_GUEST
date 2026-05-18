import React, {
  useState,
  useEffect,
} from "react";

import {
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
} from "lucide-react";

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

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";

const COLORS = [
  "#f59e0b",
  "#2563eb",
  "#dc2626",
  "#16a34a",
];

const AuditLogsPage = () => {

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
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    currentImage,
    setCurrentImage,
  ] = useState(0);

  const [
    stats,
    setStats,
  ] = useState({

    total: 0,

    pending: 0,

    inProgress: 0,

    resolved: 0,

    escalated: 0,

    rejected: 0,
  });

  const [
    chartData,
    setChartData,
  ] = useState({

    weekly: [],

    monthly: [],

    yearly: [],
  });

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {

    const loadDashboard =
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

          /* =====================================
             FETCH COMPLAINTS
          ===================================== */

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

          if (data.success) {

            const complaintsData =
              data.complaints;

            setComplaints(
              complaintsData
            );

            /* =====================================
               STATS
            ===================================== */

            const pending =
              complaintsData.filter(
                (c) =>
                  c.status ===
                  "Pending"
              ).length;

            const inProgress =
              complaintsData.filter(
                (c) =>
                  c.status ===
                  "In Progress"
              ).length;

            const resolved =
              complaintsData.filter(
                (c) =>
                  c.status ===
                  "Resolved"
              ).length;

            const escalated =
              complaintsData.filter(
                (c) =>
                  c.status ===
                  "Escalated"
              ).length;

            const rejected =
              complaintsData.filter(
                (c) =>
                  c.status ===
                  "Rejected"
              ).length;

            setStats({

              total:
                complaintsData.length,

              pending,

              inProgress,

              resolved,

              escalated,

              rejected,
            });

            /* =====================================
               WEEKLY
            ===================================== */

            const weekMap = {

              Mon: 0,
              Tue: 0,
              Wed: 0,
              Thu: 0,
              Fri: 0,
              Sat: 0,
              Sun: 0,
            };

            complaintsData.forEach(
              (item) => {

                const day =
                  new Date(
                    item.createdAt
                  ).toLocaleDateString(
                    "en-US",
                    {
                      weekday:
                        "short",
                    }
                  );

                if (
                  weekMap[day] !==
                  undefined
                ) {

                  weekMap[day]++;
                }
              }
            );

            const weekly =
              Object.keys(
                weekMap
              ).map((key) => ({

                name: key,

                complaints:
                  weekMap[key],
              }));

            /* =====================================
               MONTHLY
            ===================================== */

            const monthMap = {

              Jan: 0,
              Feb: 0,
              Mar: 0,
              Apr: 0,
              May: 0,
              Jun: 0,
              Jul: 0,
              Aug: 0,
              Sep: 0,
              Oct: 0,
              Nov: 0,
              Dec: 0,
            };

            complaintsData.forEach(
              (item) => {

                const month =
                  new Date(
                    item.createdAt
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month:
                        "short",
                    }
                  );

                if (
                  monthMap[
                    month
                  ] !==
                  undefined
                ) {

                  monthMap[
                    month
                  ]++;
                }
              }
            );

            const monthly =
              Object.keys(
                monthMap
              ).map((key) => ({

                name: key,

                complaints:
                  monthMap[key],
              }));

            /* =====================================
               YEARLY
            ===================================== */

            const yearMap = {};

            complaintsData.forEach(
              (item) => {

                const year =
                  new Date(
                    item.createdAt
                  ).getFullYear();

                if (
                  !yearMap[year]
                ) {

                  yearMap[
                    year
                  ] = 0;
                }

                yearMap[year]++;
              }
            );

            const yearly =
              Object.keys(
                yearMap
              ).map((key) => ({

                name: key,

                complaints:
                  yearMap[key],
              }));

            setChartData({

              weekly,

              monthly,

              yearly,
            });
          }

        } catch (err) {

          console.log(err);

        } finally {

          setLoading(false);
        }
      };

    loadDashboard();

  }, []);

  /* =====================================================
     PIE CHART DATA
  ===================================================== */

  const pieData = [

    {

      name: "Pending",

      value:
        stats.pending,
    },

    {

      name:
        "In Progress",

      value:
        stats.inProgress,
    },

    {

      name:
        "Escalated",

      value:
        stats.escalated,
    },

    {

      name:
        "Resolved",

      value:
        stats.resolved,
    },
  ];

  /* =====================================================
     COMBINED CHART DATA
  ===================================================== */

  const combinedChartData = [

    ...chartData.weekly.map(
      (item) => ({

        type: "Week",

        name: item.name,

        complaints:
          item.complaints,
      })
    ),

    ...chartData.monthly.map(
      (item) => ({

        type: "Month",

        name: item.name,

        complaints:
          item.complaints,
      })
    ),

    ...chartData.yearly.map(
      (item) => ({

        type: "Year",

        name: item.name,

        complaints:
          item.complaints,
      })
    ),
  ];

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
          Loading Dashboard...
        </h2>

      </div>
    );
  }

  return (

    <div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div style={styles.statsGrid}>

        <div
          style={
            styles.statCard
          }
        >

          <div
            style={
              styles.statTop
            }
          >

            <div>

              <p
                style={
                  styles.statTitle
                }
              >
                Total Complaints
              </p>

              <h1
                style={
                  styles.statValue
                }
              >
                {stats.total}
              </h1>

            </div>

            <div
              style={{

                ...styles.iconBox,

                background:
                  "#dbeafe",

                color:
                  "#2563eb",
              }}
            >

              <Activity size={28} />

            </div>

          </div>

        </div>

        <div
          style={
            styles.statCard
          }
        >

          <div
            style={
              styles.statTop
            }
          >

            <div>

              <p
                style={
                  styles.statTitle
                }
              >
                In Progress
              </p>

              <h1
                style={
                  styles.statValue
                }
              >
                {
                  stats.inProgress
                }
              </h1>

            </div>

            <div
              style={{

                ...styles.iconBox,

                background:
                  "#fef3c7",

                color:
                  "#f59e0b",
              }}
            >

              <Clock size={28} />

            </div>

          </div>

        </div>

        <div
          style={
            styles.statCard
          }
        >

          <div
            style={
              styles.statTop
            }
          >

            <div>

              <p
                style={
                  styles.statTitle
                }
              >
                Resolved
              </p>

              <h1
                style={
                  styles.statValue
                }
              >
                {
                  stats.resolved
                }
              </h1>

            </div>

            <div
              style={{

                ...styles.iconBox,

                background:
                  "#dcfce7",

                color:
                  "#16a34a",
              }}
            >

              <CheckCircle size={28} />

            </div>

          </div>

        </div>

        <div
          style={
            styles.statCard
          }
        >

          <div
            style={
              styles.statTop
            }
          >

            <div>

              <p
                style={
                  styles.statTitle
                }
              >
                Escalated
              </p>

              <h1
                style={
                  styles.statValue
                }
              >
                {
                  stats.escalated
                }
              </h1>

            </div>

            <div
              style={{

                ...styles.iconBox,

                background:
                  "#fee2e2",

                color:
                  "#dc2626",
              }}
            >

              <AlertTriangle size={28} />

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          COMBINED BAR CHART
      ===================================================== */}

      <div style={styles.chartCard}>

        <div
          style={
            styles.chartHeader
          }
        >

          <h3
            style={
              styles.chartTitle
            }
          >
            Complaint Analytics
          </h3>

          <Calendar size={22} />

        </div>

        <ResponsiveContainer
          width="100%"
          height={400}
        >

          <BarChart
            data={
              combinedChartData
            }
          >

            <XAxis
              dataKey="name"
            />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="complaints"
              fill="#2563eb"
              radius={[
                10,
                10,
                0,
                0,
              ]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* =====================================================
          PIE CHART
      ===================================================== */}

      <div
        style={
          styles.pieChartCard
        }
      >

        <div
          style={
            styles.chartHeader
          }
        >

          <h3
            style={
              styles.chartTitle
            }
          >
            Complaint Status Analytics
          </h3>

        </div>

        <ResponsiveContainer
          width="100%"
          height={400}
        >

          <PieChart>

            <Pie

              data={pieData}

              cx="50%"

              cy="50%"

              outerRadius={140}

              dataKey="value"

              label
            >

              {pieData.map(
                (
                  entry,
                  index
                ) => (

                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[
                        index %
                          COLORS.length
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

      {/* =====================================================
          AUDIT LOG TABLE
      ===================================================== */}

      <div style={styles.tableWrapper}>

        <div
          style={
            styles.tableHeader
          }
        >

          <h2
            style={
              styles.tableTitle
            }
          >
            Complaint Audit Logs
          </h2>

          <p
            style={
              styles.tableSubtitle
            }
          >
            Complaint tracking and audit history
          </p>

        </div>

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
                Status
              </th>

              <th style={styles.th}>
                Priority
              </th>

              <th style={styles.th}>
                Assigned Officer
              </th>

              <th style={styles.th}>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {complaints.map(
              (item) => (

                <tr
                  key={item._id}
                  style={styles.tr}
                >

                  <td style={styles.td}>
                    {
                      item.complaintId
                    }
                  </td>

                  <td style={styles.td}>
                    {item.issue}
                  </td>

                  <td style={styles.td}>

                    <span

                      style={{

                        ...styles.statusBadge,

                        background:

                          item.status ===
                          "Resolved"

                            ? "#dcfce7"

                            : item.status ===
                              "Escalated"

                            ? "#fee2e2"

                            : "#dbeafe",

                        color:

                          item.status ===
                          "Resolved"

                            ? "#16a34a"

                            : item.status ===
                              "Escalated"

                            ? "#dc2626"

                            : "#2563eb",
                      }}
                    >

                      {item.status}

                    </span>

                  </td>

                  <td style={styles.td}>
                    {item.priority}
                  </td>

                  <td style={styles.td}>

                    {
                      item
                        .assignedOfficer
                        ?.name ||
                      "Not Assigned"
                    }

                  </td>

                  <td style={styles.td}>

                    <button

                      style={
                        styles.viewButton
                      }

                      onClick={() => {

                        setSelectedComplaint(
                          item
                        );

                        setCurrentImage(
                          0
                        );
                      }}
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

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {selectedComplaint && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div
              style={
                styles.modalHeader
              }
            >

              <h2>
                Complaint Audit Details
              </h2>

              <button

                style={
                  styles.closeButton
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

            {selectedComplaint
              .images?.length >
              0 && (

              <div
                style={
                  styles.imageContainer
                }
              >

                <img

                  src={`${BACKEND}/uploads/${
                    selectedComplaint
                      .images[
                      currentImage
                    ]
                  }`}

                  alt="complaint"

                  style={
                    styles.image
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

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  Complaint ID
                </label>

                <h3>
                  {
                    selectedComplaint.complaintId
                  }
                </h3>

              </div>

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  Issue
                </label>

                <h3>
                  {
                    selectedComplaint.issue
                  }
                </h3>

              </div>

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  Status
                </label>

                <h3>
                  {
                    selectedComplaint.status
                  }
                </h3>

              </div>

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  Priority
                </label>

                <h3>
                  {
                    selectedComplaint.priority
                  }
                </h3>

              </div>

              <div
                style={
                  styles.detailCard
                }
              >

                <label>
                  Assigned Officer
                </label>

                <h3>

                  {
                    selectedComplaint
                      .assignedOfficer
                      ?.name ||
                    "Not Assigned"
                  }

                </h3>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div
              style={
                styles.descriptionCard
              }
            >

              <label>
                Complaint Description
              </label>

              <p>
                {
                  selectedComplaint.description
                }
              </p>

            </div>

            {/* GEO TAG */}

            <div
              style={
                styles.descriptionCard
              }
            >

              <label>
                Geo Tag Location
              </label>

              <p>
                📍
                {" "}
                {
                  selectedComplaint.address
                }
              </p>

            </div>

            {/* TIMELINE */}

            <div
              style={
                styles.timelineCard
              }
            >

              <h3>
                Complaint Timeline
              </h3>

              <div
                style={
                  styles.timelineItem
                }
              >
                Complaint Submitted
              </div>

              <div
                style={
                  styles.timelineItem
                }
              >
                Complaint Assigned
              </div>

              <div
                style={
                  styles.timelineItem
                }
              >
                In Progress
              </div>

              <div
                style={
                  styles.timelineItem
                }
              >
                {
                  selectedComplaint.status
                }
              </div>

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
  },

  statsGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",

    gap: 24,

    marginBottom: 35,
  },

  statCard: {

    background: "#fff",

    padding: 28,

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",

    border:
      "1px solid #e2e8f0",
  },

  statTop: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",
  },

  statTitle: {

    margin: 0,

    color: "#64748b",

    fontSize: 15,
  },

  statValue: {

    margin: 0,

    marginTop: 10,

    fontSize: 38,

    fontWeight: 700,

    color: "#0f172a",
  },

  iconBox: {

    width: 65,

    height: 65,

    borderRadius: 20,

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",
  },

  chartCard: {

    background: "#fff",

    padding: 28,

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",

    marginBottom: 35,
  },

  pieChartCard: {

    background: "#fff",

    padding: 30,

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",

    marginBottom: 35,
  },

  chartHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 25,
  },

  chartTitle: {

    margin: 0,

    fontSize: 22,

    fontWeight: 700,
  },

  tableWrapper: {

    background: "#fff",

    padding: 30,

    borderRadius: 24,

    marginTop: 35,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",
  },

  tableHeader: {

    marginBottom: 24,
  },

  tableTitle: {

    margin: 0,

    fontSize: 28,

    fontWeight: 700,
  },

  tableSubtitle: {

    marginTop: 8,

    color: "#64748b",
  },

  table: {

    width: "100%",

    borderCollapse:
      "collapse",
  },

  th: {

    background: "#f8fafc",

    padding: 16,

    textAlign: "left",
  },

  tr: {

    borderBottom:
      "1px solid #e2e8f0",
  },

  td: {

    padding: 16,
  },

  statusBadge: {

    padding:
      "8px 14px",

    borderRadius: 30,

    fontSize: 13,

    fontWeight: 700,
  },

  viewButton: {

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

  modal: {

    width: "90%",

    maxWidth: 1000,

    background: "#fff",

    borderRadius: 28,

    padding: 30,

    maxHeight: "90vh",

    overflowY: "auto",
  },

  modalHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 25,
  },

  closeButton: {

    width: 40,

    height: 40,

    borderRadius: "50%",

    border: "none",

    background:
      "#fee2e2",

    color: "#dc2626",

    cursor: "pointer",
  },

  imageContainer: {

    width: "100%",

    height: 350,

    marginBottom: 25,
  },

  image: {

    width: "100%",

    height: "100%",

    objectFit: "cover",

    borderRadius: 20,
  },

  detailsGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",

    gap: 20,
  },

  detailCard: {

    background: "#f8fafc",

    padding: 20,

    borderRadius: 18,
  },

  descriptionCard: {

    background: "#f8fafc",

    padding: 24,

    borderRadius: 18,

    marginTop: 24,
  },

  timelineCard: {

    marginTop: 25,

    background: "#f8fafc",

    padding: 24,

    borderRadius: 18,
  },

  timelineItem: {

    padding: 14,

    background: "#fff",

    borderRadius: 12,

    marginTop: 12,
  },
};

export default AuditLogsPage;