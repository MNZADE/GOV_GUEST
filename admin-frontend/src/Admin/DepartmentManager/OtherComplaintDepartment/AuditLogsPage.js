import React from "react";

import {
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Calendar,
} from "lucide-react";

const AuditLogsPage = () => {

  /* =====================================================
     STATS
  ===================================================== */

  const stats = [

    {
      title:
        "Total Complaints",

      value: 1250,

      icon:
        <Activity size={28} />,

      color: "#2563eb",

      bg: "#dbeafe",
    },

    {
      title:
        "In Progress",

      value: 320,

      icon:
        <Clock size={28} />,

      color: "#f59e0b",

      bg: "#fef3c7",
    },

    {
      title:
        "Resolved",

      value: 810,

      icon:
        <CheckCircle size={28} />,

      color: "#16a34a",

      bg: "#dcfce7",
    },

    {
      title:
        "Escalated",

      value: 120,

      icon:
        <AlertTriangle size={28} />,

      color: "#dc2626",

      bg: "#fee2e2",
    },
  ];

  /* =====================================================
     AUDIT LOGS
  ===================================================== */

  const logs = [

    {
      complaintId:
        "GEN-2026-001",

      issue:
        "Street Light Not Working",

      status:
        "Resolved",

      worker:
        "Rahul Patil",

      progress:
        "Electrical repair completed successfully.",

      department:
        "General Complaint Department",

      location:
        "Shivaji Nagar, Kolhapur",

      date:
        "18 May 2026",

      priority:
        "High",
    },

    {
      complaintId:
        "GEN-2026-002",

      issue:
        "Garbage Overflow",

      status:
        "In Progress",

      worker:
        "Amit Jadhav",

      progress:
        "Cleaning staff assigned and work started.",

      department:
        "General Complaint Department",

      location:
        "Rajarampuri, Kolhapur",

      date:
        "17 May 2026",

      priority:
        "Medium",
    },

    {
      complaintId:
        "GEN-2026-003",

      issue:
        "Water Leakage",

      status:
        "Escalated",

      worker:
        "Suresh More",

      progress:
        "Urgent maintenance team dispatched.",

      department:
        "General Complaint Department",

      location:
        "Tarabai Park, Kolhapur",

      date:
        "16 May 2026",

      priority:
        "Urgent",
    },
  ];

  return (

    <div>

      {/* =====================================================
          STATS CARDS
      ===================================================== */}

      <div style={styles.statsGrid}>

        {stats.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              style={styles.statCard}
            >

              <div
                style={styles.statTop}
              >

                <div>

                  <p
                    style={
                      styles.statTitle
                    }
                  >
                    {
                      item.title
                    }
                  </p>

                  <h1
                    style={
                      styles.statValue
                    }
                  >
                    {
                      item.value
                    }
                  </h1>

                </div>

                <div

                  style={{

                    ...styles.iconBox,

                    background:
                      item.bg,

                    color:
                      item.color,
                  }}
                >

                  {item.icon}

                </div>

              </div>

            </div>
          )
        )}

      </div>

      {/* =====================================================
          CHART SECTION
      ===================================================== */}

      <div style={styles.chartGrid}>

        {/* WEEKLY */}

        <div style={styles.chartCard}>

          <div style={styles.chartHeader}>

            <h3 style={styles.chartTitle}>
              Weekly Complaints
            </h3>

            <Calendar size={22} />

          </div>

          <div style={styles.chartBars}>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.bar,
                  height: 70,
                }}
              />
              <span>Mon</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.bar,
                  height: 120,
                }}
              />
              <span>Tue</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.bar,
                  height: 90,
                }}
              />
              <span>Wed</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.bar,
                  height: 150,
                }}
              />
              <span>Thu</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.bar,
                  height: 110,
                }}
              />
              <span>Fri</span>
            </div>

          </div>

        </div>

        {/* MONTHLY */}

        <div style={styles.chartCard}>

          <div style={styles.chartHeader}>

            <h3 style={styles.chartTitle}>
              Monthly Complaints
            </h3>

            <Calendar size={22} />

          </div>

          <div style={styles.chartBars}>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.barGreen,
                  height: 120,
                }}
              />
              <span>Jan</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.barGreen,
                  height: 180,
                }}
              />
              <span>Feb</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.barGreen,
                  height: 150,
                }}
              />
              <span>Mar</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.barGreen,
                  height: 220,
                }}
              />
              <span>Apr</span>
            </div>

          </div>

        </div>

        {/* YEARLY */}

        <div style={styles.chartCard}>

          <div style={styles.chartHeader}>

            <h3 style={styles.chartTitle}>
              Yearly Complaints
            </h3>

            <Calendar size={22} />

          </div>

          <div style={styles.chartBars}>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.barRed,
                  height: 180,
                }}
              />
              <span>2023</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.barRed,
                  height: 260,
                }}
              />
              <span>2024</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.barRed,
                  height: 320,
                }}
              />
              <span>2025</span>
            </div>

            <div style={styles.barBox}>
              <div
                style={{
                  ...styles.barRed,
                  height: 380,
                }}
              />
              <span>2026</span>
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          AUDIT LOGS DETAILS
      ===================================================== */}

      <div style={styles.logsSection}>

        <div style={styles.logsHeader}>

          <h2 style={styles.logsTitle}>
            Complaint Audit Logs
          </h2>

          <p style={styles.logsSubtitle}>
            Complete complaint tracking and progress management system
          </p>

        </div>

        {logs.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              style={styles.logCard}
            >

              {/* TOP */}

              <div style={styles.logTop}>

                <div>

                  <h3 style={styles.complaintId}>
                    {
                      item.complaintId
                    }
                  </h3>

                  <p style={styles.issue}>
                    {item.issue}
                  </p>

                </div>

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

              </div>

              {/* DETAILS */}

              <div style={styles.detailsGrid}>

                <div style={styles.detailBox}>
                  <label>
                    Assigned Worker
                  </label>

                  <h4>
                    {item.worker}
                  </h4>
                </div>

                <div style={styles.detailBox}>
                  <label>
                    Priority
                  </label>

                  <h4>
                    {
                      item.priority
                    }
                  </h4>
                </div>

                <div style={styles.detailBox}>
                  <label>
                    Department
                  </label>

                  <h4>
                    {
                      item.department
                    }
                  </h4>
                </div>

                <div style={styles.detailBox}>
                  <label>
                    Date
                  </label>

                  <h4>
                    {item.date}
                  </h4>
                </div>

              </div>

              {/* PROGRESS */}

              <div style={styles.progressBox}>

                <label>
                  Work Progress
                </label>

                <p>
                  {
                    item.progress
                  }
                </p>

              </div>

              {/* LOCATION */}

              <div style={styles.progressBox}>

                <label>
                  Complaint Location
                </label>

                <p>
                  {
                    item.location
                  }
                </p>

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
};

