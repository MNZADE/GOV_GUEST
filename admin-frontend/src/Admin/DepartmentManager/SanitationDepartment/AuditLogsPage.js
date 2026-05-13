import React, {
  useEffect,
  useState,
} from "react";

import {
  Eye,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  User,
  Loader2,
  XCircle,
  UserCog,
  ImageIcon,
  Building2,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";



const chartColors = [

  "#2563eb",

  "#16a34a",

  "#f59e0b",

  "#dc2626",

  "#7c3aed",

  "#0f172a",
];

const AuditLogsPage = () => {

  /* =====================================================
     STATES
  ===================================================== */

  const [
    complaintsLogs,
    setComplaintsLogs,
  ] = useState([]);

  const [
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    selectedLog,
    setSelectedLog,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    officerFilter,
    setOfficerFilter,
  ] = useState("All");

  /* =====================================================
     USER INFO
  ===================================================== */

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

  const userRole =
    user?.role
      ?.toLowerCase()
      ?.trim();

  const department =
    user?.department
      ?.toLowerCase()
      ?.replace(
        " department",
        ""
      )
      ?.replace(
        " supply department",
        ""
      )
      ?.trim();

  const isSystemManager =

    userRole ===
      "system manager" ||

    userRole ===
      "admin";

  /* =====================================================
     FETCH DATA
  ===================================================== */

  useEffect(() => {

    fetchComplaints();

    fetchAnalytics();

  }, []);

  /* =====================================================
     FETCH COMPLAINTS
  ===================================================== */

  const fetchComplaints =
    async () => {

      try {

        setLoading(true);

        const endpoint =

          isSystemManager

            ? "http://localhost:5000/api/complaints/system/all"

            : `http://localhost:5000/api/complaints/manager/${department}`;

        const response =
          await fetch(
            endpoint,
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

          const formatted =
            data.complaints.map(
              (c) => ({

                id:
                  c.complaintId,

                officer:
                  c.assignedOfficerName ||
                  "Not Assigned",

                department:
                  c.department,

                status:
                  c.status,

                priority:
                  c.priority ||
                  "Medium",

                issue:
                  c.issue,

                description:
                  c.description,

                createdDate:
                  c.createdAt,

                updatedDate:
                  c.updatedAt,

                history:
                  c.history || [],

                images:

                  c.images &&
                  c.images.length > 0

                    ? c.images.map(
                        (img) =>

                          img.startsWith(
                            "http"
                          )

                            ? img

                            : `http://localhost:5000/uploads/${img}`
                      )

                    : [
                        "https://via.placeholder.com/700x350",
                      ],
              })
            );

          setComplaintsLogs(
            formatted
          );
        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     FETCH ANALYTICS
  ===================================================== */

  const fetchAnalytics =
    async () => {

      try {

        const response =
          await fetch(

            "http://localhost:5000/api/complaints/reports/analytics",

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

          setAnalytics(data);
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =====================================================
     FILTER
  ===================================================== */

  const officers = [

    "All",

    ...new Set(
      complaintsLogs.map(
        (c) => c.officer
      )
    ),
  ];

  const filteredLogs =
    complaintsLogs.filter(
      (log) => {

        const matchSearch =

          log.id
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          log.issue
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            );

        const matchOfficer =

          officerFilter ===
            "All" ||

          log.officer ===
            officerFilter;

        return (
          matchSearch &&
          matchOfficer
        );
      }
    );

  /* =====================================================
     REPORT DATA
  ===================================================== */

  const monthlyData =
    analytics?.monthlyData

      ? Object.entries(
          analytics.monthlyData
        ).map(
          ([month, complaints]) => ({

            month,

            complaints,
          })
        )

      : [];

  const weeklyData =
    analytics?.weeklyData

      ? Object.entries(
          analytics.weeklyData
        ).map(
          ([day, complaints]) => ({

            day,

            complaints,
          })
        )

      : [];

  const yearlyData =
    analytics?.yearlyData

      ? Object.entries(
          analytics.yearlyData
        ).map(
          ([year, complaints]) => ({

            year,

            complaints,
          })
        )

      : [];

  const statusReport =
    analytics?.statusData

      ? Object.entries(
          analytics.statusData
        ).map(
          ([name, value]) => ({

            name,

            value,
          })
        )

      : [];

  const departmentReport =
    analytics?.departmentData

      ? Object.entries(
          analytics.departmentData
        ).map(
          ([name, value]) => ({

            name,

            value,
          })
        )

      : [];

  /* =====================================================
     PROGRESS
  ===================================================== */

  const getProgressPercentage =
    (status) => {

      switch (status) {

        case "Pending":
          return 20;

        case "In Progress":
          return 50;

        case "Escalated":
          return 75;

        case "Resolved":
          return 100;

        case "Rejected":
          return 100;

        default:
          return 10;
      }
    };

  const getProgressColor =
    (status) => {

      switch (status) {

        case "Pending":
          return "#f59e0b";

        case "In Progress":
          return "#2563eb";

        case "Escalated":
          return "#dc2626";

        case "Resolved":
          return "#16a34a";

        case "Rejected":
          return "#111827";

        default:
          return "#2563eb";
      }
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div style={{
        padding:50,
        textAlign:"center",
        fontSize:28,
        fontWeight:700,
      }}>
        Loading Dashboard...
      </div>
    );
  }

  return (

    <div style={styles.pageContainer}>

      {/* =====================================================
         HEADER
      ===================================================== */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>

            {isSystemManager

              ? "System Analytics Dashboard"

              : `${department?.toUpperCase()} Department Dashboard`
            }

          </h1>

          <p style={styles.subTitle}>
            Smart Governance Complaint Management
          </p>

        </div>

      </div>

      {/* =====================================================
         SUMMARY CARDS
      ===================================================== */}

      {/* =========================================================
   📊 ADVANCED SUMMARY DASHBOARD
========================================================= */}

<div style={styles.summaryGrid}>

  {/* =======================================================
      TOTAL COMPLAINTS
  ======================================================= */}

  <div
    style={{
      ...styles.summaryCard,
      borderLeft: "6px solid #ef4444",
    }}
  >
    <AlertTriangle
      size={34}
      color="#ef4444"
    />

    <div>
      <h2>
        {analytics?.total || 0}
      </h2>

      <p>Total Complaints</p>

      <small
        style={styles.cardSubText}
      >
        All complaints received
      </small>
    </div>
  </div>

  {/* =======================================================
      RESOLVED
  ======================================================= */}

  <div
    style={{
      ...styles.summaryCard,
      borderLeft: "6px solid #22c55e",
    }}
  >
    <CheckCircle2
      size={34}
      color="#22c55e"
    />

    <div>
      <h2>
        {analytics?.statusData
          ?.Resolved || 0}
      </h2>

      <p>Resolved</p>

      <small
        style={styles.cardSubText}
      >
        Successfully completed
      </small>
    </div>
  </div>

  {/* =======================================================
      PENDING
  ======================================================= */}

  <div
    style={{
      ...styles.summaryCard,
      borderLeft: "6px solid #f59e0b",
    }}
  >
    <Clock3
      size={34}
      color="#f59e0b"
    />

    <div>
      <h2>
        {analytics?.statusData
          ?.Pending || 0}
      </h2>

      <p>Pending</p>

      <small
        style={styles.cardSubText}
      >
        Waiting for action
      </small>
    </div>
  </div>

  {/* =======================================================
      IN PROGRESS
  ======================================================= */}

  <div
    style={{
      ...styles.summaryCard,
      borderLeft: "6px solid #3b82f6",
    }}
  >
    <Loader2
      size={34}
      color="#3b82f6"
    />

    <div>
      <h2>
        {analytics?.statusData?.[
          "In Progress"
        ] || 0}
      </h2>

      <p>In Progress</p>

      <small
        style={styles.cardSubText}
      >
        Officer currently working
      </small>
    </div>
  </div>

  {/* =======================================================
      REJECTED
  ======================================================= */}

  <div
    style={{
      ...styles.summaryCard,
      borderLeft: "6px solid #dc2626",
    }}
  >
    <XCircle
      size={34}
      color="#dc2626"
    />

    <div>
      <h2>
        {analytics?.statusData
          ?.Rejected || 0}
      </h2>

      <p>Rejected</p>

      <small
        style={styles.cardSubText}
      >
        Complaints rejected
      </small>
    </div>
  </div>

  {/* =======================================================
      OFFICER ASSIGNED
  ======================================================= */}

  <div
    style={{
      ...styles.summaryCard,
      borderLeft: "6px solid #8b5cf6",
    }}
  >
    <UserCog
      size={34}
      color="#8b5cf6"
    />

    <div>
      <h2>
        {
          complaintsLogs.filter(
            (c) =>
              c.assignedOfficerName
          ).length
        }
      </h2>

      <p>Officer Assigned</p>

      <small
        style={styles.cardSubText}
      >
        Assigned to field officers
      </small>
    </div>
  </div>

  {/* =======================================================
      UPDATED PHOTOS
  ======================================================= */}

  <div
    style={{
      ...styles.summaryCard,
      borderLeft: "6px solid #0ea5e9",
    }}
  >
    <ImageIcon
      size={34}
      color="#0ea5e9"
    />

    <div>
      <h2>
        {
          complaintsLogs.filter(
            (c) =>
              c.officerUpdatedImage
          ).length
        }
      </h2>

      <p>Updated Photos</p>

      <small
        style={styles.cardSubText}
      >
        Officer uploaded proof
      </small>
    </div>
  </div>

  {/* =======================================================
      TOTAL DEPARTMENT RECORDS
  ======================================================= */}

  <div
    style={{
      ...styles.summaryCard,
      borderLeft: "6px solid #14b8a6",
    }}
  >
    <Building2
      size={34}
      color="#14b8a6"
    />

    <div>
      <h2>
        {complaintsLogs.length}
      </h2>

      <p>Department Records</p>

      <small
        style={styles.cardSubText}
      >
        Total department activities
      </small>
    </div>
  </div>

</div>

      {/* =====================================================
         CHARTS
      ===================================================== */}

      <div style={styles.chartGrid}>

        <div style={styles.chartCard}>

          <h3 style={styles.chartTitle}>
            Monthly Report
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={monthlyData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
              />

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

          <h3 style={styles.chartTitle}>
            Complaint Status
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={statusReport}
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
                          index %
                          chartColors.length
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

        <div style={styles.chartCard}>

          <h3 style={styles.chartTitle}>
            Weekly Report
          </h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={weeklyData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="day"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="complaints"
                fill="#16a34a"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* ONLY SYSTEM MANAGER */}

        {isSystemManager && (

          <div style={styles.chartCard}>

            <h3 style={styles.chartTitle}>
              Department Distribution
            </h3>

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <PieChart>

                <Pie
                  data={
                    departmentReport
                  }
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >

                  {departmentReport.map(
                    (
                      entry,
                      index
                    ) => (

                      <Cell
                        key={index}
                        fill={
                          chartColors[
                            index %
                            chartColors.length
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
        )}

      </div>

      {/* =====================================================
         FILTERS
      ===================================================== */}

      <div style={styles.topBar}>

        <div style={styles.searchBox}>

          <Search size={18}/>

          <input
            type="text"

            placeholder="Search Complaint"

            value={searchTerm}

            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }

            style={
              styles.searchInput
            }
          />

        </div>

        <select
          value={officerFilter}

          onChange={(e) =>
            setOfficerFilter(
              e.target.value
            )
          }

          style={
            styles.dropdown
          }
        >

          {officers.map(
            (off, i) => (

              <option key={i}>
                {off}
              </option>
            )
          )}

        </select>

      </div>

      {/* =====================================================
         TABLE
      ===================================================== */}

      <div style={styles.tableContainer}>

        <table style={styles.table}>

          <thead>

            <tr style={styles.headerRow}>

              <th style={styles.th}>
                Complaint ID
              </th>

              {isSystemManager && (

                <th style={styles.th}>
                  Department
                </th>
              )}

              <th style={styles.th}>
                Officer
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
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredLogs.map(
              (log, index) => (

                <tr
                  key={index}
                  style={
                    styles.rowStyle
                  }
                >

                  <td style={styles.tdStrong}>
                    {log.id}
                  </td>

                  {isSystemManager && (

                    <td style={styles.td}>
                      {log.department}
                    </td>
                  )}

                  <td style={styles.td}>
                    {log.officer}
                  </td>

                  <td style={styles.td}>
                    {log.issue}
                  </td>

                  <td style={styles.td}>
                    {log.status}
                  </td>

                  <td style={styles.td}>
                    {log.priority}
                  </td>

                  <td style={styles.td}>

                    <button
                      style={
                        styles.viewButton
                      }

                      onClick={() =>
                        setSelectedLog(log)
                      }
                    >

                      <Eye size={15}/>

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
   MODAL
===================================================== */}

{selectedLog && (

  <div
    style={styles.overlay}
    onClick={() =>
      setSelectedLog(null)
    }
  >

    <div
      style={styles.modal}
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={styles.modalHeader}>

        <div>

          <h2 style={styles.modalTitle}>
            {selectedLog.id}
          </h2>

          <p style={styles.modalSubTitle}>
            Complaint Detailed Report
          </p>

        </div>

        <button
          style={styles.closeButton}
          onClick={() =>
            setSelectedLog(null)
          }
        >
          ✕
        </button>

      </div>

      {/* =================================================
          SUMMARY DASHBOARD
      ================================================= */}

      <div style={styles.summaryGrid}>

        {/* STATUS */}

        <div
          style={{
            ...styles.summaryCard,
            borderLeft:
              "6px solid #2563eb",
          }}
        >
          <Loader2
            size={30}
            color="#2563eb"
          />

          <div>

            <h2>
              {selectedLog.status}
            </h2>

            <p>Status</p>

            <small
              style={
                styles.cardSubText
              }
            >
              Current complaint status
            </small>

          </div>

        </div>

        {/* PRIORITY */}

        <div
          style={{
            ...styles.summaryCard,
            borderLeft:
              "6px solid #dc2626",
          }}
        >
          <AlertTriangle
            size={30}
            color="#dc2626"
          />

          <div>

            <h2>
              {
                selectedLog.priority
              }
            </h2>

            <p>Priority</p>

            <small
              style={
                styles.cardSubText
              }
            >
              Complaint priority
            </small>

          </div>

        </div>

        {/* OFFICER */}

        <div
          style={{
            ...styles.summaryCard,
            borderLeft:
              "6px solid #7c3aed",
          }}
        >
          <UserCog
            size={30}
            color="#7c3aed"
          />

          <div>

            <h2>
              {selectedLog.officer ||
                "Not Assigned"}
            </h2>

            <p>Assigned Officer</p>

            <small
              style={
                styles.cardSubText
              }
            >
              Field officer handling
            </small>

          </div>

        </div>

        {/* DEPARTMENT */}

        <div
          style={{
            ...styles.summaryCard,
            borderLeft:
              "6px solid #16a34a",
          }}
        >
          <Building2
            size={30}
            color="#16a34a"
          />

          <div>

            <h2>
              {
                selectedLog.department
              }
            </h2>

            <p>Department</p>

            <small
              style={
                styles.cardSubText
              }
            >
              Complaint department
            </small>

          </div>

        </div>

      </div>

      {/* =================================================
          MAIN DETAILS
      ================================================= */}

      <div style={styles.detailsGrid}>

        <div style={styles.detailCard}>
          <h3>
            Complaint Issue
          </h3>

          <p>
            {selectedLog.issue}
          </p>
        </div>

        <div style={styles.detailCard}>
          <h3>
            Description
          </h3>

          <p>
            {
              selectedLog.description
            }
          </p>
        </div>

        <div style={styles.detailCard}>
          <h3>
            Created Date
          </h3>

          <p>
            {new Date(
              selectedLog.createdDate
            ).toLocaleString()}
          </p>
        </div>

        <div style={styles.detailCard}>
          <h3>
            Last Updated
          </h3>

          <p>
            {selectedLog.updatedDate
              ? new Date(
                  selectedLog.updatedDate
                ).toLocaleString()
              : "Not Updated"}
          </p>
        </div>

      </div>

      {/* =================================================
          COMPLAINT IMAGES
      ================================================= */}

      <div style={styles.imageSection}>

        <h3 style={styles.sectionTitle}>
          Complaint Images
        </h3>

        <div style={styles.imageGrid}>

          {selectedLog.images?.map(
            (img, index) => (

              <img
                key={index}
                src={img}
                alt="complaint"
                style={
                  styles.previewImage
                }
              />
            )
          )}

        </div>

      </div>

      {/* =================================================
          PROGRESS BAR
      ================================================= */}

      <div style={styles.progressSection}>

        <div style={styles.progressHeader}>

          <h3>
            Complaint Progress
          </h3>

          <span
            style={{
              color:
                getProgressColor(
                  selectedLog.status
                ),
              fontWeight:700,
            }}
          >
            {
              getProgressPercentage(
                selectedLog.status
              )
            }%
          </span>

        </div>

        <div style={styles.progressBarBg}>

          <div
            style={{
              ...styles.progressBarFill,

              width:
                `${getProgressPercentage(
                  selectedLog.status
                )}%`,

              background:
                getProgressColor(
                  selectedLog.status
                ),
            }}
          />

        </div>

      </div>

      {/* =================================================
          TIMELINE
      ================================================= */}

      <div style={styles.timelineContainer}>

        <h3 style={styles.sectionTitle}>
          Complaint Timeline
        </h3>

        <div style={styles.timeline}>

          {selectedLog.history &&
            selectedLog.history.map(
              (h, index) => (

                <div
                  key={index}
                  style={
                    styles.timelineItem
                  }
                >

                  <div
                    style={
                      styles.timelineDot
                    }
                  />

                  <div
                    style={
                      styles.timelineCard
                    }
                  >

                    <h4
                      style={{
                        margin:0,
                        color:"#2563eb",
                      }}
                    >
                      {h.status}
                    </h4>

                    <p>
                      {h.message}
                    </p>

                    <small>
                      {new Date(
                        h.updatedAt
                      ).toLocaleString()}
                    </small>

                  </div>

                </div>
              )
            )}

        </div>

      </div>

    </div>

  </div>

)}

    </div>
  );
};



   const styles = {

  pageContainer:{
    padding:40,
    background:"#f1f5f9",
    minHeight:"100vh",
  },

  header:{
    marginBottom:30,
  },

  title:{
    fontSize:34,
    fontWeight:800,
    color:"#0f172a",
  },

  subTitle:{
    color:"#64748b",
    marginTop:8,
  },

  /* =====================================================
     SUMMARY DASHBOARD
  ===================================================== */

  summaryGrid:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap:20,
    marginBottom:30,
  },

  summaryCard:{
    background:"#fff",
    padding:25,
    borderRadius:24,
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.06)",
    textAlign:"center",

    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center",
    gap:10,
  },

  cardSubText:{
    color:"#64748b",
    fontSize:12,
    marginTop:5,
  },

  /* =====================================================
     CHARTS
  ===================================================== */

  chartGrid:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(450px,1fr))",
    gap:25,
    marginBottom:35,
  },

  chartCard:{
    background:"#fff",
    padding:24,
    borderRadius:24,
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.05)",
  },

  chartTitle:{
    marginBottom:20,
    fontSize:20,
    fontWeight:700,
  },

  /* =====================================================
     FILTER BAR
  ===================================================== */

  topBar:{
    display:"flex",
    gap:20,
    marginBottom:30,
    flexWrap:"wrap",
  },

  searchBox:{
    display:"flex",
    alignItems:"center",
    gap:10,
    background:"#fff",
    padding:"12px 18px",
    borderRadius:30,
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.05)",
  },

  searchInput:{
    border:"none",
    outline:"none",
    width:250,
    fontSize:15,
    background:"transparent",
  },

  dropdown:{
    padding:"12px 18px",
    borderRadius:20,
    border:"none",
    background:"#fff",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.05)",
  },

  /* =====================================================
     TABLE
  ===================================================== */

  tableContainer:{
    background:"#fff",
    padding:25,
    borderRadius:24,
    overflowX:"auto",
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.05)",
  },

  table:{
    width:"100%",
    borderCollapse:"collapse",
  },

  headerRow:{
    background:"#f8fafc",
  },

  th:{
    padding:16,
    textAlign:"left",
    fontWeight:700,
    color:"#0f172a",
  },

  td:{
    padding:16,
    color:"#334155",
  },

  tdStrong:{
    padding:16,
    fontWeight:700,
    color:"#0f172a",
  },

  rowStyle:{
    borderBottom:"1px solid #e2e8f0",
    transition:"0.3s",
  },

  viewButton:{
    background:"#2563eb",
    color:"#fff",
    padding:"10px 18px",
    borderRadius:30,
    border:"none",
    cursor:"pointer",
    display:"flex",
    alignItems:"center",
    gap:8,
    fontWeight:600,
  },

  /* =====================================================
     MODAL
  ===================================================== */

  overlay:{
    position:"fixed",
    inset:0,
    background:"rgba(0,0,0,0.6)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    zIndex:999,
    padding:20,
  },

  modal:{
    background:"#fff",
    width:"95%",
    maxWidth:1100,
    maxHeight:"95vh",
    overflowY:"auto",
    borderRadius:30,
    padding:30,
    boxShadow:
      "0 8px 30px rgba(0,0,0,0.15)",
  },

  modalHeader:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:25,
  },

  modalTitle:{
    fontSize:28,
    fontWeight:800,
    color:"#0f172a",
  },

  modalSubTitle:{
    color:"#64748b",
    marginTop:5,
  },

  closeButton:{
    background:"#dc2626",
    color:"#fff",
    border:"none",
    width:42,
    height:42,
    borderRadius:"50%",
    cursor:"pointer",
    fontSize:18,
    fontWeight:700,
  },

  /* =====================================================
     DETAILS GRID
  ===================================================== */

  detailsGrid:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap:20,
    marginTop:25,
  },

  detailCard:{
    background:"#f8fafc",
    padding:20,
    borderRadius:18,
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

  /* =====================================================
     IMAGE SECTION
  ===================================================== */

  imageSection:{
    marginTop:30,
  },

  sectionTitle:{
    fontSize:22,
    fontWeight:700,
    marginBottom:20,
    color:"#0f172a",
  },

  imageGrid:{
    display:"grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap:18,
  },

  previewImage:{
    width:"100%",
    height:220,
    objectFit:"cover",
    borderRadius:20,
    transition:"0.3s",
    cursor:"pointer",
  },

  image:{
    width:"100%",
    height:350,
    objectFit:"cover",
    borderRadius:20,
    marginBottom:25,
  },

  /* =====================================================
     PROGRESS BAR
  ===================================================== */

  progressSection:{
    marginTop:30,
    marginBottom:30,
  },

  progressHeader:{
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:12,
  },

  progressBarBg:{
    width:"100%",
    height:18,
    background:"#e5e7eb",
    borderRadius:30,
    overflow:"hidden",
  },

  progressBarFill:{
    height:"100%",
    borderRadius:30,
    transition:"0.5s",
  },

  /* =====================================================
     TIMELINE
  ===================================================== */

  timelineContainer:{
    marginTop:35,
  },

  timeline:{
    marginTop:20,
    borderLeft:"4px solid #2563eb",
    paddingLeft:20,
  },

  timelineItem:{
    marginBottom:24,
    position:"relative",
  },

  timelineDot:{
    width:14,
    height:14,
    borderRadius:"50%",
    background:"#2563eb",
    position:"absolute",
    left:-28,
    top:6,
  },

  timelineCard:{
    background:"#f8fafc",
    padding:18,
    borderRadius:18,
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.04)",
  },

};

export default AuditLogsPage;