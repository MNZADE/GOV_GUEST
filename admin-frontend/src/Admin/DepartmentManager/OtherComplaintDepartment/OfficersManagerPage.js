import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

/* =====================================================
   BACKEND URL
===================================================== */

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";

/* =====================================================
   COMPONENT
===================================================== */

const OfficersManagerPage = () => {

  const navigate =
    useNavigate();

  const [
    officers,
    setOfficers,
  ] = useState([]);

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    selectedOfficer,
    setSelectedOfficer,
  ] = useState(null);

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {

    loadData();

  }, []);

  const loadData =
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

        /* =====================================
           FETCH OFFICERS
        ===================================== */

        const officerRes =
          await fetch(

`${BACKEND}/api/officers/all`
          );

        const officerData =
          await officerRes.json();

        /* =====================================
           FILTER DEPARTMENT OFFICERS
        ===================================== */

        const currentDepartment =

          user.department
            ?.toLowerCase()
            ?.replace(
              " department",
              ""
            )
            ?.replace(
              " supply",
              ""
            )
            ?.trim();

        const filteredOfficers =

          officerData.officers.filter(
            (officer) =>

              officer.department
                ?.toLowerCase()
                ?.replace(
                  " department",
                  ""
                )
                ?.replace(
                  " supply",
                  ""
                )
                ?.trim() ===
              currentDepartment
          );

        /* =====================================
           FETCH COMPLAINTS
        ===================================== */

        const complaintRes =
          await fetch(

`${BACKEND}/api/complaints/manager/${user.department}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const complaintData =
          await complaintRes.json();

        if (
          officerData.success
        ) {

          setOfficers(
            filteredOfficers
          );
        }

        if (
          complaintData.success
        ) {

          setComplaints(
            complaintData.complaints
          );
        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  /* =====================================================
     ASSIGN COMPLAINT
  ===================================================== */

  const assignComplaint =
    async () => {

      try {

        if (
          !selectedOfficer ||
          !selectedComplaint
        ) {

          return alert(
            "Select complaint"
          );
        }

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await fetch(

`${BACKEND}/api/officers/assign/${selectedComplaint}`,

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
                  selectedOfficer._id,
              }),
            }
          );

        const data =
          await res.json();

        if (data.success) {

          alert(
            "Complaint Assigned Successfully"
          );

          setSelectedOfficer(
            null
          );

          setSelectedComplaint(
            ""
          );

          loadData();

        } else {

          alert(
            data.message
          );
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =====================================================
     DELETE OFFICER
  ===================================================== */

  const deleteOfficer =
    async (id) => {

      try {

        const confirmDelete =
          window.confirm(

            "Delete Officer?"
          );

        if (
          !confirmDelete
        )
          return;

        const res =
          await fetch(

`${BACKEND}/api/officers/delete/${id}`,

            {
              method:
                "DELETE",
            }
          );

        const data =
          await res.json();

        if (data.success) {

          alert(
            "Officer Deleted"
          );

          loadData();
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =====================================================
     ADD OFFICER PAGE
  ===================================================== */

  const handleAddOfficer =
    () => {

      navigate(
        "/add-officer"
      );
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <div
        style={
          styles.loading
        }
      >
        Loading...
      </div>
    );
  }

  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <div style={styles.container}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Officers Management
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            Manage officers and assign complaints
          </p>

        </div>

        {/* ADD OFFICER */}

        <button

          style={
            styles.addOfficerBtn
          }

          onClick={
            handleAddOfficer
          }
        >
          + Add Officer
        </button>

      </div>

      {/* =====================================================
          OFFICERS GRID
      ===================================================== */}

      <div style={styles.grid}>

        {officers.map(
          (officer) => (

            <div
              key={
                officer._id
              }
              style={styles.card}
            >

              {/* PROFILE */}

              <div
                style={
                  styles.topSection
                }
              >

                <div
                  style={
                    styles.avatar
                  }
                >

                  {
                    officer.fullName?.charAt(
                      0
                    )
                  }

                </div>

                <div>

                  <h3
                    style={
                      styles.name
                    }
                  >
                    {
                      officer.fullName
                    }
                  </h3>

                  <p
                    style={
                      styles.role
                    }
                  >
                    {
                      officer.role
                    }
                  </p>

                </div>

              </div>

              {/* DETAILS */}

              <div
                style={
                  styles.detailsBox
                }
              >

                <div
                  style={
                    styles.detailRow
                  }
                >

                  <span>
                    Department
                  </span>

                  <strong>

                    {
                      officer.department
                    }

                  </strong>

                </div>

                <div
                  style={
                    styles.detailRow
                  }
                >

                  <span>
                    Phone
                  </span>

                  <strong>

                    {
                      officer.phone
                    }

                  </strong>

                </div>

                <div
                  style={
                    styles.detailRow
                  }
                >

                  <span>
                    Assigned Complaint
                  </span>

                  <strong
                    style={{

                      color:
                        "#2563eb",
                    }}
                  >

                    {
                      officer.assignedComplaint ||
                      "None"
                    }

                  </strong>

                </div>

                <div
                  style={
                    styles.detailRow
                  }
                >

                  <span>
                    Status
                  </span>

                  <span
                    style={{

                      ...styles.statusBadge,

                      background:

                        officer.currentStatus ===
                        "Available"

                          ? "#dcfce7"

                          : "#fee2e2",

                      color:

                        officer.currentStatus ===
                        "Available"

                          ? "#16a34a"

                          : "#dc2626",
                    }}
                  >

                    {
                      officer.currentStatus
                    }

                  </span>

                </div>

              </div>

              {/* BUTTONS */}

              <div
                style={
                  styles.buttonWrapper
                }
              >

                <button

                  style={
                    styles.assignBtn
                  }

                  onClick={() =>
                    setSelectedOfficer(
                      officer
                    )
                  }
                >
                  Assign Complaint
                </button>

              </div>

              <div
                style={
                  styles.bottomButtons
                }
              >

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
                  Delete Officer
                </button>

              </div>

            </div>
          )
        )}

      </div>

      {/* =====================================================
          ASSIGN MODAL
      ===================================================== */}

      {selectedOfficer && (

        <div
          style={
            styles.modalOverlay
          }
        >

          <div
            style={
              styles.modal
            }
          >

            <div
              style={
                styles.modalHeader
              }
            >

              <h2>
                Assign Complaint
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

            <div
              style={
                styles.modalContent
              }
            >

              <p>
                Officer:
                {" "}
                <strong>
                  {
                    selectedOfficer.fullName
                  }
                </strong>
              </p>

              {/* SELECT COMPLAINT */}

              <select

                value={
                  selectedComplaint
                }

                onChange={(e) =>
                  setSelectedComplaint(
                    e.target.value
                  )
                }

                style={
                  styles.select
                }
              >

                <option value="">
                  Select Complaint
                </option>

                {complaints

                  .filter(
                    (c) =>
                      c.status ===
                      "Pending"
                  )

                  .map(
                    (
                      complaint
                    ) => (

                      <option

                        key={
                          complaint._id
                        }

                        value={
                          complaint._id
                        }
                      >

                        {
                          complaint.complaintId
                        }

                        {" - "}

                        {
                          complaint.issue
                        }

                      </option>
                    )
                  )}

              </select>

              {/* ASSIGN BUTTON */}

              <button

                style={
                  styles.assignNowBtn
                }

                onClick={
                  assignComplaint
                }
              >
                Assign Now
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/* =====================================================
   STYLES
===================================================== */

const styles = {

  loading: {

    height: "80vh",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    fontSize: 22,

    fontWeight: 700,
  },

  container: {

    padding: 10,
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 30,
  },

  title: {

    margin: 0,

    fontSize: 32,

    fontWeight: 700,

    color: "#0f172a",
  },

  subtitle: {

    marginTop: 8,

    color: "#64748b",

    fontSize: 15,
  },

  addOfficerBtn: {

    background:
      "#2563eb",

    color: "#fff",

    border: "none",

    padding:
      "12px 20px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 700,

    fontSize: 14,
  },

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(340px,1fr))",

    gap: 24,
  },

  card: {

    background: "#fff",

    padding: 24,

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.06)",
  },

  topSection: {

    display: "flex",

    alignItems: "center",

    gap: 18,

    marginBottom: 20,
  },

  avatar: {

    width: 72,

    height: 72,

    borderRadius: "50%",

    background:
      "#dbeafe",

    color: "#2563eb",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    fontSize: 28,

    fontWeight: 700,
  },

  name: {

    margin: 0,

    fontSize: 20,

    fontWeight: 700,

    color: "#0f172a",
  },

  role: {

    marginTop: 6,

    color: "#64748b",

    fontSize: 14,
  },

  detailsBox: {

    background: "#f8fafc",

    borderRadius: 18,

    padding: 18,

    marginBottom: 22,
  },

  detailRow: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 14,

    fontSize: 14,

    color: "#334155",
  },

  statusBadge: {

    padding: "6px 12px",

    borderRadius: 30,

    fontSize: 12,

    fontWeight: 700,
  },

  buttonWrapper: {

    display: "flex",

    gap: 12,

    marginBottom: 12,
  },

  bottomButtons: {

    display: "flex",

    gap: 12,
  },

  assignBtn: {

    flex: 1,

    background: "#2563eb",

    color: "#fff",

    border: "none",

    padding: "12px 18px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
  },

  deleteBtn: {

    flex: 1,

    background: "#dc2626",

    color: "#fff",

    border: "none",

    padding: "12px 18px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
  },

  modalOverlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.45)",

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    zIndex: 999,
  },

  modal: {

    width: 500,

    background: "#fff",

    borderRadius: 24,

    padding: 28,
  },

  modalHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 25,
  },

  closeBtn: {

    border: "none",

    background:
      "#fee2e2",

    color: "#dc2626",

    width: 40,

    height: 40,

    borderRadius: "50%",

    cursor: "pointer",
  },

  modalContent: {

    display: "flex",

    flexDirection:
      "column",

    gap: 20,
  },

  select: {

    width: "100%",

    padding: 14,

    borderRadius: 12,

    border:
      "1px solid #cbd5e1",

    fontSize: 15,
  },

  assignNowBtn: {

    background:
      "#16a34a",

    color: "#fff",

    border: "none",

    padding: 14,

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 700,

    fontSize: 15,
  },
};

export default OfficersManagerPage;