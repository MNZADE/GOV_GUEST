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
  User,
  Phone,
  Shield,
  FileText,
} from "lucide-react";

const BACKEND =
  "http://localhost:5000";

const DashboardPage = ({
  departmentName =
    "Street Light Department",
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
            `${BACKEND}/api/complaints/all`,
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

          const departmentComplaints =
            data.complaints.filter(
              (c) => {

                const dept =
                  (
                    c.department || ""
                  )
                    .toLowerCase()
                    .trim();

                return (
                  dept.includes(
                    "streetlight"
                  ) ||
                  dept.includes(
                    "street light"
                  )
                );
              }
            );

          setComplaints(
            departmentComplaints
          );
        }

      } catch (err) {

        console.log(err);

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
          (prev) => prev + 1
        );

      }, 60000);

    return () =>
      clearInterval(interval);

  }, []);

  /* =====================================
     PRIORITY SORT
  ===================================== */

  const priorityOrder = {
    Escalated: 1,
    Urgent: 2,
    Normal: 3,
  };
/* =====================================
   AUTO PRIORITY DETECTION
===================================== */

const getComplaintPriority =
  (complaint) => {

    const sub =
      (

        complaint.subcategories?.join(
          " "
        ) ||

        complaint.subCategory ||

        complaint.category ||

        complaint.issue ||

        ""
      )

        .toLowerCase()

        .trim();

    if (

      sub.includes(
        "electric shock"
      ) ||

      sub.includes(
        "danger spark"
      ) ||

      sub.includes(
        "fire"
      ) ||

      sub.includes(
        "live wire"
      )
    ) {

      return "Escalated";
    }

    if (

      sub.includes(
        "transformer"
      ) ||

      sub.includes(
        "wire damage"
      ) ||

      sub.includes(
        "short circuit"
      ) ||

      sub.includes(
        "power failure"
      )
    ) {

      return "High";
    }

    if (

      sub.includes(
        "lightnotworking"
      ) ||

      sub.includes(
        "light not working"
      ) ||

      sub.includes(
        "streetlight"
      ) ||

      sub.includes(
        "street light"
      ) ||

      sub.includes(
        "flickering"
      ) ||

      sub.includes(
        "voltage issue"
      )
    ) {

      return "Medium";
    }

    if (

      sub.includes(
        "poledamage"
      ) ||

      sub.includes(
        "pole damage"
      ) ||

      sub.includes(
        "newlight"
      ) ||

      sub.includes(
        "new light"
      )
    ) {

      return "Low";
    }

    return "Low";
  };
  /* =====================================
   COMPLAINT LABEL
===================================== */

