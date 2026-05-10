import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Eye,
  X,
} from "lucide-react";

/* ================= COMPONENTS ================= */

const StatCard = ({ icon, label, value }) => (
  <div style={styles.card}>
    <div style={styles.iconBox}>{icon}</div>
    <div>
      <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>{label}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  </div>
);

const Badge = ({ text }) => {
  const colors = {
    Urgent: "#dc2626",
    Escalated: "#f97316",
    Resolved: "#16a34a",
    Pending: "#f59e0b",
    "In Progress": "#1e3a8a",
    Normal: "#475569",
  };

  const color = colors[text] || "#475569";

  return (
    <span style={{
      background: `${color}20`,
      color,
      padding: "6px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
    }}>
      {text}
    </span>
  );
};

/* ================= MAIN ================= */

const DashboardPage = ({ departmentName = "Water Department" }) => {

  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [, setTick] = useState(0);

  /* 🔥 FETCH FROM BACKEND */
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/complaints/manager/department",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.success) {
          setComplaints(data.complaints);
        }

      } catch (err) {
        console.error(err);
      }
    };

    fetchComplaints();
  }, []);

  /* FORMAT DATE */
  const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* SLA REFRESH */
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /* FILTER */
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      (c.issue || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.complaintId || "").includes(search);

    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  /* SLA */
  const getSLA = (createdAt, status) => {
    const hours =
      (Date.now() - new Date(createdAt)) / (1000 * 60 * 60);

    if (status === "Resolved")
      return { label: "Resolved", color: "#16a34a" };

    if (hours > 48)
      return { label: "Escalated", color: "#dc2626" };

    if (hours > 24)
      return { label: "Warning", color: "#f59e0b" };

    return { label: "Normal", color: "#1e3a8a" };
  };

  return (
    <div style={{ padding: 20, backgroundColor: '#f9fafb', minHeight: '100vh' }}>

      <div style={styles.header}>
        <h2>{departmentName} – Command Dashboard</h2>
        <p style={styles.subtitle}>
          Real-time monitoring & SLA governance control
        </p>
      </div>

      <div style={styles.grid}>
        <StatCard icon={<TrendingUp size={24} />} label="Total" value={complaints.length} />
        <StatCard icon={<Clock size={24} />} label="Pending" value={complaints.filter(c => c.status === "Pending").length} />
        <StatCard icon={<AlertTriangle size={24} />} label="Escalated" value={complaints.filter(c => c.priority === "Escalated").length} />
        <StatCard icon={<CheckCircle size={24} />} label="Resolved" value={complaints.filter(c => c.status === "Resolved").length} />
      </div>

      <div style={styles.filterSection}>
        <div style={styles.searchBox}>
          <Search size={18} />
          <input
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={styles.select}>
          <option>All</option>
          <option>Normal</option>
          <option>Urgent</option>
          <option>Escalated</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>Complaint List</h3>

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Complaint</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>SLA</th>
              <th style={styles.th}>Created At</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => {
              const sla = getSLA(c.createdAt, c.status);

              return (
                <tr key={c._id} style={styles.tableRow}>
                  <td style={styles.td}>{c.complaintId}</td>

                  <td style={{ ...styles.td, textAlign: "left" }}>
                    {c.issue}
                  </td>

                  <td style={styles.td}><Badge text={c.priority} /></td>
                  <td style={styles.td}><Badge text={c.status} /></td>

                  <td style={styles.td}>
                    <span style={{
                      background: `${sla.color}20`,
                      color: sla.color,
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {sla.label}
                    </span>
                  </td>

                  <td style={styles.td}>
                    {formatDateTime(c.createdAt)}
                  </td>

                  <td style={styles.td}>
                    <button
                      style={styles.viewBtn}
                      onClick={() => setSelectedComplaint(c)}
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL (MODERN + IMAGES) */}
      {selectedComplaint && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            <div style={styles.modalHeader}>
              <h3>Complaint Details</h3>
              <X size={20} onClick={() => setSelectedComplaint(null)} />
            </div>

            <div style={styles.detailsGrid}>
              <div>
                <label>ID</label>
                <p>{selectedComplaint.complaintId}</p>
              </div>

              <div>
                <label>Created At</label>
                <p>{formatDateTime(selectedComplaint.createdAt)}</p>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label>Title</label>
                <p>{selectedComplaint.issue}</p>
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label>Description</label>
                <p>{selectedComplaint.description}</p>
              </div>
            </div>

            <div style={styles.imageSlider}>
              {(selectedComplaint.images || []).map((img, i) => (
                <img key={i} src={img} style={styles.imageCard} />
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};


/* ================= STYLES (Top Level) ================= */

const styles = {
  header: { marginBottom: 30 },
  subtitle: { color: "#64748b" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 30,
  },

  card: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 14,
    display: "flex",
    gap: 15,
    alignItems: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    background: "#0b1f3a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  filterSection: {
    display: "flex",
    gap: 15,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  input: { border: "none", outline: "none" },

  select: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    cursor: "pointer",
  },

  tableSection: {
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 8px 25px rgba(0,0,0,0.04)",
    overflowX: "auto",
  },

  sectionTitle: { marginBottom: 15 },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
    tableLayout: "fixed",
  },

  tableHeaderRow: {
    background: "#f1f5f9",
  },

  th: {
    padding: "14px 16px",
    fontWeight: 600,
    color: "#475569",
    borderBottom: "2px solid #e2e8f0",
    textAlign: "center",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
    textAlign: "center",
    verticalAlign: "middle",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  tableRow: {
    transition: "0.2s",
  },

  viewBtn: {
    background: "#0b1f3a",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    width: "90%",
    maxWidth: 500,
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 15,
    marginBottom: 20,
  },

  badge: {
    padding: "6px 12px",
    borderRadius: 20,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  },

  imageSection: {
    marginTop: 10,
  },

  imageSlider: {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingTop: 10,
  },

  imageCard: {
    width: 120,
    height: 120,
    objectFit: "cover",
    borderRadius: 10,
    cursor: "pointer",
    flexShrink: 0,
    transition: "0.3s",
  },
};

export default DashboardPage;

//import React, { useState, useEffect } from "react";
// import {
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   TrendingUp,
//   Search,
//   Eye,
//   X,
// } from "lucide-react";

// const BASE_URL = "http://localhost:5000/api";

// const DashboardPage = ({ departmentName = "Water Department" }) => {

//   const [complaints, setComplaints] = useState([]);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [priorityFilter, setPriorityFilter] = useState("All");
//   const [selectedComplaint, setSelectedComplaint] = useState(null);
//   const [, setTick] = useState(0);

//   /* ================= FETCH ================= */
//   const fetchComplaints = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const user = JSON.parse(localStorage.getItem("user"));

//       if (!token || !user) {
//         console.error("No token/user");
//         return;
//       }

//       const endpoint =
//         user.role === "system_manager"
//           ? "/complaints/system/all"
//           : "/complaints/manager/department";

//       const res = await fetch(BASE_URL + endpoint, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();

//       console.log("API RESPONSE:", data);

//       if (data.success && Array.isArray(data.complaints)) {
//         setComplaints(data.complaints);
//       } else {
//         setComplaints([]);
//       }

//     } catch (err) {
//       console.error("Fetch Error:", err);
//       setComplaints([]);
//     }
//   };

//   useEffect(() => {
//     fetchComplaints();
//   }, []);

//   /* ================= AUTO REFRESH ================= */
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTick((prev) => prev + 1);
//       fetchComplaints();
//     }, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   /* ================= UPDATE STATUS ================= */
//   const updateStatus = async (id, newStatus) => {
//     try {
//       const token = localStorage.getItem("token");

//       await fetch(`${BASE_URL}/complaints/manager/update/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       fetchComplaints();

//     } catch (err) {
//       console.error("Update Error:", err);
//     }
//   };

//   /* ================= FILTER ================= */
//   const filteredComplaints = complaints.filter((c) => {
//     const text = (c.issue || "").toLowerCase();

//     const matchesSearch =
//       text.includes(search.toLowerCase()) ||
//       (c.complaintId || "").toLowerCase().includes(search.toLowerCase());

//     const matchesStatus =
//       statusFilter === "All" || c.status === statusFilter;

//     const matchesPriority =
//       priorityFilter === "All" || c.priority === priorityFilter;

//     return matchesSearch && matchesStatus && matchesPriority;
//   });

//   /* ================= STATS ================= */
//   const total = complaints.length;
//   const pending = complaints.filter((c) => c.status === "Pending").length;
//   const resolved = complaints.filter((c) => c.status === "Resolved").length;
//   const escalated = complaints.filter((c) => c.priority === "Escalated").length;

//   /* ================= SLA ================= */
//   const getSLA = (createdAt, status) => {
//     const hours =
//       (Date.now() - new Date(createdAt)) / (1000 * 60 * 60);

//     if (status === "Resolved")
//       return { label: "Resolved", color: "#16a34a" };

//     if (hours > 48)
//       return { label: "Escalated", color: "#dc2626" };

//     if (hours > 24)
//       return { label: "Warning", color: "#f59e0b" };

//     return { label: "Normal", color: "#1e3a8a" };
//   };

//   return (
//     <div>

//       {/* HEADER */}
//       <div style={styles.header}>
//         <h2>{departmentName} – Command Dashboard</h2>
//         <p style={styles.subtitle}>
//           Real-time monitoring & SLA governance control
//         </p>
//       </div>

//       {/* STATS */}
//       <div style={styles.grid}>
//         <StatCard icon={<TrendingUp size={24} />} label="Total" value={total} />
//         <StatCard icon={<Clock size={24} />} label="Pending" value={pending} />
//         <StatCard icon={<AlertTriangle size={24} />} label="Escalated" value={escalated} />
//         <StatCard icon={<CheckCircle size={24} />} label="Resolved" value={resolved} />
//       </div>

//       {/* FILTERS */}
//       <div style={styles.filterSection}>
//         <div style={styles.searchBox}>
//           <Search size={18} />
//           <input
//             placeholder="Search complaints..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             style={styles.input}
//           />
//         </div>

//         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
//           <option>All</option>
//           <option>Pending</option>
//           <option>In Progress</option>
//           <option>Resolved</option>
//         </select>

//         <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={styles.select}>
//           <option>All</option>
//           <option>Normal</option>
//           <option>Urgent</option>
//           <option>Escalated</option>
//         </select>
//       </div>

//       {/* TABLE */}
//       <div style={styles.tableSection}>
//         <h3 style={styles.sectionTitle}>Complaint List</h3>

//         <table style={styles.table}>
//           <thead>
//             <tr style={styles.tableHeaderRow}>
//               <th style={styles.th}>ID</th>
//               <th style={styles.th}>Complaint</th>
//               <th style={styles.th}>Priority</th>
//               <th style={styles.th}>Status</th>
//               <th style={styles.th}>SLA</th>
//               <th style={styles.th}>Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredComplaints.length === 0 ? (
//               <tr>
//                 <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
//                   No complaints found
//                 </td>
//               </tr>
//             ) : (
//               filteredComplaints.map((c) => {
//                 const sla = getSLA(c.createdAt, c.status);

//                 return (
//                   <tr key={c._id} style={styles.tableRow}>
//                     <td style={styles.td}>{c.complaintId}</td>
//                     <td style={styles.td}>{c.issue}</td>

//                     <td style={styles.td}>
//                       <Badge text={c.priority} />
//                     </td>

//                     <td style={styles.td}>
//                       <select
//                         value={c.status}
//                         onChange={(e) =>
//                           updateStatus(c._id, e.target.value)
//                         }
//                         style={styles.select}
//                       >
//                         <option>Pending</option>
//                         <option>In Progress</option>
//                         <option>Resolved</option>
//                       </select>
//                     </td>

//                     <td style={styles.td}>
//                       <span style={{
//                         background: `${sla.color}20`,
//                         color: sla.color,
//                         padding: "6px 12px",
//                         borderRadius: 20,
//                         fontSize: 12,
//                         fontWeight: 600,
//                       }}>
//                         {sla.label}
//                       </span>
//                     </td>

//                     <td style={styles.td}>
//                       <button
//                         style={styles.viewBtn}
//                         onClick={() => setSelectedComplaint(c)}
//                       >
//                         <Eye size={16} /> View
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* MODAL */}
//       {selectedComplaint && (
//         <div style={styles.modalOverlay}>
//           <div style={styles.modal}>
//             <div style={styles.modalHeader}>
//               <h3>Complaint Details</h3>
//               <X onClick={() => setSelectedComplaint(null)} />
//             </div>

//             <p><strong>ID:</strong> {selectedComplaint.complaintId}</p>
//             <p><strong>Title:</strong> {selectedComplaint.issue}</p>
//             <p><strong>Description:</strong> {selectedComplaint.description}</p>
//             <p><strong>Status:</strong> {selectedComplaint.status}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// /* COMPONENTS */
// const StatCard = ({ icon, label, value }) => (
//   <div style={styles.card}>
//     <div style={styles.iconBox}>{icon}</div>
//     <div>
//       <p>{label}</p>
//       <h2>{value}</h2>
//     </div>
//   </div>
// );

// const Badge = ({ text }) => {
//   const colors = {
//     Urgent: "#dc2626",
//     Escalated: "#f97316",
//     Resolved: "#16a34a",
//     Pending: "#f59e0b",
//     "In Progress": "#1e3a8a",
//     Normal: "#475569",
//   };

//   const color = colors[text] || "#475569";

//   return (
//     <span style={{
//       background: `${color}20`,
//       color,
//       padding: "6px 12px",
//       borderRadius: 20,
//       fontSize: 12,
//       fontWeight: 600,
//     }}>
//       {text}
//     </span>
//   );
// };


// /* STYLES */
// const styles = {
//   header: { marginBottom: 30 },
//   subtitle: { color: "#64748b" },

//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
//     gap: 20,
//     marginBottom: 30,
//   },

//   card: {
//     background: "#ffffff",
//     padding: 20,
//     borderRadius: 14,
//     display: "flex",
//     gap: 15,
//     alignItems: "center",
//     boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
//   },

//   iconBox: {
//     width: 50,
//     height: 50,
//     borderRadius: 12,
//     background: "#0b1f3a",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     color: "#fff",
//   },

//   filterSection: {
//     display: "flex",
//     gap: 15,
//     marginBottom: 20,
//   },

//   searchBox: {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     background: "#fff",
//     padding: "8px 12px",
//     borderRadius: 8,
//     boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//   },

//   input: { border: "none", outline: "none" },

//   select: {
//     padding: "8px 12px",
//     borderRadius: 8,
//     border: "1px solid #e2e8f0",
//   },

//   tableSection: {
//     background: "#fff",
//     padding: 20,
//     borderRadius: 16,
//     boxShadow: "0 8px 25px rgba(0,0,0,0.04)",
//   },

//   sectionTitle: { marginBottom: 15 },

//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     fontSize: 14,
//   },

//   tableHeaderRow: {
//     background: "#f1f5f9",
//   },

//   th: {
//     padding: "14px 16px",
//     fontWeight: 600,
//     color: "#475569",
//     borderBottom: "2px solid #e2e8f0",
//   },

//   td: {
//     padding: "14px 16px",
//     borderBottom: "1px solid #f1f5f9",
//   },

//   tableRow: {
//     transition: "0.2s",
//   },

//   viewBtn: {
//     background: "#0b1f3a",
//     color: "#fff",
//     border: "none",
//     padding: "6px 14px",
//     borderRadius: 6,
//     cursor: "pointer",
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 6,
//     fontSize: 13,
//   },

//   modalOverlay: {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//     background: "rgba(0,0,0,0.4)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   modal: {
//     background: "#fff",
//     padding: 30,
//     borderRadius: 12,
//     width: 400,
//   },

//   modalHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 15,
//   },
// };

// export default DashboardPage;