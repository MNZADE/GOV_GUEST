import { useState } from "react";

const AnalyticsPage = () => {
  const [viewMode, setViewMode] = useState("monthly");

  /* ================= DATA ================= */

  const currentMonth = {
    total: 4562,
    solved: 3920,
    pending: 642,
    urgent: 128,
  };

  const previousMonth = {
    total: 4210,
    solved: 3650,
    pending: 560,
    urgent: 98,
  };

  const weeklyData = {
    total: 1124,
    solved: 910,
    pending: 214,
    urgent: 36,
  };

  const stats = viewMode === "monthly" ? currentMonth : weeklyData;

  const mom = (current, prev) =>
    (((current - prev) / prev) * 100).toFixed(1);

  const departmentData = [
    { name: "Health", value: 32 },
    { name: "Sanitation", value: 28 },
    { name: "Water Supply", value: 18 },
    { name: "Electricity", value: 14 },
    { name: "Roads", value: 8 },
  ];

  const priorityData = [
    { label: "High", value: 22, color: "#dc2626" },
    { label: "Medium", value: 46, color: "#f59e0b" },
    { label: "Low", value: 32, color: "#16a34a" },
  ];

  const exportPDF = () => window.print();

  return (
    <div style={styles.container}>
      {/* ================= HEADER ================= */}
      <div style={styles.headerCard}>
        <div>
          <h1 style={styles.pageTitle}>Governance Analytics Dashboard</h1>
          <p style={styles.subtitle}>
            Municipal Corporation Kolhapur Division
          </p>
        </div>

        <div style={styles.actions}>
          <button
            style={toggleStyle(viewMode === "weekly")}
            onClick={() => setViewMode("weekly")}
          >
            Weekly
          </button>
          <button
            style={toggleStyle(viewMode === "monthly")}
            onClick={() => setViewMode("monthly")}
          >
            Monthly
          </button>

          <button style={styles.pdfBtn} onClick={exportPDF}>
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
          mom={mom(currentMonth.urgent, previousMonth.urgent)}
        />

        <CollectorRow
          label="Pending Complaints"
          value={stats.pending}
          mom={mom(currentMonth.pending, previousMonth.pending)}
        />

        <CollectorRow
          label="Resolution Rate"
          value={`${Math.round(
            (stats.solved / stats.total) * 100
          )}%`}
          mom={mom(
            (currentMonth.solved / currentMonth.total) * 100,
            (previousMonth.solved / previousMonth.total) * 100
          )}
        />
      </div>

      {/* ================= KPI ================= */}
      <div style={styles.cardGrid}>
        <StatCard title="Total Complaints" value={stats.total} />
        <StatCard title="Resolved" value={stats.solved} color="#16a34a" />
        <StatCard title="Pending" value={stats.pending} color="#f59e0b" />
        <StatCard title="Urgent" value={stats.urgent} color="#dc2626" />
      </div>

      {/* ================= DEPARTMENT LOAD ================= */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Department-wise Complaint Load</h3>

        {departmentData.map((d, i) => (
          <div key={i} style={styles.barRow}>
            <span style={styles.barLabel}>{d.name}</span>
            <div style={styles.barBg}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${d.value}%`,
                }}
              />
            </div>
            <span style={styles.barValue}>{d.value}%</span>
          </div>
        ))}
      </section>

      {/* ================= PRIORITY SPLIT ================= */}
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Complaint Priority Distribution</h3>

        <div style={styles.priorityGrid}>
          {priorityData.map((p, i) => (
            <div key={i} style={styles.priorityCard}>
              <div
                style={{
                  ...styles.priorityCircle,
                  background: p.color,
                }}
              />
              <div>
                <h4 style={{ margin: 0 }}>{p.label}</h4>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  {p.value}% of total complaints
                </p>
              </div>
            </div>
          ))}
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

const StatCard = ({ title, value, color = "#111827" }) => (
  <div style={styles.card}>
    <p style={styles.cardLabel}>{title}</p>
    <h2 style={{ ...styles.cardValue, color }}>{value}</h2>
  </div>
);

const CollectorRow = ({ label, value, mom }) => (
  <div style={styles.collectorRow}>
    <span>{label}</span>
    <b>{value}</b>
    <span
      style={{
        color: mom >= 0 ? "#dc2626" : "#16a34a",
        fontWeight: 600,
      }}
    >
      {mom >= 0 ? `▲ ${mom}%` : `▼ ${Math.abs(mom)}%`}
    </span>
  </div>
);

const toggleStyle = (active) => ({
  padding: "6px 14px",
  borderRadius: 6,
  border: active ? "none" : "1px solid #d1d5db",
  cursor: "pointer",
  background: active ? "#111827" : "#fff",
  color: active ? "#fff" : "#111827",
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
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
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
    borderLeft: "6px solid #dc2626",
    padding: 18,
    borderRadius: 10,
    marginBottom: 30,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  collectorRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 35,
  },

  card: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },

  cardLabel: { fontSize: 14, color: "#6b7280" },
  cardValue: { fontSize: 28, fontWeight: 700 },

  section: { marginBottom: 40 },

  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: "#111827",
  },

  barRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  barLabel: { width: 130 },

  barBg: {
    flex: 1,
    height: 10,
    background: "#e5e7eb",
    borderRadius: 6,
  },

  barFill: {
    height: 10,
    background: "#111827",
    borderRadius: 6,
  },

  barValue: { width: 40 },

  priorityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 20,
  },

  priorityCard: {
    display: "flex",
    gap: 14,
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
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
