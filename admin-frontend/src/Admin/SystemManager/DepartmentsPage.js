import { useState, useEffect } from "react";

const API = "http://localhost:5000/api/departments";

const DepartmentsPage = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({ name: "", managerId: "" });

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/manager", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.managers)) {
        setUsers(data.managers);
      } else {
        setUsers([]);
      }

    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!form.name || !form.managerId) {
      alert("All fields required");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      let res;

      const payload = {
        name: form.name,
        managerId: form.managerId,
      };

      if (editIndex !== null) {
        const dept = departments[editIndex];

        res = await fetch(`${API}/${dept._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to save department");
        return;
      }

      alert("Department saved successfully ✅");

      await fetchDepartments();

      setShowModal(false);
      setForm({ name: "", managerId: "" });
      setEditIndex(null);

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (index) => {
    const dept = departments[index];

    setForm({
      name: dept.name,
      managerId: dept.manager?._id || "",
    });

    setEditIndex(index);
    setShowModal(true);
  };

  /* ================= DELETE ================= */

  const handleDelete = async (index) => {
    const dept = departments[index];
    const token = localStorage.getItem("token");

    if (!window.confirm("Delete this department?")) return;

    try {
      const res = await fetch(`${API}/${dept._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Delete failed");
        return;
      }

      alert("Department deleted ✅");

      await fetchDepartments();

    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DETAILS VIEW ================= */

  if (selectedDept) {
    const total = selectedDept.solved + selectedDept.pending || 1;
    const solvedPercent = Math.round((selectedDept.solved / total) * 100);

    const complaints = selectedDept.complaints || [];

    const escalatedComplaints = complaints.filter(
      (c) => c.priority === "High" || c.isEscalated
    );

    const urgentComplaints = complaints.filter(
      (c) => c.priority === "High" || c.priority === "Urgent"
    );

    return (
      <div style={styles.container}>
        <button 
          style={{ ...styles.viewBtn, marginBottom: 20, background: "#6b7280" }}
          onClick={() => setSelectedDept(null)}
        >
          ← Back to Departments
        </button>

        <h1 style={styles.pageTitle}>{selectedDept.name}</h1>
        <p style={styles.managerText}><b>Manager:</b> {selectedDept.manager?.name}</p>

        {/* PERFORMANCE OVERVIEW */}
        <div style={styles.performanceCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontWeight: 'bold' }}>Performance Overview</span>
            <span>{solvedPercent}%</span>
          </div>

          <div style={styles.barBg}>
            <div style={{ ...styles.barFill, width: `${solvedPercent}%` }} />
          </div>
        </div>

        {/* ESCALATED COMPLAINTS */}
        <div style={{ marginTop: 30 }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: 10 }}>
            Escalated Complaints ({escalatedComplaints.length})
          </h3>

          {escalatedComplaints.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No escalated complaints</p>
          ) : (
            <div style={styles.grid}>
              {escalatedComplaints.map((c) => (
                <div key={c._id} style={styles.card}>
                  <p><b>{c.title || "Complaint"}</b></p>
                  <p>Status: {c.status}</p>
                  <p>Priority: {c.priority}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* URGENT COMPLAINTS */}
        <div style={{ marginTop: 30 }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: 10 }}>
            Urgent Complaints ({urgentComplaints.length})
          </h3>

          {urgentComplaints.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No urgent complaints</p>
          ) : (
            <div style={styles.grid}>
              {urgentComplaints.map((c) => (
                <div key={c._id} style={styles.card}>
                  <p><b>{c.title || "Complaint"}</b></p>
                  <p>Status: {c.status}</p>
                  <p>Priority: {c.priority}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= MAIN RENDER ================= */

  return (
    <div style={styles.container}>
      <div style={styles.headerBar}>
        <h2 style={styles.headerTitle}>
          Municipal Corporation Kolhapur Division
        </h2>
        <span style={styles.divisionTag}>Administrative Departments</span>
      </div>

      <h1 style={styles.pageTitle}>Municipal Departments</h1>

      <button
        style={{ ...styles.viewBtn, marginBottom: 20, background: "#2563eb" }}
        onClick={() => {
          setShowModal(true);
          setEditIndex(null);
          setForm({ name: "", managerId: "" });
        }}
      >
        + Add Department
      </button>

      <div style={styles.grid}>
        {departments.map((dept, i) => (
          <div key={dept._id} style={styles.card}>
            <h3>{dept.name}</h3>
            <p style={styles.managerText}>👤 {dept.manager?.name}</p>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button style={styles.viewBtn} onClick={() => setSelectedDept(dept)}>
                View
              </button>

              <button
                style={{ ...styles.viewBtn, background: "#f59e0b" }}
                onClick={() => handleEdit(i)}
              >
                Edit
              </button>

              <button
                style={{ ...styles.viewBtn, background: "#dc2626" }}
                onClick={() => handleDelete(i)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.imageOverlay}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 10, width: 300 }}>
            <h3>{editIndex !== null ? "Edit" : "Add"} Department</h3>

            <input
              placeholder="Department Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              style={{ width: "100%", marginTop: 10, padding: 8, boxSizing: 'border-box' }}
            />

            <select
              value={form.managerId}
              onChange={(e) =>
                setForm({ ...form, managerId: e.target.value })
              }
              style={{ width: "100%", marginTop: 10, padding: 8 }}
            >
              <option value="">Select Manager</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
              <button style={styles.viewBtn} onClick={handleSave}>
                Save
              </button>

              <button
                style={{ ...styles.viewBtn, background: "#6b7280" }}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




/* ================= STYLES ================= */

const styles = {
  container: {
    padding: 30,
    background: "#f5f7fa",
    minHeight: "100vh",
  },
  headerBar: {
    background: "#ffffff",
    color: "#111827",
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: 18,
  },
  divisionTag: {
    background: "#f3f4f6",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
  },
  pageTitle: {
    fontSize: 26,
    marginBottom: 10,
    color: "#111827",
  },
  managerText: {
    fontSize: 14,
    color: "#4b5563",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    padding: 22,
    borderRadius: 14,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },
  statsRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10,
  },
  solved: { color: "#16a34a", fontWeight: 600 },
  pending: { color: "#dc2626", fontWeight: 600 },
  backBtn: {
    marginBottom: 20,
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
  },
  performanceCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginTop: 15,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  performanceHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontWeight: 600,
  },
  barBg: {
    height: 10,
    background: "#e5e7eb",
    borderRadius: 6,
  },
  barFill: {
    height: 10,
    background: "#374151",
    borderRadius: 6,
  },
  complaintCard: {
    background: "#fff",
    padding: 18,
    marginTop: 15,
    display: "flex",
    justifyContent: "space-between",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  complaintHeader: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  priorityBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
  },
  smallText: { fontSize: 13, color: "#6b7280" },
  escalation: {
    marginTop: 6,
    fontSize: 12,
    color: "#dc2626",
    fontWeight: 600,
  },
  timelineBox: {
    marginTop: 12,
    paddingLeft: 10,
  },
  timelineItem: {
    display: "flex",
    gap: 10,
    marginTop: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    background: "#374151",
    borderRadius: "50%",
    marginTop: 5,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: 600,
    color: "#111827",
  },
  viewBtn: {
    padding: "6px 14px",
    background: "#374151",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  imageOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: 10,
  },
};

export default DepartmentsPage;








// import { useState } from "react";

// const DepartmentsPage = () => {
//   const [selectedDept, setSelectedDept] = useState(null);
//   const [viewImage, setViewImage] = useState(null);

//   const departments = [
//     {
//       name: "Sanitation & Solid Waste Department",
//       manager: "Mr. Rahul Shinde",
//       solved: 40,
//       pending: 15,
//       complaints: [
//         {
//           id: "SW-201",
//           type: "Garbage not collected",
//           location: "Ward 5",
//           priority: "High",
//           createdHoursAgo: 52,
//           image: "https://via.placeholder.com/400x250?text=Garbage+Overflow",
//           timeline: [
//             { time: "Day 1 - 9:00 AM", action: "Complaint registered" },
//             { time: "Day 2 - 11:00 AM", action: "Assigned to sanitation team" },
//           ],
//         },
//       ],
//     },

//     {
//       name: "Water Supply Department",
//       manager: "Mr. Suresh Pawar",
//       solved: 35,
//       pending: 10,
//       complaints: [
//         {
//           id: "WS-101",
//           type: "No water supply",
//           location: "Ward 8",
//           priority: "High",
//           createdHoursAgo: 30,
//           image: "https://via.placeholder.com/400x250?text=Water+Issue",
//           timeline: [
//             { time: "Day 1 - 7:30 AM", action: "Complaint registered" },
//             { time: "Day 1 - 2:00 PM", action: "Pipeline inspection started" },
//           ],
//         },
//       ],
//     },

//     {
//       name: "Roads & Transportation Department",
//       manager: "Mr. Prakash Jadhav",
//       solved: 28,
//       pending: 18,
//       complaints: [
//         {
//           id: "RT-301",
//           type: "Potholes on road",
//           location: "Ward 3",
//           priority: "Medium",
//           createdHoursAgo: 60,
//           image: "https://via.placeholder.com/400x250?text=Pothole",
//           timeline: [
//             { time: "Day 1 - 10:00 AM", action: "Complaint registered" },
//             { time: "Day 2 - 1:00 PM", action: "Work scheduled" },
//           ],
//         },
//       ],
//     },

//     {
//       name: "Street Light / Electrical Department",
//       manager: "Mr. Anil Deshmukh",
//       solved: 45,
//       pending: 8,
//       complaints: [
//         {
//           id: "EL-401",
//           type: "Street light not working",
//           location: "Ward 10",
//           priority: "Medium",
//           createdHoursAgo: 20,
//           image: "https://via.placeholder.com/400x250?text=Street+Light",
//           timeline: [
//             { time: "Day 1 - 6:00 PM", action: "Complaint registered" },
//             { time: "Day 1 - 9:00 PM", action: "Technician assigned" },
//           ],
//         },
//       ],
//     },

//     {
//       name: "Drainage & Sewerage Department",
//       manager: "Mr. Sunil Kadam",
//       solved: 32,
//       pending: 20,
//       complaints: [
//         {
//           id: "DR-501",
//           type: "Blocked drainage",
//           location: "Ward 6",
//           priority: "High",
//           createdHoursAgo: 48,
//           image: "https://via.placeholder.com/400x250?text=Drainage+Block",
//           timeline: [
//             { time: "Day 1 - 8:00 AM", action: "Complaint registered" },
//             { time: "Day 2 - 12:00 PM", action: "Cleaning team dispatched" },
//           ],
//         },
//       ],
//     },

//     {
//       name: "Health Department",
//       manager: "Dr. Amit Patil",
//       solved: 30,
//       pending: 12,
//       complaints: [
//         {
//           id: "HD-101",
//           type: "Garbage causing health issues",
//           location: "Ward 12",
//           priority: "High",
//           createdHoursAgo: 36,
//           image: "https://via.placeholder.com/400x250?text=Health+Issue",
//           timeline: [
//             { time: "Day 1 - 9:00 AM", action: "Complaint registered" },
//             { time: "Day 2 - 10:00 AM", action: "Assigned to health officer" },
//           ],
//         },
//       ],
//     },

//     {
//       name: "Other Department",
//       manager: "Admin Office",
//       solved: 20,
//       pending: 25,
//       complaints: [
//         {
//           id: "OT-601",
//           type: "Public complaint (miscellaneous)",
//           location: "Ward 2",
//           priority: "Low",
//           createdHoursAgo: 70,
//           image: "https://via.placeholder.com/400x250?text=Other+Issue",
//           timeline: [
//             { time: "Day 1 - 11:00 AM", action: "Complaint registered" },
//             { time: "Day 3 - 3:00 PM", action: "Pending review" },
//           ],
//         },
//       ],
//     },
//   ];

//   const getSLAHours = (priority) => {
//     if (priority === "High") return 24;
//     if (priority === "Medium") return 48;
//     return 72;
//   };

//   const isSLABreached = (c) =>
//     c.createdHoursAgo > getSLAHours(c.priority);

//   /* ================= DETAILS VIEW ================= */

//   if (selectedDept) {
//     const total = selectedDept.solved + selectedDept.pending;
//     const solvedPercent = Math.round(
//       (selectedDept.solved / total) * 100
//     );

//     return (
//       <div style={styles.container}>
//         <div style={styles.headerBar}>
//           <h2 style={styles.headerTitle}>
//             Municipal Corporation Kolhapur Division
//           </h2>
//           <span style={styles.divisionTag}>Department Division</span>
//         </div>

//         <button style={styles.backBtn} onClick={() => setSelectedDept(null)}>
//           ← Back to Departments
//         </button>

//         <h1 style={styles.pageTitle}>{selectedDept.name}</h1>
//         <p style={styles.managerText}>
//           <b>Department Manager:</b> {selectedDept.manager}
//         </p>

//         <div style={styles.performanceCard}>
//           <div style={styles.performanceHeader}>
//             <span>Performance Overview</span>
//             <span>{solvedPercent}% Resolved</span>
//           </div>

//           <div style={styles.barBg}>
//             <div
//               style={{ ...styles.barFill, width: `${solvedPercent}%` }}
//             />
//           </div>
//         </div>

//         <h3 style={{ marginTop: 30 }}>Department Complaints</h3>

//         {selectedDept.complaints.map((c) => {
//           const breached = isSLABreached(c);

//           return (
//             <div
//               key={c.id}
//               style={{
//                 ...styles.complaintCard,
//                 borderLeft: breached
//                   ? "6px solid #dc2626"
//                   : "6px solid #10b981",
//               }}
//             >
//               <div style={{ flex: 1 }}>
//                 <div style={styles.complaintHeader}>
//                   <strong>{c.id}</strong>
//                   <span style={styles.priorityBadge}>{c.priority}</span>
//                 </div>

//                 <div style={styles.smallText}>📍 {c.location}</div>

//                 {breached && (
//                   <div style={styles.escalation}>
//                     ⚠ SLA BREACHED — Escalated to Commissioner
//                   </div>
//                 )}

//                 <div style={styles.timelineBox}>
//                   <b>Activity Timeline</b>
//                   {c.timeline.map((t, i) => (
//                     <div key={i} style={styles.timelineItem}>
//                       <div style={styles.timelineDot}></div>
//                       <div>
//                         <div style={styles.timelineTime}>{t.time}</div>
//                         <div>{t.action}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <button
//                 style={styles.viewBtn}
//                 onClick={() => setViewImage(c.image)}
//               >
//                 View Image
//               </button>
//             </div>
//           );
//         })}

//         {viewImage && (
//           <div style={styles.imageOverlay} onClick={() => setViewImage(null)}>
//             <img src={viewImage} alt="Complaint" style={styles.image} />
//           </div>
//         )}
//       </div>
//     );
//   }

//   /* ================= MAIN LIST ================= */

//   return (
//     <div style={styles.container}>
//       <div style={styles.headerBar}>
//         <h2 style={styles.headerTitle}>
//           Municipal Corporation Kolhapur Division
//         </h2>
//         <span style={styles.divisionTag}>Administrative Departments</span>
//       </div>

//       <h1 style={styles.pageTitle}>Municipal Departments</h1>

//       <div style={styles.grid}>
//         {departments.map((dept, i) => (
//           <div key={i} style={styles.card}>
//             <h3>{dept.name}</h3>
//             <p style={styles.managerText}>👤 {dept.manager}</p>

//             <div style={styles.statsRow}>
//               <span style={styles.solved}>Resolved: {dept.solved}</span>
//               <span style={styles.pending}>Pending: {dept.pending}</span>
//             </div>

//             {/* ✅ VIEW BUTTON ADDED */}
//             <button
//               style={{ ...styles.viewBtn, marginTop: 12 }}
//               onClick={() => setSelectedDept(dept)}
//             >
//               View Details
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// /* ================= UPDATED PROFESSIONAL STYLES ================= */

// const styles = {
//   container: {
//     padding: 30,
//     background: "#f5f7fa",
//     minHeight: "100vh",
//   },

//   headerBar: {
//     background: "#ffffff",
//     color: "#111827",
//     padding: 18,
//     borderRadius: 12,
//     marginBottom: 25,
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
//     border: "1px solid #e5e7eb",
//   },

//   headerTitle: {
//     fontWeight: 700,
//     fontSize: 18,
//   },

//   divisionTag: {
//     background: "#f3f4f6",
//     padding: "6px 14px",
//     borderRadius: 20,
//     fontSize: 12,
//     fontWeight: 600,
//     color: "#374151",
//   },

//   pageTitle: {
//     fontSize: 26,
//     marginBottom: 10,
//     color: "#111827",
//   },

//   managerText: {
//     fontSize: 14,
//     color: "#4b5563",
//   },

//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
//     gap: 20,
//   },

//   card: {
//     background: "#fff",
//     padding: 22,
//     borderRadius: 14,
//     cursor: "pointer",
//     boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
//     transition: "0.2s",
//   },

//   statsRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     marginTop: 10,
//   },

//   solved: { color: "#16a34a", fontWeight: 600 },
//   pending: { color: "#dc2626", fontWeight: 600 },

//   backBtn: {
//     marginBottom: 20,
//     padding: "6px 14px",
//     borderRadius: 6,
//     border: "1px solid #e5e7eb",
//     background: "#fff",
//     cursor: "pointer",
//   },

//   performanceCard: {
//     background: "#fff",
//     padding: 20,
//     borderRadius: 12,
//     marginTop: 15,
//     boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//   },

//   performanceHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     marginBottom: 8,
//     fontWeight: 600,
//   },

//   barBg: {
//     height: 10,
//     background: "#e5e7eb",
//     borderRadius: 6,
//   },

//   barFill: {
//     height: 10,
//     background: "#374151",
//     borderRadius: 6,
//   },

//   complaintCard: {
//     background: "#fff",
//     padding: 18,
//     marginTop: 15,
//     display: "flex",
//     justifyContent: "space-between",
//     borderRadius: 12,
//     boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//   },

//   complaintHeader: {
//     display: "flex",
//     gap: 12,
//     alignItems: "center",
//   },

//   priorityBadge: {
//     background: "#fef3c7",
//     color: "#92400e",
//     padding: "4px 10px",
//     borderRadius: 20,
//     fontSize: 12,
//   },

//   smallText: { fontSize: 13, color: "#6b7280" },

//   escalation: {
//     marginTop: 6,
//     fontSize: 12,
//     color: "#dc2626",
//     fontWeight: 600,
//   },

//   timelineBox: {
//     marginTop: 12,
//     paddingLeft: 10,
//   },

//   timelineItem: {
//     display: "flex",
//     gap: 10,
//     marginTop: 8,
//   },

//   timelineDot: {
//     width: 8,
//     height: 8,
//     background: "#374151",
//     borderRadius: "50%",
//     marginTop: 5,
//   },

//   timelineTime: {
//     fontSize: 12,
//     fontWeight: 600,
//     color: "#111827",
//   },

//   viewBtn: {
//     padding: "6px 14px",
//     background: "#374151",
//     color: "#fff",
//     border: "none",
//     borderRadius: 8,
//     cursor: "pointer",
//   },

//   imageOverlay: {
//     position: "fixed",
//     inset: 0,
//     background: "rgba(0,0,0,0.75)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   image: {
//     maxWidth: "90%",
//     maxHeight: "90%",
//     borderRadius: 10,
//   },
// };

// export default DepartmentsPage;