const getComplaintLabel =
  (value) => {

    const labels = {

      lightNotWorking:
        "Light Not Working",

      flickering:
        "Light Flickering",

      poleDamage:
        "Pole Damage",

      newLight:
        "New Light Request",
    };

    return (
      labels[value] || value
    );
  };
  /* =====================================
     FILTER
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
          statusFilter === "All" ||
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

  const escalated =
    complaints.filter(
      (c) =>
        c.priority ===
          "Escalated" ||
        c.status ===
          "Escalated"
    ).length;

  const resolved =
    complaints.filter(
      (c) =>
        c.status ===
        "Resolved"
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
        new Date(createdAt)) /
      (1000 * 60 * 60);

    if (
      status === "Resolved"
    ) {

      return {
        label: "Resolved",
        color: "#16a34a",
      };
    }

    if (hours > 48) {

      return {
        label: "Escalated",
        color: "#dc2626",
      };
    }

    if (hours > 24) {

      return {
        label: "Warning",
        color: "#f59e0b",
      };
    }

    return {
      label: "Normal",
      color: "#2563eb",
    };
  };

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>
        <h1 style={styles.heading}>
          {departmentName} Dashboard
        </h1>

        <p style={styles.subtitle}>
          Real-time Complaint
          Monitoring & SLA Tracking
        </p>
      </div>

      {/* STATS */}

      <div style={styles.grid}>

        <StatCard
          icon={
            <TrendingUp size={24} />
          }
          label="Total"
          value={total}
          color="#2563eb"
        />

        <StatCard
          icon={
            <Clock size={24} />
          }
          label="Pending"
          value={pending}
          color="#f59e0b"
        />

        <StatCard
          icon={
            <AlertTriangle size={24} />
          }
          label="Escalated"
          value={escalated}
          color="#dc2626"
        />

        <StatCard
          icon={
            <CheckCircle size={24} />
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
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Escalated</option>
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
          <option>All</option>
          <option>Normal</option>
          <option>Urgent</option>
          <option>Escalated</option>
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
                    Date & Time
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
                        key={c._id}
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

                          <div style={styles.dateBox}>

                            <Calendar size={14} />

                            <div>

                              <div>
                                {c.date || "-"}
                              </div>

                              <small
                                style={{
                                  color:
                                    "#64748b",
                                }}
                              >
                                {c.time || "-"}
                              </small>

                            </div>

                          </div>

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

                            <Eye size={16} />

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

      {/* =====================================
    MODAL
===================================== */}

{selectedComplaint && (
  <div style={styles.modalOverlay}>

    <div style={styles.ultraModernModal}>

      {/* CLOSE BUTTON */}

      <button
        style={styles.closeBtn}
        onClick={() => {
          setSelectedComplaint(null);
          setCurrentImage(0);
        }}
      >
        <X size={22} />
      </button>

      {/* TOP SECTION */}

      <div style={styles.topSection}>

        {/* =====================================
            IMAGE SECTION
        ===================================== */}

        <div style={styles.imageSection}>

          {selectedComplaint.images?.length > 0 ? (
            <>

              {/* MAIN IMAGE */}

              <img
                src={`${BACKEND}/uploads/${selectedComplaint.images[currentImage]}`}
                alt="Complaint"
                style={styles.mainImage}
              />

              {/* LEFT BUTTON */}

              {currentImage > 0 && (
                <button
                  style={{
                    ...styles.sliderArrow,
                    left: 15,
                  }}
                  onClick={() =>
                    setCurrentImage(
                      currentImage - 1
                    )
                  }
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* RIGHT BUTTON */}

              {currentImage <
                selectedComplaint.images.length - 1 && (
                <button
                  style={{
                    ...styles.sliderArrow,
                    right: 15,
                  }}
                  onClick={() =>
                    setCurrentImage(
                      currentImage + 1
                    )
                  }
                >
                  <ChevronRight size={24} />
                </button>
              )}

              {/* THUMBNAILS */}

              <div style={styles.thumbnailContainer}>

                {selectedComplaint.images.map(
                  (img, index) => (

                    <img
                      key={index}
                      src={`${BACKEND}/uploads/${img}`}
                      alt="thumb"
                      onClick={() =>
                        setCurrentImage(index)
                      }
                      style={{
                        ...styles.thumbnail,
                        border:
                          currentImage === index
                            ? "3px solid #2563eb"
                            : "2px solid transparent",
                      }}
                    />

                  )
                )}

              </div>

            </>
          ) : (

            <div style={styles.noImage}>
              No Image Uploaded
            </div>

          )}

        </div>

        {/* =====================================
            INFO SECTION
        ===================================== */}

        <div style={styles.infoSection}>

          {/* HEADER */}

          <div style={styles.complaintHeader}>

            <h1 style={styles.complaintTitle}>
              Complaint Details
            </h1>

            <p style={styles.complaintId}>
              Complaint ID :
              {" "}
              {selectedComplaint.complaintId}
            </p>

          </div>

          {/* STATUS BADGES */}

          <div style={styles.badgeRow}>

            <Badge
              text={selectedComplaint.status}
              type={selectedComplaint.status}
            />

            <Badge
              text={selectedComplaint.priority}
              type={selectedComplaint.priority}
            />

          </div>

          {/* =====================================
              MODERN DETAIL CARDS
          ===================================== */}

          <div style={styles.fullDetailsGrid}>

            {/* SUB CATEGORY */}

            <DetailCard
              icon={
                <AlertTriangle size={18} />
              }
              label="Sub-Categories"
              value={
                Array.isArray(
                  selectedComplaint.subcategories
                )
                  ? selectedComplaint.subcategories.join(", ")
                  : selectedComplaint.subcategories || "-"
              }
            />

            {/* PHONE */}

            <DetailCard
              icon={
                <Phone size={18} />
              }
              label="Phone"
              value={
                selectedComplaint.phone
              }
            />

            {/* ADDRESS */}

            <DetailCard
              icon={
                <MapPin size={18} />
              }
              label="Address"
              value={
                selectedComplaint.address
              }
            />

            {/* DATE */}

            <DetailCard
              icon={
                <Calendar size={18} />
              }
              label="Date"
              value={new Date(
                selectedComplaint.createdAt
              ).toLocaleDateString()}
            />

            {/* TIME */}

            <DetailCard
              icon={
                <Clock size={18} />
              }
              label="Time"
              value={new Date(
                selectedComplaint.createdAt
              ).toLocaleTimeString()}
            />

            {/* DEPARTMENT */}

            <DetailCard
              icon={
                <Shield size={18} />
              }
              label="Department"
              value={
                selectedComplaint.department
              }
            />

            {/* ISSUE */}

            <DetailCard
              icon={
                <FileText size={18} />
              }
              label="Issue"
              value={
                selectedComplaint.issue
              }
            />

          </div>

        </div>

      </div>

      {/* =====================================
          DESCRIPTION
      ===================================== */}

      <div style={styles.descriptionBox}>

        <h3>Description</h3>

        <p>
          {selectedComplaint.description}
        </p>

      </div>

      {/* =====================================
          OFFICER UPDATE
      ===================================== */}

      {selectedComplaint.officerRemark && (

        <div style={styles.officerUpdateBox}>

          <div style={styles.officerHeader}>

            <Shield size={20} />

            <h3>
              Officer Update
            </h3>

          </div>

          <p style={styles.officerText}>
            {selectedComplaint.officerRemark}
          </p>

          {selectedComplaint.officerUpdatedImage && (

            <img
              src={`${BACKEND}/uploads/${selectedComplaint.officerUpdatedImage}`}
              alt="Officer Update"
              style={styles.officerImage}
            />

          )}

        </div>

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

    <div
      style={{
        ...styles.iconBox,
        background: color,
      }}
    >
      {icon}
    </div>

    <div>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {label}
      </p>

      <h2
        style={{
          margin: "6px 0 0",
          color: "#0f172a",
          fontSize: 28,
          fontWeight: 800,
        }}
      >
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

    <span
      style={{
        background:
          `${color}20`,
        color,
        padding:
          "7px 15px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.3px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {text}
    </span>

  );
};

const DetailCard = ({
  icon,
  label,
  value,
}) => (

  <div style={styles.detailCard}>

    <div style={styles.detailIcon}>
      {icon}
    </div>

    <div
      style={{
        flex: 1,
      }}
    >

      <small
        style={{
          color: "#64748b",
          fontSize: 12,
          fontWeight: 600,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </small>

      <div
        style={{
          fontWeight: 700,
          color: "#0f172a",
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </div>

    </div>

  </div>
);

/* =====================================
   STYLES
===================================== */

const styles = {

  container: {
    padding: 25,
    background:
      "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
    minHeight: "100vh",
  },

  header: {
    marginBottom: 30,
  },

  heading: {
    fontSize: 34,
    fontWeight: 800,
    marginBottom: 8,
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    color: "#64748b",
    fontSize: 15,
    fontWeight: 500,
  },

  /* =====================================
     STAT CARDS
  ===================================== */

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: 22,
    marginBottom: 30,
  },

  card: {
    background:
      "linear-gradient(135deg,#ffffff,#f8fafc)",
    padding: 24,
    borderRadius: 24,
    display: "flex",
    gap: 18,
    alignItems: "center",
    border:
      "1px solid rgba(255,255,255,0.5)",
    boxShadow:
      "0 10px 35px rgba(15,23,42,0.08)",
    transition: "0.3s ease",
  },

  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow:
      "0 8px 20px rgba(37,99,235,0.25)",
  },

  /* =====================================
     FILTER SECTION
  ===================================== */

  filterSection: {
    display: "flex",
    gap: 15,
    marginBottom: 25,
    flexWrap: "wrap",
    alignItems: "center",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    padding: "14px 18px",
    borderRadius: 16,
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.05)",
    border:
      "1px solid #e2e8f0",
  },

  input: {
    border: "none",
    outline: "none",
    minWidth: 260,
    fontSize: 14,
    background: "transparent",
  },

  select: {
    padding: "13px 16px",
    borderRadius: 14,
    border:
      "1px solid #dbeafe",
    background: "#fff",
    fontSize: 14,
    fontWeight: 500,
    color: "#0f172a",
    boxShadow:
      "0 4px 10px rgba(0,0,0,0.03)",
  },

  /* =====================================
     TABLE SECTION
  ===================================== */

  tableSection: {
    background: "#fff",
    padding: 25,
    borderRadius: 28,
    boxShadow:
      "0 10px 35px rgba(15,23,42,0.06)",
    border:
      "1px solid #e2e8f0",
  },

  sectionTitle: {
    marginBottom: 18,
    fontSize: 24,
    fontWeight: 700,
    color: "#0f172a",
  },

  loading: {
    padding: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#64748b",
  },

  table: {
    width: "100%",
    borderCollapse:
      "separate",
    borderSpacing: "0 14px",
  },

  tableHeaderRow: {
    background:
      "linear-gradient(135deg,#eff6ff,#f8fafc)",
  },

  th: {
    padding: "18px",
    fontWeight: 700,
    color: "#475569",
    textAlign: "left",
    fontSize: 14,
  },

  td: {
    padding: "18px 16px",
    background: "#fff",
    verticalAlign: "middle",
  },

  tableRow: {
    boxShadow:
      "0 5px 18px rgba(0,0,0,0.06)",
    borderRadius: 18,
    transition: "0.3s ease",
  },

  viewBtn: {
    background:
      "linear-gradient(135deg,#2563eb,#3b82f6)",
    color: "#fff",
    border: "none",
    padding: "11px 18px",
    borderRadius: 14,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: 13,
    fontWeight: 700,
    boxShadow:
      "0 6px 15px rgba(37,99,235,0.25)",
  },

  dateBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  /* =====================================
     MODAL
  ===================================== */

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "rgba(15,23,42,0.78)",
    display: "flex",
    justifyContent:
      "center",
    alignItems: "center",
    zIndex: 9999,
    backdropFilter:
      "blur(8px)",
    padding: 20,
  },

  ultraModernModal: {
    width: "95%",
    maxWidth: "1450px",
    background:
      "linear-gradient(135deg,#ffffff,#f8fafc)",
    borderRadius: "30px",
    overflow: "hidden",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.30)",
    position: "relative",
    maxHeight: "95vh",
    overflowY: "auto",
  },

  topSection: {
    display: "grid",
    gridTemplateColumns:
      "1.1fr 1fr",
    gap: "28px",
    padding: "28px",
  },

  imageSection: {
    position: "relative",
  },

  mainImage: {
    width: "100%",
    height: "470px",
    objectFit: "cover",
    borderRadius: "24px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.18)",
  },

  sliderArrow: {
    position: "absolute",
    top: "50%",
    transform:
      "translateY(-50%)",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    background:
      "rgba(255,255,255,0.95)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.25)",
  },

  thumbnailContainer: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
    overflowX: "auto",
    paddingBottom: "5px",
  },

  thumbnail: {
    width: "95px",
    height: "72px",
    objectFit: "cover",
    borderRadius: "14px",
    cursor: "pointer",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.12)",
  },

  noImage: {
    height: "470px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
    borderRadius: "24px",
    color: "#64748b",
    fontSize: "18px",
    fontWeight: 600,
  },

  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  complaintHeader: {
    borderBottom:
      "1px solid #e2e8f0",
    paddingBottom: "16px",
  },

  complaintTitle: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
    color: "#0f172a",
  },

  complaintId: {
    color: "#64748b",
    marginTop: "10px",
    fontSize: "15px",
    fontWeight: 500,
  },

  badgeRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  fullDetailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "18px",
  },

  detailCard: {
    background:
      "linear-gradient(135deg,#ffffff,#f8fafc)",
    borderRadius: "20px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 5px 18px rgba(0,0,0,0.05)",
  },

  detailIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg,#2563eb,#60a5fa)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow:
      "0 6px 15px rgba(37,99,235,0.25)",
  },

  descriptionBox: {
    margin: "0 28px 28px",
    background:
      "linear-gradient(135deg,#ffffff,#f8fafc)",
    padding: "28px",
    borderRadius: "24px",
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 5px 20px rgba(0,0,0,0.05)",
  },

  officerUpdateBox: {
    margin: "0 28px 28px",
    background:
      "linear-gradient(135deg,#eff6ff,#dbeafe)",
    padding: "28px",
    borderRadius: "24px",
    border:
      "1px solid #bfdbfe",
  },

  officerHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  officerText: {
    lineHeight: "1.9",
    color: "#334155",
    fontSize: "15px",
  },

  officerImage: {
    width: "100%",
    maxHeight: "350px",
    objectFit: "cover",
    borderRadius: "18px",
    marginTop: "18px",
  },

  closeBtn: {
    position: "absolute",
    top: "22px",
    right: "22px",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    boxShadow:
      "0 8px 22px rgba(0,0,0,0.18)",
    cursor: "pointer",
    zIndex: 99,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

};

export default DashboardPage;