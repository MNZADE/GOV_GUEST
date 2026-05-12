import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle,
  Clock,
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
} from "lucide-react";

const SystemEscalatedComplaintsPage = () => {

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedComplaint,
    setSelectedComplaint] =
    useState(null);

  const [editMode,
    setEditMode] =
    useState(false);

  const [editData,
    setEditData] =
    useState({});

  /* ================= FETCH ================= */

  useEffect(() => {

    fetchEscalatedComplaints();

  }, []);

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

        console.log(
          "Escalated Complaints:",
          data
        );

        if (
          response.ok &&
          data.success
        ) {

          setComplaints(
            data.complaints || []
          );
        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  /* ================= UPDATE ================= */

  const updateComplaint =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await fetch(

            `http://localhost:5000/api/complaints/${selectedComplaint._id}`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify(
                editData
              ),
            }
          );

        const data =
          await response.json();

        if (
          response.ok
        ) {

          alert(
            "Complaint Updated Successfully"
          );

          setEditMode(false);

          fetchEscalatedComplaints();

          setSelectedComplaint({
            ...selectedComplaint,
            ...editData,
          });
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* ================= FILTER ================= */

  const filteredComplaints =
    complaints.filter((c) =>

      c.issue
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||

      c.department
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div style={styles.loading}>
        Loading Escalated Complaints...
      </div>
    );
  }

  return (

    <div style={styles.container}>

      {/* ================= HEADER ================= */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            System Manager Escalated Complaints
          </h1>

          <p style={styles.subtitle}>
            All Department Escalated Complaints
          </p>

        </div>

        <div style={styles.countBadge}>

          <ShieldAlert size={18} />

          {filteredComplaints.length}
          {" "}
          Escalated Complaints

        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div style={styles.searchBox}>

        <Search size={18} />

        <input
          type="text"

          placeholder="Search complaint..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          style={styles.searchInput}
        />

      </div>

      {/* ================= GRID ================= */}

      <div style={styles.grid}>

        {filteredComplaints.map(
          (complaint) => (

            <div
              key={complaint._id}
              style={styles.card}
            >

              <div style={styles.cardTop}>

                <div style={styles.priority}>

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

              <h3 style={styles.issue}>

                {complaint.issue}

              </h3>

              <div style={styles.info}>

                <Building2 size={15} />

                {
                  complaint.department
                }

              </div>

              <div style={styles.info}>

                <MapPin size={15} />

                {
                  complaint.location
                }

              </div>

              <div style={styles.info}>

                <Calendar size={15} />

                {new Date(
                  complaint.createdAt
                ).toLocaleString()}

              </div>

              <div style={styles.info}>

                <User size={15} />

                {
                  complaint.name
                }

              </div>

              {/* IMAGE */}

              {complaint.images &&
                complaint.images
                  .length > 0 && (

                <img
                  src={`http://localhost:5000/${complaint.images[0]}`}

                  alt="complaint"

                  style={styles.image}
                />
              )}

              {/* ACTIONS */}

              <div style={styles.actions}>

                <button
                  style={
                    styles.viewBtn
                  }

                  onClick={() => {

                    setSelectedComplaint(
                      complaint
                    );

                    setEditData(
                      complaint
                    );
                  }}
                >

                  <Eye size={16} />

                  View

                </button>

              </div>

            </div>
          )
        )}

      </div>

      {/* ================= MODAL ================= */}

      {selectedComplaint && (

        <div style={styles.modalOverlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <h2>
                Complaint Details
              </h2>

              <button
                onClick={() =>
                  setSelectedComplaint(
                    null
                  )
                }

                style={
                  styles.closeBtn
                }
              >

                <X size={20} />

              </button>

            </div>

            {/* ISSUE */}

            <div style={styles.field}>

              <label>
                Issue
              </label>

              <input
                type="text"

                value={
                  editData.issue || ""
                }

                disabled={
                  !editMode
                }

                onChange={(e) =>
                  setEditData({

                    ...editData,

                    issue:
                      e.target
                        .value,
                  })
                }

                style={
                  styles.input
                }
              />

            </div>

            {/* STATUS */}

            <div style={styles.field}>

              <label>
                Status
              </label>

              <select

                value={
                  editData.status || ""
                }

                disabled={
                  !editMode
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

                value={
                  editData.priority || ""
                }

                disabled={
                  !editMode
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

            {/* BUTTONS */}

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

                  Save Changes

                </button>
              )}

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
    background: "#f3f4f6",
    minHeight: "100vh",
  },

  loading: {
    padding: 50,
    textAlign: "center",
    fontSize: 20,
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
  },

  subtitle: {
    color: "#6b7280",
  },

  countBadge: {
    background: "#dc2626",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 12,
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontWeight: 600,
  },

  searchBox: {
    background: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
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
      "repeat(auto-fit,minmax(320px,1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    padding: 18,
    borderRadius: 14,
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
    background: "#fee2e2",
    color: "#dc2626",
    padding: "6px 10px",
    borderRadius: 8,
    display: "flex",
    gap: 6,
    alignItems: "center",
    fontSize: 13,
    fontWeight: 600,
  },

  status: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
  },

  issue: {
    marginBottom: 14,
  },

  info: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },

  image: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    borderRadius: 12,
    marginTop: 12,
  },

  actions: {
    marginTop: 15,
    display: "flex",
    justifyContent: "flex-end",
  },

  viewBtn: {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent:
      "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    background: "#fff",
    width: 500,
    padding: 24,
    borderRadius: 18,
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },

  field: {
    marginBottom: 18,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border:
      "1px solid #d1d5db",
    marginTop: 6,
  },

  modalActions: {
    display: "flex",
    justifyContent:
      "flex-end",
    marginTop: 20,
  },

  editBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  saveBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
};

export default SystemEscalatedComplaintsPage;