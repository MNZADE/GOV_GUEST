import {
  useState,
  useEffect,
} from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  ShieldCheck,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  FileBarChart2,
  Building2,
  Download,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   ANALYTICS REPORT PAGE
========================================================= */

const AnalyticsReportPage = () => {

  const [viewMode, setViewMode] =
    useState("monthly");

  const [loading, setLoading] =
    useState(true);

  /* ================= ANALYTICS ================= */

  const [currentMonth, setCurrentMonth] =
    useState({
      total: 0,
      solved: 0,
      pending: 0,
      urgent: 0,
    });

  const [previousMonth, setPreviousMonth] =
    useState({
      total: 0,
      solved: 0,
      pending: 0,
      urgent: 0,
    });

  const [weeklyData, setWeeklyData] =
    useState({
      total: 0,
      solved: 0,
      pending: 0,
      urgent: 0,
    });

  const [
    departmentData,
    setDepartmentData,
  ] = useState([]);

  const [
    priorityData,
    setPriorityData,
  ] = useState([]);

  /* =========================================================
     FETCH ANALYTICS
  ========================================================= */

  useEffect(() => {

    fetchAnalytics();

  }, []);

  const fetchAnalytics =
    async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await fetch(
            "http://localhost:5000/api/analytics",
            {

              method: "GET",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        console.log(
          "📊 Analytics:",
          data
        );

        if (
          response.ok &&
          data.success
        ) {

          setCurrentMonth({

            total:
              data.currentMonth
                ?.total || 0,

            solved:
              data.currentMonth
                ?.solved || 0,

            pending:
              data.currentMonth
                ?.pending || 0,

            urgent:
              data.currentMonth
                ?.urgent || 0,
          });

          setPreviousMonth({

            total:
              data.previousMonth
                ?.total || 0,

            solved:
              data.previousMonth
                ?.solved || 0,

            pending:
              data.previousMonth
                ?.pending || 0,

            urgent:
              data.previousMonth
                ?.urgent || 0,
          });

          setWeeklyData({

            total:
              data.weeklyData
                ?.total || 0,

            solved:
              data.weeklyData
                ?.solved || 0,

            pending:
              data.weeklyData
                ?.pending || 0,

            urgent:
              data.weeklyData
                ?.urgent || 0,
          });

          setDepartmentData(

            Array.isArray(
              data.departmentData
            )

              ? data.departmentData

              : []
          );

          setPriorityData(

            Array.isArray(
              data.priorityData
            )

              ? data.priorityData

              : []
          );
        }

      } catch (err) {

        console.log(
          "Analytics Error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    viewMode === "monthly"
      ? currentMonth
      : weeklyData;

  /* =========================================================
     MOM %
  ========================================================= */

  const mom = (
    current,
    prev
  ) => {

    if (!prev || prev === 0)
      return 0;

    return (
      (
        ((current - prev) / prev) *
        100
      ).toFixed(1)
    );
  };

  /* =========================================================
     EXPORT GOVERNMENT PDF
  ========================================================= */

  const exportPDF = () => {

    const doc = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const width =
      doc.internal.pageSize.width;

    const height =
      doc.internal.pageSize.height;

    /* ================= HEADER ================= */

    doc.setFillColor(
      5,
      24,
      53
    );

    doc.rect(
      0,
      0,
      width,
      40,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(22);

    doc.text(
      "Government Governance Analytics Report",
      width / 2,
      16,
      {
        align: "center",
      }
    );

    doc.setFontSize(12);

    doc.text(
      "Municipal Corporation Kolhapur Division",
      width / 2,
      26,
      {
        align: "center",
      }
    );

    doc.setFontSize(10);

    doc.text(
      `Generated On: ${new Date().toLocaleString()}`,
      width / 2,
      34,
      {
        align: "center",
      }
    );

    /* ================= KPI ================= */

    doc.setTextColor(
      15,
      23,
      42
    );

    doc.setFontSize(15);

    doc.text(
      "Collector / Commissioner Review Dashboard",
      14,
      52
    );

    const cards = [

      {
        title:
          "Urgent Complaints",

        value:
          stats.urgent,

        color:
          [220, 38, 38],
      },

      {
        title:
          "Pending Complaints",

        value:
          stats.pending,

        color:
          [217, 119, 6],
      },

      {
        title:
          "Resolution Rate",

        value:
          `${Math.round(
            (stats.solved /
              stats.total) *
              100 || 0
          )}%`,

        color:
          [22, 163, 74],
      },
    ];

    let x = 14;

    cards.forEach(
      (card) => {

        doc.setFillColor(
          ...card.color
        );

        doc.roundedRect(
          x,
          60,
          58,
          28,
          4,
          4,
          "F"
        );

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.setFontSize(10);

        doc.text(
          card.title,
          x + 4,
          69
        );

        doc.setFontSize(20);

        doc.text(
          String(
            card.value
          ),
          x + 4,
          81
        );

        x += 64;
      }
    );

    /* ================= SUMMARY TABLE ================= */

    doc.setTextColor(
      15,
      23,
      42
    );

    doc.setFontSize(15);

    doc.text(
      "Complaint Summary Analytics",
      14,
      104
    );

    autoTable(doc, {

      startY: 110,

      head: [[
        "Analytics Category",
        "Count",
      ]],

      body: [

        [
          "Total Complaints",
          stats.total,
        ],

        [
          "Resolved Complaints",
          stats.solved,
        ],

        [
          "Pending Complaints",
          stats.pending,
        ],

        [
          "Urgent Complaints",
          stats.urgent,
        ],
      ],

      styles: {

        fontSize: 11,

        cellPadding: 5,
      },

      headStyles: {

        fillColor: [
          5,
          24,
          53,
        ],

        textColor: 255,
      },
    });

    /* ================= DEPARTMENT TABLE ================= */

    doc.setFontSize(15);

    doc.text(
      "Department Analytics Overview",
      14,
      158
    );

    autoTable(doc, {

      startY: 164,

      head: [[

        "Department",

        "Total",

        "Resolved",

        "Pending",

        "Urgent",

        "Resolution %",
      ]],

      body:
        departmentData.map(
          (
            dept
          ) => [

            dept.name,

            dept.total,

            dept.resolved,

            dept.pending,

            dept.urgent,

            `${dept.resolutionRate}%`,
          ]
        ),

      styles: {

        fontSize: 10,

        cellPadding: 4,
      },

      headStyles: {

        fillColor: [
          30,
          41,
          59,
        ],

        textColor: 255,
      },
    });

    /* ================= PRIORITY TABLE ================= */

    doc.setFontSize(15);

    doc.text(
      "Complaint Priority Distribution",
      14,
      245
    );

    autoTable(doc, {

      startY: 250,

      head: [[
        "Priority",
        "Complaints",
        "Percentage",
      ]],

      body:
        priorityData.map(
          (p) => [

            p.label,

            p.count,

            `${p.value}%`,
          ]
        ),

      styles: {

        fontSize: 10,

        cellPadding: 4,
      },

      headStyles: {

        fillColor: [
          5,
          24,
          53,
        ],

        textColor: 255,
      },
    });

    /* ================= FOOTER ================= */

    doc.setFillColor(
      5,
      24,
      53
    );

    doc.rect(
      0,
      height - 16,
      width,
      16,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(9);

    doc.text(
      "Government Confidential • Municipal Governance Monitoring System",
      width / 2,
      height - 6,
      {
        align: "center",
      }
    );

    doc.save(
      "Government_Analytics_Report.pdf"
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div style={styles.loading}>
        Loading Analytics...
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (

    <div style={styles.container}>

      {/* ================= HEADER ================= */}

      <div style={styles.topBanner}>

        <div style={styles.bannerLeft}>

          <div style={styles.logoCircle}>

            <ShieldCheck size={38} />

          </div>

          <div>

            <h1 style={styles.pageTitle}>
              Governance Analytics Dashboard
            </h1>

            <p style={styles.subtitle}>
              Municipal Corporation Kolhapur Division
            </p>

          </div>

        </div>

        <div style={styles.actions}>

          <button
            style={toggleStyle(
              viewMode === "weekly"
            )}

            onClick={() =>
              setViewMode("weekly")
            }
          >
            Weekly
          </button>

          <button
            style={toggleStyle(
              viewMode === "monthly"
            )}

            onClick={() =>
              setViewMode("monthly")
            }
          >
            Monthly
          </button>

          <button
            style={styles.pdfBtn}

            onClick={exportPDF}
          >

            <Download size={18} />

            Export Govt PDF

          </button>

        </div>

      </div>

      {/* ================= REVIEW PANEL ================= */}

      <div style={styles.collectorPanel}>

        <div style={styles.collectorHeader}>

          <TrendingUp size={22} />

          <h3>
            Collector / Commissioner Review Panel
          </h3>

        </div>

        <CollectorRow
          label="Urgent Complaints"

          value={stats.urgent}

          mom={mom(
            currentMonth.urgent,
            previousMonth.urgent
          )}
        />

        <CollectorRow
          label="Pending Complaints"

          value={stats.pending}

          mom={mom(
            currentMonth.pending,
            previousMonth.pending
          )}
        />

        <CollectorRow
          label="Resolution Rate"

          value={`${Math.round(
            (stats.solved /
              stats.total) *
              100 || 0
          )}%`}

          mom={mom(
            (currentMonth.solved /
              currentMonth.total) *
              100 || 0,

            (previousMonth.solved /
              previousMonth.total) *
              100 || 0
          )}
        />

      </div>

      {/* ================= KPI ================= */}

      <div style={styles.cardGrid}>

        <StatCard
          title="Total Complaints"
          value={stats.total}
          color="#2563eb"
          icon={<FileBarChart2 />}
        />

        <StatCard
          title="Resolved"
          value={stats.solved}
          color="#16a34a"
          icon={<CheckCircle2 />}
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          color="#f59e0b"
          icon={<Clock3 />}
        />

        <StatCard
          title="Urgent"
          value={stats.urgent}
          color="#dc2626"
          icon={<AlertTriangle />}
        />

      </div>

      {/* ================= DEPARTMENT ================= */}

      <section style={styles.section}>

        <div style={styles.sectionHeader}>

          <Building2 size={24} />

          <h3>
            Department Analytics Overview
          </h3>

        </div>

        <div style={styles.departmentGrid}>

          {departmentData.map(
            (d, i) => (

              <div
                key={i}
                style={styles.departmentCard}
              >

                <div style={styles.departmentTop}>

                  <h4>
                    {d.name}
                  </h4>

                  <span style={styles.departmentBadge}>
                    {d.total}
                  </span>

                </div>

                <div style={styles.progressContainer}>

                  <div
                    style={{
                      ...styles.progressBar,

                      width:
                        `${d.resolutionRate}%`,
                    }}
                  />

                </div>

                <div style={styles.departmentStats}>

                  <span>
                    ✅ {d.resolved} Resolved
                  </span>

                  <span>
                    ⏳ {d.pending} Pending
                  </span>

                </div>

                <div style={styles.departmentStats}>

                  <span>
                    🚨 {d.urgent} Urgent
                  </span>

                  <span>
                    📈 {d.resolutionRate}%
                  </span>

                </div>

              </div>
            )
          )}

        </div>

      </section>

      {/* ================= PRIORITY ================= */}

      <section style={styles.section}>

        <h3 style={styles.sectionTitle}>
          Complaint Priority Distribution
        </h3>

        <div style={styles.priorityGrid}>

          {priorityData.map(
            (p, i) => (

              <div
                key={i}
                style={styles.priorityCard}
              >

                <div
                  style={{
                    ...styles.priorityCircle,

                    background:
                      p.color,
                  }}
                />

                <div>

                  <h4 style={{ margin: 0 }}>
                    {p.label}
                  </h4>

                  <p style={styles.priorityText}>

                    {p.count}
                    {" "}
                    Complaints
                    {" • "}
                    {p.value}%

                  </p>

                </div>

              </div>
            )
          )}

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <div style={styles.nicFooter}>
        Digitally Authenticated • NIC Government Infrastructure
      </div>

    </div>
  );
};

/* =========================================================
   COMPONENTS
========================================================= */

const StatCard = ({
  title,
  value,
  color,
  icon,
}) => (

  <div style={styles.card}>

    <div
      style={{
        ...styles.cardIcon,

        background:
          color,
      }}
    >
      {icon}
    </div>

    <div>

      <p style={styles.cardLabel}>
        {title}
      </p>

      <h2 style={styles.cardValue}>
        {value}
      </h2>

    </div>

  </div>
);

const CollectorRow = ({
  label,
  value,
  mom,
}) => (

  <div style={styles.collectorRow}>

    <span>{label}</span>

    <b>{value}</b>

    <span
      style={{
        color:
          mom >= 0
            ? "#dc2626"
            : "#16a34a",

        fontWeight: 700,
      }}
    >

      {mom >= 0
        ? `▲ ${mom}%`
        : `▼ ${Math.abs(mom)}%`}

    </span>

  </div>
);

const toggleStyle = (active) => ({
  padding: "8px 16px",

  borderRadius: 8,

  border: active
    ? "none"
    : "1px solid #d1d5db",

  cursor: "pointer",

  background: active
    ? "#111827"
    : "#fff",

  color: active
    ? "#fff"
    : "#111827",

  fontWeight: 600,
});

/* =========================================================
   STYLES
========================================================= */

const styles = {

  container: {

    padding: 30,

    background: "#eef2f7",

    minHeight: "100vh",
  },

  loading: {

    padding: 60,

    textAlign: "center",

    fontSize: 24,

    fontWeight: 700,
  },

  topBanner: {

    background:
      "linear-gradient(to right,#051835,#1f4e79)",

    padding: 28,

    borderRadius: 18,

    marginBottom: 30,

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    color: "#fff",

    boxShadow:
      "0 6px 18px rgba(0,0,0,0.15)",
  },

  bannerLeft: {

    display: "flex",

    gap: 18,

    alignItems: "center",
  },

  logoCircle: {

    width: 72,

    height: 72,

    borderRadius: "50%",

    background:
      "rgba(255,255,255,0.15)",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",
  },

  pageTitle: {

    fontSize: 34,

    fontWeight: 700,
  },

  subtitle: {

    marginTop: 6,

    opacity: 0.9,
  },

  actions: {

    display: "flex",

    gap: 12,

    alignItems: "center",
  },

  pdfBtn: {

    padding: "10px 18px",

    background: "#fff",

    color: "#051835",

    border: "none",

    borderRadius: 8,

    cursor: "pointer",

    fontWeight: 700,

    display: "flex",

    alignItems: "center",

    gap: 8,
  },

  collectorPanel: {

    background: "#fff",

    padding: 24,

    borderRadius: 16,

    marginBottom: 30,

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.06)",

    borderLeft:
      "6px solid #dc2626",
  },

  collectorHeader: {

    display: "flex",

    alignItems: "center",

    gap: 10,

    marginBottom: 18,
  },

  collectorRow: {

    display: "flex",

    justifyContent:
      "space-between",

    padding: "12px 0",

    borderBottom:
      "1px solid #e5e7eb",
  },

  cardGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",

    gap: 22,

    marginBottom: 35,
  },

  card: {

    background: "#fff",

    padding: 24,

    borderRadius: 18,

    display: "flex",

    alignItems: "center",

    gap: 18,

    boxShadow:
      "0 6px 18px rgba(0,0,0,0.06)",
  },

  cardIcon: {

    width: 58,

    height: 58,

    borderRadius: 14,

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    color: "#fff",
  },

  cardLabel: {

    fontSize: 14,

    color: "#6b7280",
  },

  cardValue: {

    fontSize: 32,

    fontWeight: 700,

    marginTop: 6,
  },

  section: {

    marginBottom: 40,
  },

  sectionHeader: {

    display: "flex",

    alignItems: "center",

    gap: 12,

    marginBottom: 20,
  },

  sectionTitle: {

    fontSize: 20,

    marginBottom: 18,

    fontWeight: 700,
  },

  departmentGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(270px,1fr))",

    gap: 22,
  },

  departmentCard: {

    background: "#fff",

    borderRadius: 16,

    padding: 20,

    boxShadow:
      "0 4px 14px rgba(0,0,0,0.06)",
  },

  departmentTop: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 16,
  },

  departmentBadge: {

    background: "#111827",

    color: "#fff",

    padding: "4px 12px",

    borderRadius: 20,

    fontSize: 12,

    fontWeight: 700,
  },

  progressContainer: {

    width: "100%",

    height: 12,

    background: "#e5e7eb",

    borderRadius: 20,

    overflow: "hidden",

    marginBottom: 16,
  },

  progressBar: {

    height: "100%",

    background:
      "linear-gradient(90deg,#2563eb,#06b6d4)",

    borderRadius: 20,
  },

  departmentStats: {

    display: "flex",

    justifyContent:
      "space-between",

    fontSize: 13,

    color: "#4b5563",

    marginTop: 8,
  },

  priorityGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: 20,
  },

  priorityCard: {

    display: "flex",

    gap: 14,

    background: "#fff",

    padding: 18,

    borderRadius: 14,

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.06)",
  },

  priorityCircle: {

    width: 16,

    height: 16,

    borderRadius: "50%",

    marginTop: 4,
  },

  priorityText: {

    margin: 0,

    color: "#6b7280",
  },

  nicFooter: {

    marginTop: 50,

    textAlign: "center",

    fontSize: 13,

    color: "#6b7280",

    paddingBottom: 20,
  },
};

export default AnalyticsReportPage;