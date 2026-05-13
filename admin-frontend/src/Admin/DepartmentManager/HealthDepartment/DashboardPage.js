import React, {
  useState,
  useEffect,
} from "react";

import {
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Eye,
} from "lucide-react";

/* ================= BADGE ================= */

const Badge = ({ text }) => {

  const colors = {
    Urgent: "#ef4444",
    Escalated: "#f97316",
    Resolved: "#22c55e",
    Pending: "#eab308",
    "In Progress": "#3b82f6",
    Normal: "#64748b",
  };

  const color =
    colors[text] || "#64748b";

  return (
    <span
      style={{
        background: `${color}20`,
        color,
        padding: "8px 14px",
        borderRadius: 30,
        fontSize: 12,
        fontWeight: 700,
        border: `1px solid ${color}40`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "90px",
      }}
    >
      {text}
    </span>
  );
};

/* ================= CARD ================= */

const DashboardCard = ({
  title,
  value,
  icon,
}) => (

  <div style={styles.card}>

    <div style={styles.iconBox}>
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

/* ================= MAIN ================= */

const DashboardPage = () => {

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

  /* ================= FETCH ================= */

  useEffect(() => {

    const fetchComplaints =
      async () => {

        try {

          setLoading(true);

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

          if (!token || !user) {
            return;
          }

          const role =
            user.role;

          const department =
            user.department
              ?.toLowerCase()
              .replace(
                " supply department",
                ""
              )
              .replace(
                " department",
                ""
              )
              .trim();

          let apiUrl = "";

          if (
            role ===
            "system_manager"
          ) {

            apiUrl =
              "http://localhost:5000/api/complaints/system/all";

          } else {

            apiUrl =
              `http://localhost:5000/api/complaints/manager/${department}`;
          }

          const response =
            await fetch(
              apiUrl,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await response.json();

          const updatedComplaints =
            (
              data.complaints ||
              data ||
              []
            ).map((c) => {

              let priority =
                "Normal";

              const issueText =
                `${c.subcategory} ${c.description}`
                  .toLowerCase();

              const createdHours =
                (
                  Date.now() -
                  new Date(
                    c.createdAt
                  )
                ) /
                (1000 * 60 * 60);

              if (
                issueText.includes(
                  "toilet"
                ) ||
                issueText.includes(
                  "medical"
                ) ||
                issueText.includes(
                  "hospital"
                ) ||
                issueText.includes(
                  "ambulance"
                ) ||
                issueText.includes(
                  "garbage"
                ) ||
                issueText.includes(
                  "dirty water"
                )
              ) {

                priority =
                  "Urgent";
              }

              if (
                createdHours > 48 &&
                c.status !==
                  "Resolved"
              ) {

                priority =
                  "Escalated";
              }

              return {
                ...c,
                priority,
              };
            });

          setComplaints(
            updatedComplaints
          );

          setLoading(false);

        } catch (error) {

          console.log(error);

          setLoading(false);
        }
      };

    fetchComplaints();

  }, []);

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <h1 style={styles.title}>
          Health Department Dashboard
        </h1>

        <p style={styles.subtitle}>
          Smart Complaint Monitoring System
        </p>

      </div>

      {/* TOP CARDS */}

      <div style={styles.grid}>

        <DashboardCard
          title="Total Complaints"
          value={
            complaints.length
          }
          icon={
            <AlertTriangle size={24} />
          }
        />

        <DashboardCard
          title="Pending"
          value={
            complaints.filter(
              (c) =>
                c.status ===
                "Pending"
            ).length
          }
          icon={
            <Clock3 size={24} />
          }
        />

        <DashboardCard
          title="Resolved"
          value={
            complaints.filter(
              (c) =>
                c.status ===
                "Resolved"
            ).length
          }
          icon={
            <CheckCircle2 size={24} />
          }
        />

        <DashboardCard
          title="Escalated"
          value={
            complaints.filter(
              (c) =>
                c.priority ===
                "Escalated"
            ).length
          }
          icon={
            <AlertTriangle size={24} />
          }
        />

      </div>

      {/* TABLE */}

      <div style={styles.tableWrapper}>

        <div style={styles.tableTop}>

          <h3 style={{ margin: 0 }}>
            Complaint Records
          </h3>

        </div>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                #
              </th>

              <th style={styles.th}>
                Complaint ID
              </th>

              <th style={styles.th}>
                Subcategory
              </th>

              <th style={styles.th}>
                Priority
              </th>

              <th style={styles.th}>
                Status
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

            {
              loading ? (

                <tr>

                  <td
                    colSpan="7"
                    style={styles.loading}
                  >
                    Loading complaints...
                  </td>

                </tr>

              ) : complaints.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    style={styles.loading}
                  >
                    No complaints found
                  </td>

                </tr>

              ) : (

                complaints.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={index}
                      style={styles.tr}
                    >

                      <td style={styles.td}>
                        {index + 1}
                      </td>

                      <td style={styles.tdId}>
                        {
                          item.complaintId
                        }
                      </td>

                      <td style={styles.issueTd}>

  {
    item.issue

      ? item.issue
          .replace(
            /([A-Z])/g,
            " $1"
          )
          .trim()

      : item.subcategory

      ? item.subcategory
          .replace(
            /([A-Z])/g,
            " $1"
          )
          .trim()

      : "General Complaint"
  }

</td>

                      <td style={styles.td}>

                        <Badge
                          text={
                            item.priority
                          }
                        />

                      </td>

                      <td style={styles.td}>

                        <Badge
                          text={
                            item.status
                          }
                        />

                      </td>

                      <td style={styles.td}>

                        {
                          item.date ||
                          "N/A"
                        }

                      </td>

                      <td style={styles.td}>

                        <button
                          style={styles.viewBtn}
                          onClick={() =>
                            setSelectedComplaint(
                              item
                            )
                          }
                        >

                          <Eye size={15} />

                          View

                        </button>

                      </td>

                    </tr>
                  )
                )
              )
            }

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {
        selectedComplaint && (

          <div style={styles.modalOverlay}>

            <div style={styles.modal}>

              <h2 style={styles.modalTitle}>
                Complaint Details
              </h2>

              <div style={styles.detailBox}>

                <p>
                  <strong>
                    Complaint ID:
                  </strong>{" "}
                  {
                    selectedComplaint.complaintId
                  }
                </p>

                <p>
                  <strong>
                    Subcategory:
                  </strong>{" "}
                  {
                    selectedComplaint.subcategory
                  }
                </p>

                <p>
                  <strong>
                    Description:
                  </strong>{" "}
                  {
                    selectedComplaint.description
                  }
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  {
                    selectedComplaint.status
                  }
                </p>

                <p>
                  <strong>
                    Priority:
                  </strong>{" "}
                  {
                    selectedComplaint.priority
                  }
                </p>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {
                    selectedComplaint.date
                  }
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
                Close
              </button>

            </div>

          </div>
        )
      }

    </div>
  );
};