/* =====================================================
   STYLES
===================================================== */

const styles = {

  /* STATS */

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

    justifyContent: "center",

    alignItems: "center",
  },

  /* CHART */

  chartGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(320px,1fr))",

    gap: 24,

    marginBottom: 35,
  },

  chartCard: {

    background: "#fff",

    padding: 28,

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",
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

  chartBars: {

    display: "flex",

    alignItems: "flex-end",

    gap: 18,

    height: 240,
  },

  barBox: {

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    gap: 10,
  },

  bar: {

    width: 45,

    background: "#2563eb",

    borderRadius: 12,
  },

  barGreen: {

    width: 45,

    background: "#16a34a",

    borderRadius: 12,
  },

  barRed: {

    width: 45,

    background: "#dc2626",

    borderRadius: 12,
  },

  /* LOGS */

  logsSection: {

    background: "#fff",

    borderRadius: 28,

    padding: 30,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",
  },

  logsHeader: {

    marginBottom: 30,
  },

  logsTitle: {

    margin: 0,

    fontSize: 30,

    fontWeight: 700,
  },

  logsSubtitle: {

    color: "#64748b",

    marginTop: 8,
  },

  logCard: {

    background: "#f8fafc",

    borderRadius: 24,

    padding: 28,

    marginBottom: 24,

    border:
      "1px solid #e2e8f0",
  },

  logTop: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 25,
  },

  complaintId: {

    margin: 0,

    fontSize: 22,

    fontWeight: 700,
  },

  issue: {

    marginTop: 8,

    color: "#475569",
  },

  statusBadge: {

    padding: "10px 18px",

    borderRadius: 30,

    fontWeight: 700,

    fontSize: 13,
  },

  detailsGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: 20,

    marginBottom: 24,
  },

  detailBox: {

    background: "#fff",

    padding: 20,

    borderRadius: 18,

    border:
      "1px solid #e2e8f0",
  },

  progressBox: {

    background: "#fff",

    padding: 22,

    borderRadius: 18,

    marginBottom: 20,

    border:
      "1px solid #e2e8f0",
  },
};

export default AuditLogsPage;