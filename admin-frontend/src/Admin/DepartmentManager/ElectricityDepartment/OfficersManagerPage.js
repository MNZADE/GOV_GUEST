import React, {
  useState,
  useEffect,
} from "react";

import AddOfficer from "../shared/AddOfficer";

import { io } from "socket.io-client";

const socket = io(
  "http://localhost:5000"
);

const BACKEND =
  "http://localhost:5000";

const OfficersManagerPage = () => {

  const ELECTRICITY_DEPARTMENT =
    "Electricity Department";

  /* =====================================
     STATES
  ===================================== */

  const [showAdd, setShowAdd] =
    useState(false);

  const [officers, setOfficers] =
    useState([]);

  const [complaints, setComplaints] =
    useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    assigningOfficer,
    setAssigningOfficer,
  ] = useState(null);

  const [
    selectedOfficer,
    setSelectedOfficer,
  ] = useState(null);

  const [timeNow, setTimeNow] =
    useState(new Date());

  /* =====================================
     LIVE CLOCK
  ===================================== */

  useEffect(() => {

    const timer =
      setInterval(() => {

        setTimeNow(new Date());

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  /* =====================================
     INITIAL FETCH
  ===================================== */

  useEffect(() => {

    fetchOfficers();

    fetchComplaints();

  }, []);

  /* =====================================
     SOCKET EVENTS
  ===================================== */

  useEffect(() => {

    socket.on(
      "complaintUpdated",
      () => {

        fetchComplaints();

        fetchOfficers();
      }
    );

    socket.on(
      "newComplaint",
      () => {

        fetchComplaints();
      }
    );

    return () => {

      socket.off(
        "complaintUpdated"
      );

      socket.off(
        "newComplaint"
      );
    };

  }, []);

  /* =====================================
     FETCH OFFICERS
  ===================================== */

  const fetchOfficers =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await fetch(

            `${BACKEND}/api/officers/all`,

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

          const electricityOfficers =
            data.officers.filter(

              (o) =>

                o.department
                  ?.toLowerCase()
                  ?.includes(
                    "electricity"
                  )
            );

          setOfficers(
            electricityOfficers
          );
        }

      } catch (err) {

        console.log(
          "Officer Fetch Error:",
          err
        );
      }
    };

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

              method: "GET",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        console.log(
          "FETCHED COMPLAINTS:",
          data
        );

        if (data.success) {

          const electricityComplaints =

            (data.complaints || [])

              .map((c) => ({

                ...c,

                status:
                  c.status ||
                  "Pending",

                priority:
                  c.priority ||
                  "Normal",

                images:
                  c.images || [],

                subcategories:
                  c.subcategories ||
                  [],

                assignedOfficer:
                  c.assignedOfficer ||
                  "Not Assigned",

                lat:
                  c.lat || "",

                lon:
                  c.lon || "",
              }))

              .sort(
                (a, b) =>

                  new Date(
                    b.createdAt
                  ) -

                  new Date(
                    a.createdAt
                  )
              );

          setComplaints(
            electricityComplaints
          );
        }

      } catch (err) {

        console.log(
          "Fetch Complaint Error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================
     SLA TIMER
  ===================================== */

  const SLA_RULES = {

    Escalated: 6,

    Urgent: 12,

    Normal: 48,
  };

  const getRemainingTime =
    (complaint) => {

      const hours =
        SLA_RULES[
          complaint.priority
        ] || 48;

      const created =
        new Date(
          complaint.createdAt
        );

      const deadline =
        new Date(

          created.getTime() +

            hours *
              60 *
              60 *
              1000
        );

      const diff =
        deadline - timeNow;

      if (diff <= 0)
        return "Overdue";

      const h =
        Math.floor(
          diff /
            (1000 * 60 * 60)
        );

      const m =
        Math.floor(
          (diff /
            (1000 * 60)) %
            60
        );

      return `${h}h ${m}m`;
    };

  /* =====================================
     ASSIGN COMPLAINT
  ===================================== */

  const assignComplaint =
    async (
      complaint,
      officer
    ) => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await fetch(

            `${BACKEND}/api/officers/assign/${complaint.complaintId}`,

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
                  officer._id,
              }),
            }
          );

        const data =
          await res.json();

        console.log(
          "ASSIGN RESPONSE:",
          data
        );

        if (data.success) {

          alert(`

Complaint Assigned Successfully

Officer:
${officer.fullName}

Email Sent:
${officer.email}

Complaint ID:
${complaint.complaintId}
          `);

          await fetchComplaints();

          await fetchOfficers();

          setAssigningOfficer(
            null
          );

        } else {

          alert(
            data.message ||
            "Assignment Failed"
          );
        }

      } catch (err) {

        console.log(
          "Assign Error:",
          err
        );

        alert(
          "Server Error"
        );

      } finally {

        setLoading(false);
      }
    };

  /* =====================================
     DELETE OFFICER
  ===================================== */

  const deleteOfficer =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete Officer?"
        );

      if (!confirmDelete)
        return;

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const res =
          await fetch(

            `${BACKEND}/api/officers/delete/${id}`,

            {

              method: "DELETE",

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await res.json();

        if (data.success) {

          alert(
            "Officer Deleted"
          );

          fetchOfficers();
        }

      } catch (err) {

        console.log(err);
      }
    };

  return (

    <div style={styles.wrapper}>

      {!showAdd ? (

        <>

          {/* HEADER */}

          <div style={styles.header}>

            <div>

              <h2 style={styles.title}>
                ⚡ Electricity Department Officer Panel
              </h2>

              <p style={styles.subtitle}>
                Smart Complaint Assignment System
              </p>

            </div>

            <button
              style={
                styles.primaryBtn
              }
              onClick={() =>
                setShowAdd(true)
              }
            >
              + Add Officer
            </button>

          </div>

          {/* LOADING */}

          {loading && (

            <div style={styles.loading}>
              Loading...
            </div>
          )}

          {/* OFFICERS */}

          <div style={styles.grid}>

            {officers.map(
              (officer) => {

                const assignedComplaint =
                  complaints.find(

                    (c) =>

                      String(
                        c.assignedOfficerId
                      ) ===

                      String(
                        officer._id
                      )
                  );

                return (

                  <div
                    key={
                      officer._id
                    }
                    style={
                      styles.card
                    }
                  >

                    <div
                      style={
                        styles.cardHeader
                      }
                    >

                      <div>

                        <h3>
                          {
                            officer.fullName
                          }
                        </h3>

                        <p
                          style={
                            styles.small
                          }
                        >
                          {
                            officer.designation
                          }
                        </p>

                      </div>

                      <span
                        style={{

                          ...styles.statusBadge,

                          background:
                            assignedComplaint
                              ? "#dc2626"
                              : "#16a34a",
                        }}
                      >

                        {assignedComplaint
                          ? "Busy"
                          : "Available"}

                      </span>

                    </div>

                    {/* COMPLAINT */}

                    {assignedComplaint && (

                      <div
                        style={
                          styles.workBox
                        }
                      >

                        <div
                          style={
                            styles.complaintTop
                          }
                        >

                          <strong>
                            {
                              assignedComplaint.complaintId
                            }
                          </strong>

                          <span
                            style={
                              styles.priorityTag
                            }
                          >
                            {
                              assignedComplaint.priority
                            }
                          </span>

                        </div>

                        <p>

                          <strong>
                            Sub Categories:
                          </strong>

                          {" "}

                          {Array.isArray(
                            assignedComplaint.subcategories
                          )

                            ? assignedComplaint.subcategories.join(
                                ", "
                              )

                            : "-"}

                        </p>

                        <p>

                          <strong>
                            Status:
                          </strong>

                          {" "}

                          {
                            assignedComplaint.status
                          }

                        </p>

                        <p>

                          <strong>
                            SLA:
                          </strong>

                          {" "}

                          {getRemainingTime(
                            assignedComplaint
                          )}

                        </p>

                        {assignedComplaint?.officerUpdatedImage && (

                          <img
                            src={`${BACKEND}/uploads/${assignedComplaint.officerUpdatedImage}`}
                            alt="update"
                            style={
                              styles.image
                            }
                          />
                        )}

                        {assignedComplaint?.lat &&
                          assignedComplaint?.lon && (

                          <a
                            href={`https://www.google.com/maps?q=${assignedComplaint.lat},${assignedComplaint.lon}`}
                            target="_blank"
                            rel="noreferrer"
                            style={
                              styles.mapLink
                            }
                          >
                            View Location
                          </a>
                        )}

                      </div>
                    )}

                    {/* BUTTONS */}

                    <div
                      style={
                        styles.buttonGroup
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
                        Profile Check
                      </button>

                      {!assignedComplaint && (

                        <button

                          disabled={
                            loading
                          }

                          style={{

                            ...styles.assignBtn,

                            opacity:
                              loading
                                ? 0.6
                                : 1,
                          }}

                          onClick={() =>
                            setAssigningOfficer(
                              officer
                            )
                          }
                        >

                          {loading
                            ? "Loading..."
                            : "Assign Complaint"}

                        </button>
                      )}

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

                <h2>
                  Officer Profile
                </h2>

                <p>
                  <strong>Name:</strong>
                  {" "}
                  {
                    selectedOfficer.fullName
                  }
                </p>

                <p>
                  <strong>Email:</strong>
                  {" "}
                  {
                    selectedOfficer.email
                  }
                </p>

                <p>
                  <strong>Phone:</strong>
                  {" "}
                  {
                    selectedOfficer.phone
                  }
                </p>

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
                  Close
                </button>

              </div>

            </div>
          )}

          {/* ASSIGN MODAL */}

          {assigningOfficer && (

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

                <h2>
                  Assign Complaint
                </h2>

                {complaints

                  .filter(
                    (c) =>
                      !c.assignedOfficerId
                  )

                  .map((c) => (

                    <div
                      key={
                        c.complaintId
                      }
                      style={
                        styles.modalRow
                      }
                    >

                      <div>

                        <strong>
                          {
                            c.complaintId
                          }
                        </strong>

                        <p>

                          {Array.isArray(
                            c.subcategories
                          )

                            ? c.subcategories.join(
                                ", "
                              )

                            : "-"}

                        </p>

                        <small>

                          SLA:
                          {" "}

                          {getRemainingTime(
                            c
                          )}

                        </small>

                      </div>

                      <button

                        disabled={
                          loading
                        }

                        style={{

                          ...styles.assignBtn,

                          opacity:
                            loading
                              ? 0.6
                              : 1,
                        }}

                        onClick={() =>
                          assignComplaint(
                            c,
                            assigningOfficer
                          )
                        }
                      >

                        {loading
                          ? "Assigning..."
                          : "Assign"}

                      </button>

                    </div>
                  ))}

                <button
                  style={
                    styles.closeBtn
                  }
                  onClick={() =>
                    setAssigningOfficer(
                      null
                    )
                  }
                >
                  Close
                </button>

              </div>

            </div>
          )}

        </>

      ) : (

        <AddOfficer
          department={
            ELECTRICITY_DEPARTMENT
          }
          onBack={() =>
            setShowAdd(false)
          }
        />

      )}

    </div>
  );
};

/* =====================================
   STYLES
===================================== */

const styles = {

  wrapper: {

    padding: 40,

    background:
      "linear-gradient(to right,#eef2ff,#f8fafc)",

    minHeight: "100vh",
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom: 40,
  },

  title: {

    margin: 0,

    fontSize: 30,

    fontWeight: "bold",

    color: "#1e293b",
  },

  subtitle: {

    color: "#4338ca",

    marginTop: 6,
  },

  loading: {

    marginBottom: 20,

    fontWeight: "bold",
  },

  primaryBtn: {

    background: "#4338ca",

    color: "#fff",

    border: "none",

    padding:
      "12px 20px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: "bold",
  },

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(360px,1fr))",

    gap: 25,
  },

  card: {

    background: "#fff",

    padding: 24,

    borderRadius: 20,

    boxShadow:
      "0 10px 25px rgba(0,0,0,0.08)",

    transition: "0.3s",
  },

  cardHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",
  },

  statusBadge: {

    color: "#fff",

    padding:
      "5px 12px",

    borderRadius: 20,

    fontWeight: "bold",
  },

  small: {

    color: "#64748b",
  },

  workBox: {

    background: "#eef2ff",

    padding: 15,

    borderRadius: 14,

    marginTop: 20,
  },

  complaintTop: {

    display: "flex",

    justifyContent:
      "space-between",

    marginBottom: 10,
  },

  priorityTag: {

    background: "#4338ca",

    color: "#fff",

    padding:
      "4px 10px",

    borderRadius: 20,

    fontSize: 12,
  },

  image: {

    width: "100%",

    borderRadius: 12,

    marginTop: 10,
  },

  mapLink: {

    display: "inline-block",

    marginTop: 10,

    color: "#4338ca",

    fontWeight: "bold",
  },

  buttonGroup: {

    display: "flex",

    gap: 10,

    marginTop: 20,

    flexWrap: "wrap",
  },

  profileBtn: {

    background: "#0f172a",

    color: "#fff",

    border: "none",

    padding:
      "10px 14px",

    borderRadius: 10,

    cursor: "pointer",
  },

  assignBtn: {

    background: "#4338ca",

    color: "#fff",

    border: "none",

    padding:
      "10px 14px",

    borderRadius: 10,

    cursor: "pointer",
  },

  deleteBtn: {

    background: "#dc2626",

    color: "#fff",

    border: "none",

    padding:
      "10px 14px",

    borderRadius: 10,

    cursor: "pointer",
  },

  modalOverlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.6)",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    zIndex: 9999,
  },

  modal: {

    background: "#fff",

    padding: 30,

    width: 500,

    borderRadius: 20,

    maxHeight: "80vh",

    overflowY: "auto",
  },

  modalRow: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    background: "#eef2ff",

    padding: 15,

    borderRadius: 12,

    marginBottom: 15,
  },

  closeBtn: {

    marginTop: 15,

    background: "#dc2626",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

    borderRadius: 10,

    cursor: "pointer",
  },
};

export default OfficersManagerPage;