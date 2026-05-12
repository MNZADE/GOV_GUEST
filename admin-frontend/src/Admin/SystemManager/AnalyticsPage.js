import {
  useState,
  useEffect,
} from "react";

const AnalyticsPage = () => {

  const [viewMode, setViewMode] =
    useState("monthly");

  const [loading, setLoading] =
    useState(true);

  /* ================= BACKEND DATA ================= */

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

  /* ================= FETCH ANALYTICS ================= */

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
          "📊 Analytics Response:",
          data
        );

        if (
          response.ok &&
          data.success
        ) {

          /* CURRENT MONTH */

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

          /* PREVIOUS MONTH */

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

          /* WEEKLY */

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

          /* DEPARTMENT */

          setDepartmentData(

            Array.isArray(
              data.departmentData
            )

              ? data.departmentData

              : []
          );

          /* PRIORITY */

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

  /* ================= VIEW MODE ================= */

  const stats =
    viewMode === "monthly"
      ? currentMonth
      : weeklyData;

  /* ================= MOM ================= */

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

  /* ================= EXPORT ================= */

  const exportPDF =
    () => window.print();

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div
        style={{
          padding: 50,
          textAlign: "center",
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Loading Analytics...
      </div>
    );
  }

  return (

    <div style={styles.container}>

      {/* ================= HEADER ================= */}

      <div style={styles.headerCard}>

        <div>

          <h1 style={styles.pageTitle}>
            Governance Analytics Dashboard
          </h1>

          <p style={styles.subtitle}>
            Municipal Corporation Kolhapur Division
          </p>

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
            Export Govt PDF
          </button>

        </div>

      </div>

      {/* ================= COLLECTOR PANEL ================= */}

      <div style={styles.collectorPanel}>

        <h3 style={{ marginBottom: 10 }}>
          Collector / Commissioner Review Panel
        </h3>

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
        />

        <StatCard
          title="Resolved"
          value={stats.solved}
          color="#16a34a"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          color="#f59e0b"
        />

        <StatCard
          title="Urgent"
          value={stats.urgent}
          color="#dc2626"
        />

      </div>

      {/* ================= DEPARTMENT CHART ================= */}

      <section style={styles.section}>

        <h3 style={styles.sectionTitle}>
          Department Analytics Overview
        </h3>

        <div style={styles.departmentGrid}>

          {departmentData.map(
            (d, i) => (

              <div
                key={i}
                style={styles.departmentCard}
              >

                <div
                  style={
                    styles.departmentTop
                  }
                >

                  <h4
                    style={{
                      margin: 0,
                    }}
                  >
                    {d.name}
                  </h4>

                  <span
                    style={
                      styles.departmentBadge
                    }
                  >
                    {d.total}
                  </span>

                </div>

                {/* PROGRESS */}

                <div
                  style={
                    styles.progressContainer
                  }
                >

                  <div
                    style={{
                      ...styles.progressBar,

                      width:
                        `${d.resolutionRate}%`,
                    }}
                  />

                </div>

                {/* STATS */}

                <div
                  style={
                    styles.departmentStats
                  }
                >

                  <span>
                    ✅ {d.resolved} Resolved
                  </span>

                  <span>
                    ⏳ {d.pending} Pending
                  </span>

                </div>

                <div
                  style={
                    styles.departmentStats
                  }
                >

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
                style={
                  styles.priorityCard
                }
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

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                    }}
                  >

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
        Digitally Authenticated • NIC Government Infrastructure (Mock)
      </div>

    </div>
  );
};

/* ================= COMPONENTS ================= */

const StatCard = ({
  title,
  value,
  color = "#111827",
}) => (

  <div style={styles.card}>

    <p style={styles.cardLabel}>
      {title}
    </p>

    <h2
      style={{
        ...styles.cardValue,
        color,
      }}
    >
      {value}
    </h2>

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

        fontWeight: 600,
      }}
    >

      {mom >= 0
        ? `▲ ${mom}%`
        : `▼ ${Math.abs(mom)}%`}

    </span>

  </div>
);

const toggleStyle = (active) => ({
  padding: "6px 14px",
  borderRadius: 6,
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
});

/* ================= STYLES ================= */

const styles = {

  container: {
    padding: 30,
    background: "#f3f4f6",
    minHeight: "100vh",
  },

  headerCard: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 25,
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.06)",
  },

  pageTitle: {
    fontSize: 26,
    color: "#111827",
  },

  subtitle: {
    color: "#6b7280",
    marginTop: 4,
  },

  actions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  pdfBtn: {
    padding: "6px 14px",
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  collectorPanel: {
    background: "#fff",
    borderLeft:
      "6px solid #dc2626",
    padding: 18,
    borderRadius: 10,
    marginBottom: 30,
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.05)",
  },

  collectorRow: {
    display: "flex",
    justifyContent:
      "space-between",
    marginTop: 8,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 35,
  },

  card: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 12,
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.06)",
  },

  cardLabel: {
    fontSize: 14,
    color: "#6b7280",
  },

  cardValue: {
    fontSize: 28,
    fontWeight: 700,
  },

  section: {
    marginBottom: 40,
  },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: "#111827",
  },

  /* ================= DEPARTMENT ================= */

  departmentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
  },

  departmentCard: {
    background: "#fff",
    borderRadius: 14,
    padding: 18,
    boxShadow:
      "0 4px 14px rgba(0,0,0,0.06)",
  },

  departmentTop: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  departmentBadge: {
    background: "#111827",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },

  progressContainer: {
    width: "100%",
    height: 10,
    background: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
  },

  progressBar: {
    height: "100%",
    background:
      "linear-gradient(90deg,#2563eb,#06b6d4)",
    borderRadius: 10,
  },

  departmentStats: {
    display: "flex",
    justifyContent:
      "space-between",
    fontSize: 13,
    color: "#4b5563",
    marginTop: 8,
  },

  /* ================= PRIORITY ================= */

  priorityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },

  priorityCard: {
    display: "flex",
    gap: 14,
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.06)",
  },

  priorityCircle: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    marginTop: 4,
  },

  nicFooter: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
  },
};

export default AnalyticsPage;