/* ================= STYLES ================= */

const styles = {

  container: {
    padding: 25,
    background: "#f1f5f9",
    minHeight: "100vh",
  },

  header: {
    marginBottom: 25,
  },

  title: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a",
    fontWeight: 800,
  },

  subtitle: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 15,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: 20,
    marginBottom: 25,
  },

  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 22,
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow:
      "0 10px 30px rgba(15,23,42,0.06)",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background:
      "linear-gradient(135deg,#1e3a8a,#2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: 14,
  },

  cardValue: {
    marginTop: 4,
    marginBottom: 0,
    fontSize: 28,
    color: "#0f172a",
  },

  tableWrapper: {
    background: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow:
      "0 12px 35px rgba(15,23,42,0.06)",
  },

  tableTop: {
    padding: 22,
    borderBottom:
      "1px solid #e2e8f0",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  th: {
    background: "#f8fafc",
    padding: "18px 16px",
    textAlign: "center",
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
    borderBottom:
      "1px solid #e2e8f0",
  },

  tr: {
    transition: "0.2s",
  },

  td: {
    padding: "18px 16px",
    textAlign: "center",
    borderBottom:
      "1px solid #f1f5f9",
    verticalAlign: "middle",
    color: "#0f172a",
    fontWeight: 500,
  },

  tdId: {
    padding: "18px 16px",
    textAlign: "center",
    borderBottom:
      "1px solid #f1f5f9",
    fontWeight: 700,
    color: "#2563eb",
  },

  issueTd: {
    padding: "18px 16px",
    textAlign: "left",
    borderBottom:
      "1px solid #f1f5f9",
    fontWeight: 600,
    color: "#0f172a",
  },

  viewBtn: {
    border: "none",
    background:
      "linear-gradient(135deg,#1e3a8a,#2563eb)",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 600,
  },

  loading: {
    textAlign: "center",
    padding: 40,
    color: "#64748b",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,23,42,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 600,
    background: "#fff",
    borderRadius: 24,
    padding: 30,
  },

  modalTitle: {
    marginTop: 0,
    marginBottom: 20,
    color: "#0f172a",
  },

  detailBox: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    color: "#334155",
  },

  closeBtn: {
    marginTop: 25,
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 12,
    background:
      "linear-gradient(135deg,#dc2626,#ef4444)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 15,
  },
};

export default DashboardPage;