import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Search,
  Eye,
  X,
  MapPin,
  Calendar,
  User,
  Building2,
  ShieldAlert,
  Edit,
  Save,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  UserCheck,
} from "lucide-react";

/* =========================================================
   PRIORITY COLOR
========================================================= */

const getPriorityColor = (
  priority
) => {

  switch (
    priority?.toLowerCase()
  ) {

    case "urgent":
    case "high":
      return {

        bg: "#fee2e2",

        color:
          "#dc2626",
      };

    case "medium":
      return {

        bg: "#fef3c7",

        color:
          "#d97706",
      };

    default:
      return {

        bg: "#dcfce7",

        color:
          "#16a34a",
      };
  }
};

/* =========================================================
   PAGE
========================================================= */

const SystemEscalatedComplaintsPage = () => {

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    officers,
    setOfficers,
  ] = useState([]);

  const [
    selectedOfficer,
    setSelectedOfficer,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    editMode,
    setEditMode,
  ] = useState(false);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    assigning,
    setAssigning,
  ] = useState(false);

  const [
    editData,
    setEditData,
  ] = useState({

    status: "",

    priority: "",

    adminMessage: "",
  });

  /* =========================================================
     FETCH
  ========================================================= */

  useEffect(() => {

    fetchEscalatedComplaints();

    fetchOfficers();

  }, []);

  /* =========================================================
     FETCH ESCALATED
  ========================================================= */

  const fetchEscalatedComplaints =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await fetch(

            "http://localhost:5000/api/complaints/system/escalated",

            {

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

        if (
          response.ok &&
          data.success
        ) {

          const updated =
            (
              data.complaints ||
              []
            ).map(
              (c) => ({

                ...c,

                priorityColor:
                  getPriorityColor(
                    c.priority
                  ),
              })
            );

          setComplaints(
            updated
          );
        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  /* =========================================================
     FETCH OFFICERS
  ========================================================= */

  const fetchOfficers =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await fetch(

            "http://localhost:5000/api/complaints/officers/all",

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
          response.ok &&
          data.success
        ) {

          setOfficers(
            data.officers || []
          );
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =========================================================
     ASSIGN OFFICER
  ========================================================= */

  const assignOfficer =
    async () => {

      try {

        if (
          !selectedOfficer
        ) {

          return alert(
            "Please select officer"
          );
        }

        setAssigning(true);

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await fetch(

            `http://localhost:5000/api/complaints/officers/assign/${selectedComplaint._id}`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                officerId:
                  selectedOfficer,
              }),
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {

          setComplaints(
            (prev) =>

              prev.map(
                (item) =>

                  item._id ===
                  selectedComplaint._id

                    ? {
                        ...item,

                        ...data.complaint,
                      }

                    : item
              )
          );

          setSelectedComplaint(
            data.complaint
          );

          alert(
            "Officer Assigned Successfully"
          );
        }

      } catch (err) {

        console.log(err);

      } finally {

        setAssigning(false);
      }
    };

  /* =========================================================
     UPDATE COMPLAINT
  ========================================================= */

  const updateComplaint =
    async () => {

      try {

        setUpdating(true);

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await fetch(

            `http://localhost:5000/api/complaints/system/update/${selectedComplaint._id}`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                status:
                  editData.status,

                priority:
                  editData.priority,

                adminMessage:
                  editData.adminMessage,
              }),
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {

          setComplaints(
            (prev) =>

              prev.map(
                (item) =>

                  item._id ===
                  selectedComplaint._id

                    ? {
                        ...item,

                        ...data.complaint,
                      }

                    : item
              )
          );

          setSelectedComplaint(
            data.complaint
          );

          setEditData({

            status:
              data.complaint
                .status,

            priority:
              data.complaint
                .priority,

            adminMessage:
              data.complaint
                .adminMessage || "",
          });

          setEditMode(false);

          alert(
            "Complaint Updated Successfully"
          );
        }

      } catch (err) {

        console.log(err);

        alert(
          "Update Failed"
        );

      } finally {

        setUpdating(false);
      }
    };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredComplaints =
    complaints.filter(
      (c) =>

        c.issue
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        c.department
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        c.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  /* =========================================================
     DEPARTMENT OFFICERS
  ========================================================= */

  const departmentOfficers =
    officers.filter(
      (o) =>

        o.department
          ?.toLowerCase()
          ?.trim() ===

        selectedComplaint?.department
          ?.toLowerCase()
          ?.trim()
    );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div style={styles.loading}>
        Loading Escalated Complaints...
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (

    <div style={styles.container}>

      {/* =========================================================
         HEADER
      ========================================================= */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Escalated Complaints Dashboard
          </h1>

          <p style={styles.subtitle}>
            System Manager Complaint Control
          </p>

        </div>

        <div style={styles.countBadge}>

          <ShieldAlert
            size={18}
          />

          {
            filteredComplaints.length
          }

          {" "}
          Escalated Cases

        </div>

      </div>

      {/* =========================================================
         SEARCH
      ========================================================= */}

      <div style={styles.searchBox}>

        <Search size={18} />

        <input
          type="text"

          placeholder="Search complaint, department, user..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          style={styles.searchInput}
        />

      </div>

      {/* =========================================================
         GRID
      ========================================================= */}

      <div style={styles.grid}>

        {filteredComplaints.map(
          (complaint) => (

            <div
              key={complaint._id}
              style={styles.card}
            >

              {/* TOP */}

              <div style={styles.cardTop}>

                <div
                  style={{

                    ...styles.priority,

                    background:
                      complaint.priorityColor
                        .bg,

                    color:
                      complaint.priorityColor
                        .color,
                  }}
                >

                  <AlertTriangle
                    size={15}
                  />

                  {
                    complaint.priority
                  }

                </div>

                <div style={styles.status}>

                  {
                    complaint.status
                  }

                </div>

              </div>

              {/* ISSUE */}

              <h3 style={styles.issue}>

                {
                  complaint.issue
                }

              </h3>

              {/* DETAILS */}

              <div style={styles.info}>

                <Building2
                  size={15}
                />

                {
                  complaint.department
                }

              </div>

              <div style={styles.info}>

                <MapPin
                  size={15}
                />

                {
                  complaint.location ||
                  complaint.address
                }

              </div>

              <div style={styles.info}>

                <Calendar
                  size={15}
                />

                {new Date(
                  complaint.createdAt
                ).toLocaleString()}

              </div>

              <div style={styles.info}>

                <User
                  size={15}
                />

                {
                  complaint.name ||
                  "Unknown User"
                }

              </div>

              {/* IMAGE */}

              {(complaint.image ||

                complaint.images
                  ?.length > 0) && (

                <img

                  src={
                    complaint.image

                      ? `http://localhost:5000/uploads/${complaint.image}`

                      : `http://localhost:5000/uploads/${complaint.images[0]
                          .replace(/\\/g, "/")
                          .replace("uploads/", "")}`
                  }

                  alt="complaint"

                  style={styles.image}

                  onError={(e) => {

                    e.target.src =
                      "https://via.placeholder.com/400x250?text=Image+Not+Found";
                  }}
                />
              )}

              {/* BUTTON */}

              <div style={styles.actions}>

                <button

                  style={
                    styles.viewBtn
                  }

                  onClick={() => {

                    setSelectedComplaint(
                      complaint
                    );

                    setEditData({

                      status:
                        complaint.status,

                      priority:
                        complaint.priority,

                      adminMessage:
                        complaint.adminMessage || "",
                    });
                  }}
                >

                  <Eye size={16} />

                  View Details

                </button>

              </div>

            </div>
          )
        )}

      </div>

      {/* =========================================================
         MODAL
      ========================================================= */}

      {selectedComplaint && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            {/* HEADER */}

            <div style={styles.modalHeader}>

              <div>

                <h2>
                  Complaint Details
                </h2>

                <p style={styles.modalId}>

                  Complaint ID:
                  {" "}

                  {
                    selectedComplaint.complaintId
                  }

                </p>

              </div>

              <button

                style={
                  styles.closeBtn
                }

                onClick={() => {

                  setSelectedComplaint(
                    null
                  );

                  setEditMode(false);
                }}
              >

                <X size={22} />

              </button>

            </div>

            {/* BODY */}

            <div style={styles.modalBody}>

              {/* LEFT */}

              <div style={styles.left}>

                {/* USER */}

                <div style={styles.section}>

                  <h3 style={styles.sectionTitle}>
                    User Information
                  </h3>

                  <InfoRow
                    icon={<User size={16} />}
                    label="Name"
                    value={selectedComplaint.name}
                  />

                  <InfoRow
                    icon={<Mail size={16} />}
                    label="Email"
                    value={selectedComplaint.email}
                  />

                  <InfoRow
                    icon={<Phone size={16} />}
                    label="Phone"
                    value={selectedComplaint.phone}
                  />

                </div>

                {/* COMPLAINT */}

                <div style={styles.section}>

                  <h3 style={styles.sectionTitle}>
                    Complaint Information
                  </h3>

                  <InfoRow
                    icon={<AlertTriangle size={16} />}
                    label="Issue"
                    value={selectedComplaint.issue}
                  />

                  <InfoRow
                    icon={<Building2 size={16} />}
                    label="Department"
                    value={selectedComplaint.department}
                  />

                  <InfoRow
                    icon={<MapPin size={16} />}
                    label="Location"
                    value={
                      selectedComplaint.location ||
                      selectedComplaint.address
                    }
                  />

                  <InfoRow
                    icon={<Clock size={16} />}
                    label="Status"
                    value={selectedComplaint.status}
                  />

                  <InfoRow
                    icon={<CheckCircle size={16} />}
                    label="Officer Remark"
                    value={
                      selectedComplaint.officerRemark ||
                      "No update"
                    }
                  />

                </div>

                {/* HISTORY */}

                <div style={styles.section}>

                  <h3 style={styles.sectionTitle}>
                    Complaint Timeline
                  </h3>

                  {selectedComplaint.history
                    ?.length > 0 ? (

                    selectedComplaint.history.map(
                      (
                        item,
                        index
                      ) => (

                        <TimelineItem

                          key={index}

                          color="#2563eb"

                          title={item.status}

                          time={`${item.updatedBy} • ${new Date(
                            item.updatedAt
                          ).toLocaleString()}`}
                        />
                      )
                    )

                  ) : (

                    <p>
                      No History
                    </p>
                  )}

                </div>

              </div>

              {/* RIGHT */}

              <div style={styles.right}>

                {/* IMAGE */}

                <div style={styles.imageBox}>

                  <h3 style={styles.sectionTitle}>
                    Complaint Image
                  </h3>

                  <img

                    src={
                      selectedComplaint.image

                        ? `http://localhost:5000/uploads/${selectedComplaint.image}`

                        : selectedComplaint.images?.[0]

                        ? `http://localhost:5000/uploads/${selectedComplaint.images[0]
                            .replace(/\\/g, "/")
                            .replace("uploads/", "")}`

                        : "https://via.placeholder.com/400x300?text=No+Image"
                    }

                    alt="Complaint"

                    style={styles.modalImage}
                  />

                </div>

                {/* ASSIGN */}

                <div style={styles.section}>

                  <h3 style={styles.sectionTitle}>
                    Assign Officer
                  </h3>

                  <select

                    value={
                      selectedOfficer
                    }

                    onChange={(e) =>
                      setSelectedOfficer(
                        e.target.value
                      )
                    }

                    style={styles.input}
                  >

                    <option value="">
                      Select Officer
                    </option>

                    {departmentOfficers.map(
                      (officer) => (

                        <option

                          key={
                            officer._id
                          }

                          value={
                            officer._id
                          }
                        >

                          {
                            officer.fullName
                          }

                          {" - "}

                          {
                            officer.designation
                          }

                        </option>
                      )
                    )}

                  </select>

                  <button

                    style={
                      styles.assignBtn
                    }

                    onClick={
                      assignOfficer
                    }
                  >

                    {
                      assigning

                        ? "Assigning..."

                        : "Assign Officer"
                    }

                  </button>

                </div>

                {/* UPDATE */}

                <div style={styles.section}>

                  <h3 style={styles.sectionTitle}>
                    Manage Complaint
                  </h3>

                  {/* STATUS */}

                  <div style={styles.field}>

                    <label>
                      Status
                    </label>

                    <select

                      disabled={
                        !editMode
                      }

                      value={
                        editData.status
                      }

                      onChange={(e) =>
                        setEditData({

                          ...editData,

                          status:
                            e.target
                              .value,
                        })
                      }

                      style={
                        styles.input
                      }
                    >

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
                        Rejected
                      </option>

                    </select>

                  </div>

                  {/* PRIORITY */}

                  <div style={styles.field}>

                    <label>
                      Priority
                    </label>

                    <select

                      disabled={
                        !editMode
                      }

                      value={
                        editData.priority
                      }

                      onChange={(e) =>
                        setEditData({

                          ...editData,

                          priority:
                            e.target
                              .value,
                        })
                      }

                      style={
                        styles.input
                      }
                    >

                      <option>
                        High
                      </option>

                      <option>
                        Medium
                      </option>

                      <option>
                        Low
                      </option>

                    </select>

                  </div>

                  {/* ADMIN MESSAGE */}

                  <div style={styles.field}>

                    <label>
                      Admin Message
                    </label>

                    <textarea

                      disabled={
                        !editMode
                      }

                      value={
                        editData.adminMessage
                      }

                      onChange={(e) =>
                        setEditData({

                          ...editData,

                          adminMessage:
                            e.target
                              .value,
                        })
                      }

                      style={
                        styles.textarea
                      }
                    />

                  </div>

                  {/* ACTIONS */}

                  <div style={styles.modalActions}>

                    {!editMode ? (

                      <button

                        style={
                          styles.editBtn
                        }

                        onClick={() =>
                          setEditMode(true)
                        }
                      >

                        <Edit size={16} />

                        Edit Complaint

                      </button>

                    ) : (

                      <button

                        style={
                          styles.saveBtn
                        }

                        onClick={
                          updateComplaint
                        }
                      >

                        <Save size={16} />

                        {
                          updating

                            ? "Updating..."

                            : "Save Changes"
                        }

                      </button>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* =========================================================
   INFO ROW
========================================================= */

const InfoRow = ({
  icon,
  label,
  value,
}) => (

  <div style={styles.infoRow}>

    <div style={styles.infoLabel}>

      {icon}

      {label}

    </div>

    <div style={styles.infoValue}>
      {value || "N/A"}
    </div>

  </div>
);

/* =========================================================
   TIMELINE
========================================================= */

const TimelineItem = ({
  color,
  title,
  time,
}) => (

  <div style={styles.timelineItem}>

    <div
      style={{
        ...styles.timelineDot,

        background:
          color,
      }}
    />

    <div>

      <p style={styles.timelineTitle}>
        {title}
      </p>

      <small style={styles.timelineTime}>
        {time}
      </small>

    </div>

  </div>
);

/* =========================================================
   STYLES
========================================================= */

const styles = {

  container: {

    padding: 30,

    background:
      "#f3f4f6",

    minHeight:
      "100vh",
  },

  loading: {

    padding: 50,

    textAlign:
      "center",

    fontSize: 20,
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom: 25,
  },

  title: {

    fontSize: 30,

    fontWeight: 700,
  },

  subtitle: {

    color: "#6b7280",

    marginTop: 5,
  },

  countBadge: {

    background:
      "#dc2626",

    color: "#fff",

    padding:
      "12px 18px",

    borderRadius: 14,

    display: "flex",

    gap: 10,

    alignItems:
      "center",

    fontWeight: 600,
  },

  searchBox: {

    background: "#fff",

    padding:
      "14px 18px",

    borderRadius: 14,

    display: "flex",

    gap: 10,

    alignItems:
      "center",

    marginBottom: 25,
  },

  searchInput: {

    border: "none",

    outline: "none",

    flex: 1,

    fontSize: 15,
  },

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(340px,1fr))",

    gap: 22,
  },

  card: {

    background: "#fff",

    padding: 18,

    borderRadius: 18,

    transition:
      "0.2s",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.06)",
  },

  cardTop: {

    display: "flex",

    justifyContent:
      "space-between",

    marginBottom: 12,
  },

  priority: {

    padding:
      "6px 12px",

    borderRadius: 10,

    display: "flex",

    gap: 6,

    alignItems:
      "center",

    fontSize: 13,

    fontWeight: 600,
  },

  status: {

    background:
      "#dbeafe",

    color:
      "#1d4ed8",

    padding:
      "6px 12px",

    borderRadius: 10,

    fontSize: 13,

    fontWeight: 600,
  },

  issue: {

    marginBottom: 15,
  },

  info: {

    display: "flex",

    gap: 8,

    alignItems:
      "center",

    marginBottom: 8,

    color: "#4b5563",

    fontSize: 14,
  },

  image: {

    width: "100%",

    height: 220,

    objectFit:
      "cover",

    borderRadius: 14,

    marginTop: 15,
  },

  actions: {

    marginTop: 18,

    display: "flex",

    justifyContent:
      "flex-end",
  },

  viewBtn: {

    background:
      "#111827",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

    borderRadius: 10,

    cursor: "pointer",

    display: "flex",

    gap: 8,

    alignItems:
      "center",
  },

  modalOverlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.55)",

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    zIndex: 999,
  },

  modal: {

    background: "#fff",

    width: "95%",

    maxWidth: 1250,

    borderRadius: 22,

    padding: 24,

    maxHeight: "95vh",

    overflowY:
      "auto",
  },

  modalHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom: 20,
  },

  modalId: {

    color: "#6b7280",

    marginTop: 5,
  },

  closeBtn: {

    background:
      "transparent",

    border: "none",

    cursor: "pointer",
  },

  modalBody: {

    display: "flex",

    gap: 20,
  },

  left: {

    flex: 1,

    display: "flex",

    flexDirection:
      "column",

    gap: 20,
  },

  right: {

    width: 420,

    display: "flex",

    flexDirection:
      "column",

    gap: 20,
  },

  section: {

    background:
      "#f9fafb",

    padding: 18,

    borderRadius: 16,

    border:
      "1px solid #e5e7eb",
  },

  sectionTitle: {

    marginBottom: 18,

    fontSize: 18,

    fontWeight: 700,
  },

  infoRow: {

    marginBottom: 14,
  },

  infoLabel: {

    display: "flex",

    gap: 8,

    alignItems:
      "center",

    fontWeight: 600,

    color: "#374151",

    marginBottom: 4,
  },

  infoValue: {

    color: "#111827",
  },

  imageBox: {

    background: "#fff",

    borderRadius: 16,

    padding: 16,

    border:
      "1px solid #e5e7eb",
  },

  modalImage: {

    width: "100%",

    height: 320,

    objectFit:
      "cover",

    borderRadius: 14,
  },

  field: {

    marginBottom: 16,
  },

  input: {

    width: "100%",

    padding: 12,

    borderRadius: 10,

    border:
      "1px solid #d1d5db",

    marginTop: 6,
  },

  textarea: {

    width: "100%",

    minHeight: 120,

    padding: 14,

    borderRadius: 12,

    border:
      "1px solid #d1d5db",

    marginTop: 8,

    resize:
      "vertical",

    outline: "none",
  },

  assignBtn: {

    width: "100%",

    marginTop: 15,

    background:
      "#2563eb",

    color: "#fff",

    border: "none",

    padding: "12px",

    borderRadius: 10,

    cursor: "pointer",

    fontWeight: 600,
  },

  modalActions: {

    marginTop: 20,

    display: "flex",

    justifyContent:
      "flex-end",
  },

  editBtn: {

    background:
      "#2563eb",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

    borderRadius: 10,

    cursor: "pointer",

    display: "flex",

    gap: 8,

    alignItems:
      "center",
  },

  saveBtn: {

    background:
      "#16a34a",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

    borderRadius: 10,

    cursor: "pointer",

    display: "flex",

    gap: 8,

    alignItems:
      "center",
  },

  timelineItem: {

    display: "flex",

    gap: 12,

    marginBottom: 18,
  },

  timelineDot: {

    width: 14,

    height: 14,

    borderRadius:
      "50%",

    marginTop: 5,
  },

  timelineTitle: {

    fontWeight: 600,
  },

  timelineTime: {

    color: "#6b7280",
  },
};

export default SystemEscalatedComplaintsPage;