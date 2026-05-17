import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import AddOfficer from "../shared/AddOfficer";

const DRAINAGE_DEPARTMENT =
  "Drainage, Sewage & Garbage Collection Department";

const OfficersManagerPage = () => {

  const [officers, setOfficers] =
    useState([]);

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showAdd, setShowAdd] =
    useState(false);

  const [
    selectedOfficer,
    setSelectedOfficer,
  ] = useState(null);

  /* =========================================
     FETCH DATA
  ========================================= */

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        /* FETCH OFFICERS */

        const officerResponse =
          await axios.get(

            "http://localhost:5000/api/admin/officers",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        /* FETCH COMPLAINTS */

        const complaintResponse =
          await axios.get(

            "http://localhost:5000/api/complaints/manager/drainage",

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        /* FILTER OFFICERS */

        const drainageOfficers =

          officerResponse.data.officers.filter(

            (o) =>

              o.department
                ?.toLowerCase()
                ?.includes(
                  "drainage"
                )
          );

        setOfficers(
          drainageOfficers
        );

        /* FILTER COMPLAINTS */

        const drainageComplaints =

          complaintResponse.data.complaints.filter(

            (c) =>

              c.department
                ?.toLowerCase()
                ?.includes(
                  "drainage"
                )
          );

        setComplaints(
          drainageComplaints
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  /* =========================================
     ASSIGN COMPLAINT
  ========================================= */

  const assignComplaint =
    async (
      complaintId,
      officer
    ) => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        /* ASSIGN COMPLAINT */

        await axios.put(

          `http://localhost:5000/api/complaints/assign/${complaintId}`,

          {

            officerId:
              officer._id,

            officerName:
              officer.name,
          },

          {

            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        /* UPDATE OFFICER STATUS */

        await axios.put(

          `http://localhost:5000/api/admin/officer-status/${officer._id}`,

          {

            status: "Busy",
          },

          {

            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        alert(
          "Complaint Assigned Successfully"
        );

        fetchData();

      } catch (err) {

        console.log(err);

        alert(
          "Assignment Failed"
        );
      }
    };

  /* =========================================
     DELETE OFFICER
  ========================================= */

  const deleteOfficer =
    async (officerId) => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        await axios.delete(

          `http://localhost:5000/api/admin/delete-officer/${officerId}`,

          {

            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        alert(
          "Officer Deleted Successfully"
        );

        fetchData();

      } catch (err) {

        console.log(err);

        alert(
          "Delete Failed"
        );
      }
    };

  /* =========================================
     FILTER SEARCH
  ========================================= */

  const filteredOfficers =
    officers.filter(
      (o) =>

        o.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        o.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  /* =========================================
     ADD OFFICER PAGE
  ========================================= */

  if (showAdd) {

    return (

      <AddOfficer

        department={
          DRAINAGE_DEPARTMENT
        }

        onBack={() => {

          setShowAdd(false);

          fetchData();
        }}
      />
    );
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (

      <div style={styles.loading}>

        Loading Officers...

      </div>
    );
  }

  return (

    <div style={styles.wrapper}>

      {/* HEADER */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>

            🚧 Drainage, Sewage & Garbage Officer Panel

          </h1>

          <p style={styles.subtitle}>

            Smart Drainage & Garbage Complaint Assignment &
            Monitoring System

          </p>

        </div>

      </div>

      {/* TOP ACTIONS */}

      <div style={styles.topActions}>

        <button

          style={styles.addBtn}

          onClick={() =>
            setShowAdd(true)
          }
        >

          + Add Officer

        </button>

      </div>

      {/* SEARCH */}

      <div style={styles.searchRow}>

        <input

          type="text"

          placeholder="Search Officer..."

          value={search}

          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }

          style={styles.searchInput}
        />

      </div>

      {/* OFFICER GRID */}

      <div style={styles.grid}>

        {filteredOfficers.map(
          (officer) => {

            const pendingComplaints =

              complaints.filter(

                (c) =>

                  c.assignedOfficer ===
                    officer.name &&

                  c.status !==
                    "Resolved"
              );

            return (

              <div
                key={officer._id}
                style={styles.card}
              >

                {/* PROFILE */}

                <div style={styles.top}>

                  <div
                    style={
                      styles.avatar
                    }
                  >

                    {officer.name
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>

                  <div>

                    <h2
                      style={
                        styles.name
                      }
                    >

                      {
                        officer.name
                      }

                    </h2>

                    <p
                      style={
                        styles.email
                      }
                    >

                      {
                        officer.email
                      }

                    </p>

                  </div>

                </div>

                {/* DETAILS */}

                <div
                  style={
                    styles.details
                  }
                >

                  <div
                    style={
                      styles.infoBox
                    }
                  >

                    <span>
                      Department
                    </span>

                    <strong>

                      {
                        DRAINAGE_DEPARTMENT
                      }

                    </strong>

                  </div>

                  <div
                    style={
                      styles.infoBox
                    }
                  >

                    <span>
                      Status
                    </span>

                    <strong

                      style={{

                        color:

                          officer.status ===
                          "Available"

                            ? "#16a34a"

                            : "#dc2626",
                      }}
                    >

                      {officer.status ||
                        "Available"}

                    </strong>

                  </div>

                  <div
                    style={
                      styles.infoBox
                    }
                  >

                    <span>
                      Pending Complaints
                    </span>

                    <strong>

                      {
                        pendingComplaints.length
                      }

                    </strong>

                  </div>

                </div>

                {/* ASSIGN SECTION */}

                <div
                  style={
                    styles.assignSection
                  }
                >

                  <h3
                    style={
                      styles.assignTitle
                    }
                  >

                    Assign Complaint

                  </h3>

                  {complaints

                    .filter(
                      (c) =>

                        !c.assignedOfficer &&

                        c.status !==
                          "Resolved"
                    )

                    .slice(0, 5)

                    .map(
                      (
                        complaint
                      ) => (

                        <div

                          key={
                            complaint._id
                          }

                          style={
                            styles.complaintRow
                          }
                        >

                          <div>

                            <strong>

                              {
                                complaint.complaintId
                              }

                            </strong>

                            <p
                              style={
                                styles.issue
                              }
                            >

                              {
                                complaint.issue
                              }

                            </p>

                          </div>

                          <button

                            style={
                              styles.assignBtn
                            }

                            onClick={() =>
                              assignComplaint(
                                complaint._id,
                                officer
                              )
                            }
                          >

                            Assign

                          </button>

                        </div>
                      )
                    )}

                </div>

                {/* ACTION BUTTONS */}

                <div
                  style={
                    styles.actionButtons
                  }
                >

                  <button

                    style={
                      styles.profileBtn
                    }

                    onClick={() =>
                      setSelectedOfficer(
                        officer
                      )
                    }
                  >

                    View Profile

                  </button>

                  <button

                    style={
                      styles.deleteBtn
                    }

                    onClick={() =>
                      deleteOfficer(
                        officer._id
                      )
                    }
                  >

                    Delete

                  </button>

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* PROFILE MODAL */}

      {selectedOfficer && (

        <div style={styles.overlay}>

          <div style={styles.profileModal}>

            <div style={styles.modalTop}>

              <h2>
                Officer Profile
              </h2>

              <button

                style={
                  styles.closeBtn
                }

                onClick={() =>
                  setSelectedOfficer(
                    null
                  )
                }
              >

                ✕

              </button>

            </div>

            {/* PROFILE */}

            <div
              style={
                styles.profileCenter
              }
            >

              <div
                style={
                  styles.bigAvatar
                }
              >

                {selectedOfficer.name
                  ?.charAt(0)
                  ?.toUpperCase()}

              </div>

              <h2>

                {
                  selectedOfficer.name
                }

              </h2>

              <p>

                {
                  selectedOfficer.email
                }

              </p>

            </div>

            {/* PROFILE DETAILS */}

            <div
              style={
                styles.profileGrid
              }
            >

              <div
                style={
                  styles.profileBox
                }
              >

                <span>
                  Department
                </span>

                <strong>

                  {
                    selectedOfficer.department
                  }

                </strong>

              </div>

              <div
                style={
                  styles.profileBox
                }
              >

                <span>
                  Status
                </span>

                <strong>

                  {
                    selectedOfficer.status ||
                    "Available"
                  }

                </strong>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* =========================================
   STYLES
========================================= */

const styles = {

  wrapper: {

    padding: 40,

    background:
      "linear-gradient(to right,#ecfeff,#f0fdf4)",

    minHeight: "100vh",
  },

  loading: {

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    height: "100vh",

    fontSize: 24,

    fontWeight: 700,
  },

  header: {

    marginBottom: 20,
  },

  title: {

    margin: 0,

    fontSize: 34,

    fontWeight: 800,

    color: "#0f172a",
  },

  subtitle: {

    color: "#64748b",

    marginTop: 10,

    fontSize: 16,
  },

  topActions: {

    marginBottom: 25,
  },

  addBtn: {

    background: "#16a34a",

    color: "#fff",

    border: "none",

    padding: "12px 22px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 700,

    fontSize: 15,
  },

  searchRow: {

    marginBottom: 30,
  },

  searchInput: {

    width: 320,

    padding: 14,

    borderRadius: 14,

    border:
      "1px solid #cbd5e1",

    outline: "none",

    fontSize: 15,

    background: "#fff",
  },

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(350px,1fr))",

    gap: 25,
  },

  card: {

    background: "#fff",

    borderRadius: 24,

    padding: 25,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",

    border:
      "1px solid #e2e8f0",
  },

  top: {

    display: "flex",

    alignItems: "center",

    gap: 16,

    marginBottom: 24,
  },

  avatar: {

    width: 70,

    height: 70,

    borderRadius: "50%",

    background:
      "#0f172a",

    color: "#fff",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    fontSize: 28,

    fontWeight: 700,
  },

  name: {

    margin: 0,

    fontSize: 22,

    fontWeight: 700,
  },

  email: {

    marginTop: 5,

    color: "#64748b",
  },

  details: {

    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: 16,

    marginBottom: 25,
  },

  infoBox: {

    background:
      "#f8fafc",

    padding: 18,

    borderRadius: 16,

    display: "flex",

    flexDirection:
      "column",

    gap: 8,
  },

  assignSection: {

    borderTop:
      "1px solid #e2e8f0",

    paddingTop: 20,
  },

  assignTitle: {

    marginBottom: 16,

    fontSize: 18,
  },

  complaintRow: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    padding: 14,

    borderRadius: 14,

    background:
      "#f8fafc",

    marginBottom: 12,
  },

  issue: {

    marginTop: 4,

    color: "#64748b",

    fontSize: 14,
  },

  assignBtn: {

    background:
      "#0f172a",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

    borderRadius: 10,

    cursor: "pointer",

    fontWeight: 600,
  },

  actionButtons: {

    display: "flex",

    gap: 12,

    marginTop: 20,
  },

  profileBtn: {

    flex: 1,

    background: "#2563eb",

    color: "#fff",

    border: "none",

    padding: "12px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 700,
  },

  deleteBtn: {

    flex: 1,

    background: "#dc2626",

    color: "#fff",

    border: "none",

    padding: "12px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 700,
  },

  overlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.6)",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    zIndex: 999,
  },

  profileModal: {

    width: 500,

    background: "#fff",

    borderRadius: 24,

    padding: 30,
  },

  modalTop: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 25,
  },

  closeBtn: {

    width: 45,

    height: 45,

    border: "none",

    borderRadius: 12,

    background: "#f1f5f9",

    cursor: "pointer",

    fontSize: 18,

    fontWeight: 700,
  },

  profileCenter: {

    textAlign: "center",

    marginBottom: 25,
  },

  bigAvatar: {

    width: 100,

    height: 100,

    borderRadius: "50%",

    background: "#0f172a",

    color: "#fff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    margin: "0 auto 20px",

    fontSize: 40,

    fontWeight: 700,
  },

  profileGrid: {

    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: 20,
  },

  profileBox: {

    background: "#f8fafc",

    padding: 18,

    borderRadius: 16,

    display: "flex",

    flexDirection:
      "column",

    gap: 10,
  },
};

export default OfficersManagerPage;