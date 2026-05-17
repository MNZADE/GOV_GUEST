import React, {
  useState,
  useEffect,
} from "react";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Eye,
  X,
 ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Shield,
  FileText,
  Phone,
} from "lucide-react";

const BACKEND =
  "http://localhost:5000";

const DashboardPage = ({
  departmentName =
    "Electricity Department",
}) => {

  /* =====================================
     STATES
  ===================================== */

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("All");

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    currentImage,
    setCurrentImage,
  ] = useState(0);

  const [, setTick] =
    useState(0);

  /* =====================================
     FETCH COMPLAINTS
  ===================================== */

  const fetchComplaints =
    async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await fetch(

            `${BACKEND}/api/complaints/manager/electricity department`,

            {
              headers: {

                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json",
              },
            }
          );

        const data =
          await res.json();

        if (data.success) {

          setComplaints(
            data.complaints || []
          );
        }

      } catch (err) {

        console.log(
          "Fetch Error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================
     LIVE REFRESH
  ===================================== */

  useEffect(() => {

    fetchComplaints();

    const interval =
      setInterval(() => {

        fetchComplaints();

        setTick(
          (prev) =>
            prev + 1
        );

      }, 60000);

    return () =>
      clearInterval(interval);

  }, []);

  /* =====================================
     PRIORITY ORDER
  ===================================== */

  const priorityOrder = {

    Escalated: 1,

    Urgent: 2,

    Normal: 3,
  };

  /* =====================================
     FILTERED COMPLAINTS
  ===================================== */

  const filteredComplaints =
    complaints

      .filter((c) => {

        const matchesSearch =

          c.issue
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          c.complaintId
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesStatus =

          statusFilter ===
            "All" ||

          c.status ===
            statusFilter;

        const matchesPriority =

          priorityFilter ===
            "All" ||

          c.priority ===
            priorityFilter;

        return (

          matchesSearch &&

          matchesStatus &&

          matchesPriority
        );
      })

      .sort((a, b) => {

        return (

          priorityOrder[
            a.priority
          ] -

          priorityOrder[
            b.priority
          ]
        );
      });

  /* =====================================
     STATS
  ===================================== */

  const total =
    complaints.length;

  const pending =
    complaints.filter(
      (c) =>
        c.status ===
        "Pending"
    ).length;

  const resolved =
    complaints.filter(
      (c) =>
        c.status ===
        "Resolved"
    ).length;

  const escalated =
    complaints.filter(
      (c) =>

        c.priority ===
          "Escalated" ||

        c.status ===
          "Escalated"
    ).length;

  /* =====================================
     SLA
  ===================================== */

  const getSLA = (
    createdAt,
    status
  ) => {

    const hours =

      (Date.now() -

        new Date(
          createdAt
        )) /

      (1000 * 60 * 60);

    if (
      status ===
      "Resolved"
    ) {

      return {

        label:
          "Resolved",

        color:
          "#16a34a",
      };
    }

    if (hours > 48) {

      return {

        label:
          "Escalated",

        color:
          "#dc2626",
      };
    }

    if (hours > 24) {

      return {

        label:
          "Warning",

        color:
          "#f59e0b",
      };
    }

    return {

      label:
        "Normal",

      color:
        "#2563eb",
    };
  };

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <h1 style={styles.heading}>
          {departmentName}
          {" "}
          Dashboard
        </h1>

        <p style={styles.subtitle}>
          Real-Time Complaint Monitoring
        </p>

      </div>

      {/* STATS */}

      <div style={styles.grid}>

        <StatCard
          icon={
            <TrendingUp
              size={24}
            />
          }
          label="Total"
          value={total}
          color="#2563eb"
        />

        <StatCard
          icon={
            <Clock
              size={24}
            />
          }
          label="Pending"
          value={pending}
          color="#f59e0b"
        />

        <StatCard
          icon={
            <AlertTriangle
              size={24}
            />
          }
          label="Escalated"
          value={escalated}
          color="#dc2626"
        />

        <StatCard
          icon={
            <CheckCircle
              size={24}
            />
          }
          label="Resolved"
          value={resolved}
          color="#16a34a"
        />

      </div>

      {/* FILTERS */}

      <div style={styles.filterSection}>

        <div style={styles.searchBox}>

          <Search size={18} />

          <input
            placeholder="Search complaints..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={styles.input}
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          style={styles.select}
        >

          <option>
            All
          </option>

          <option>
            Pending
          </option>

          <option>
            In Progress
          </option>

          <option>
            Resolved
          </option>

          <option>
            Escalated
          </option>

        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(
              e.target.value
            )
          }
          style={styles.select}
        >

          <option>
            All
          </option>

          <option>
            Normal
          </option>

          <option>
            Urgent
          </option>

          <option>
            Escalated
          </option>

        </select>

      </div>

      {/* TABLE */}

      <div style={styles.tableSection}>

        <h3 style={styles.sectionTitle}>
          Complaint List
        </h3>

        {loading ? (

          <div style={styles.loading}>
            Loading complaints...
          </div>

        ) : (

          <div style={{
            overflowX: "auto",
          }}>

            <table style={styles.table}>

              <thead>

                <tr style={
                  styles.tableHeaderRow
                }>

                  <th style={styles.th}>
                    Complaint ID
                  </th>

                  <th style={styles.th}>
                    Issue
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
                    SLA
                  </th>

                  <th style={styles.th}>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredComplaints.map(
                  (c) => {

                    const sla =
                      getSLA(
                        c.createdAt,
                        c.status
                      );

                    return (

                      <tr
                        key={
                          c.complaintId
                        }
                        style={
                          styles.tableRow
                        }
                      >

                        <td style={styles.td}>
                          <strong>
                            {
                              c.complaintId
                            }
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {c.issue}
                        </td>

                        <td style={styles.td}>

                          <Badge
                            text={
                              c.priority
                            }
                            type={
                              c.priority
                            }
                          />

                        </td>

                        <td style={styles.td}>

                          <Badge
                            text={
                              c.status
                            }
                            type={
                              c.status
                            }
                          />

                        </td>

                        <td style={styles.td}>

                          {c.date || "-"}

                        </td>

                        <td style={styles.td}>

                          <span style={{
                            background:
                              `${sla.color}20`,
                            color:
                              sla.color,
                            padding:
                              "6px 12px",
                            borderRadius:
                              20,
                            fontSize:
                              12,
                            fontWeight:
                              600,
                          }}>

                            {sla.label}

                          </span>

                        </td>

                        <td style={styles.td}>

                          <button
                            style={
                              styles.viewBtn
                            }

                            onClick={() => {

                              setSelectedComplaint(
                                c
                              );

                              setCurrentImage(
                                0
                              );
                            }}
                          >

                            <Eye
                              size={16}
                            />

                            View

                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* MODAL */}

      {selectedComplaint && (

        <div style={
          styles.modalOverlay
        }>

          <div style={
            styles.modal
          }>

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

              <X size={22} />

            </button>

            <h2>
              Complaint Details
            </h2>

            <p>
              Complaint ID:
              {" "}
              {
                selectedComplaint.complaintId
              }
            </p>

            <p>
              Issue:
              {" "}
              {
                selectedComplaint.issue
              }
            </p>

            <p>
              Status:
              {" "}
              {
                selectedComplaint.status
              }
            </p>

            <p>
              Priority:
              {" "}
              {
                selectedComplaint.priority
              }
            </p>

            <p>
              Address:
              {" "}
              {
                selectedComplaint.address
              }
            </p>

            <p>
              Description:
              {" "}
              {
                selectedComplaint.description
              }
            </p>

            {selectedComplaint.images
              ?.length > 0 && (

              <img
                src={`${BACKEND}/uploads/${selectedComplaint.images[currentImage]}`}
                alt="Complaint"
                style={
                  styles.mainImage
                }
              />
            )}

          </div>

        </div>
      )}

    </div>
  );
};

/* =====================================
   COMPONENTS
===================================== */

const StatCard = ({
  icon,
  label,
  value,
  color,
}) => (

  <div style={styles.card}>

    <div style={{
      ...styles.iconBox,
      background:
        color,
    }}>

      {icon}

    </div>

    <div>

      <p>
        {label}
      </p>

      <h2>
        {value}
      </h2>

    </div>

  </div>
);

const Badge = ({
  text,
  type,
}) => {

  let color =
    "#64748b";

  if (type === "Urgent")
    color = "#dc2626";

  if (type === "Escalated")
    color = "#ea580c";

  if (type === "Resolved")
    color = "#16a34a";

  if (type === "Pending")
    color = "#f59e0b";

  if (type === "In Progress")
    color = "#2563eb";

  return (

    <span style={{
      background:
        `${color}20`,
      color,
      padding:
        "7px 15px",
      borderRadius:
        999,
      fontSize: 12,
      fontWeight: 700,
    }}>

      {text}

    </span>
  );
};

/* =====================================
   STYLES
===================================== */

const styles = {

  container: {
    padding: 25,
    background:
      "#f1f5f9",
    minHeight:
      "100vh",
  },

  header: {
    marginBottom: 30,
  },

  heading: {
    fontSize: 32,
    fontWeight: 800,
  },

  subtitle: {
    color: "#64748b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 30,
  },

  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 20,
    display: "flex",
    gap: 15,
    alignItems:
      "center",
  },

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 15,
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    color: "#fff",
  },

  filterSection: {
    display: "flex",
    gap: 15,
    marginBottom: 25,
  },

  searchBox: {
    display: "flex",
    alignItems:
      "center",
    gap: 10,
    background: "#fff",
    padding:
      "12px 16px",
    borderRadius: 15,
  },

  input: {
    border: "none",
    outline: "none",
  },

  select: {
    padding:
      "12px 14px",
    borderRadius: 12,
  },

  tableSection: {
    background: "#fff",
    padding: 25,
    borderRadius: 20,
  },

  sectionTitle: {
    marginBottom: 20,
  },

  loading: {
    textAlign: "center",
    padding: 40,
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  tableHeaderRow: {
    background: "#f8fafc",
  },

  th: {
    padding: 16,
    textAlign: "left",
  },

  td: {
    padding: 16,
    borderBottom:
      "1px solid #e2e8f0",
  },

  tableRow: {
    background: "#fff",
  },

  viewBtn: {
    background:
      "#2563eb",
    color: "#fff",
    border: "none",
    padding:
      "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    display: "flex",
    alignItems:
      "center",
    gap: 5,
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent:
      "center",
    alignItems:
      "center",
    zIndex: 9999,
  },

  modal: {
    width: "90%",
    maxWidth: 800,
    background: "#fff",
    padding: 30,
    borderRadius: 25,
    position: "relative",
  },

  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    border: "none",
    background: "#fff",
    cursor: "pointer",
  },

  mainImage: {
    width: "100%",
    marginTop: 20,
    borderRadius: 20,
  },
};

export default DashboardPage;