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

  const HEALTH_DEPARTMENT =
    "Health Department";

  const [showAdd, setShowAdd] =
    useState(false);

  const [officers, setOfficers] =
    useState([]);

  const [complaints, setComplaints] =
    useState([]);

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

  /* =====================================================
     LIVE CLOCK
  ===================================================== */

  useEffect(() => {

    const timer =
      setInterval(() => {

        setTimeNow(
          new Date()
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  /* =====================================================
     INITIAL FETCH
  ===================================================== */

  useEffect(() => {

    fetchOfficers();
    fetchComplaints();

  }, []);

  /* =====================================================
     SOCKET EVENTS
  ===================================================== */

  useEffect(() => {

    socket.on(
      "complaintUpdated",
      () => {

        fetchComplaints();
        fetchOfficers();
      }
    );

    socket.on(
      "officerAdded",
      () => {

        fetchOfficers();
      }
    );

    return () => {

      socket.off(
        "complaintUpdated"
      );

      socket.off(
        "officerAdded"
      );
    };

  }, []);

  /* =====================================================
     FETCH OFFICERS
  ===================================================== */

  const fetchOfficers =
    async () => {

      try {

        const res =
          await fetch(
            `${BACKEND}/api/officers/all`
          );

        if (!res.ok) {

          throw new Error(
            `HTTP Error ${res.status}`
          );
        }

        const data =
          await res.json();

        console.log(
          "Officers:",
          data
        );

        if (data.success) {

          const healthOfficers =
            data.officers.filter(

              (o) =>

                o.department
                  ?.toLowerCase()
                  ?.trim()
                  .includes("health")
            );

          setOfficers(
            healthOfficers
          );
        }

      } catch (err) {

        console.error(
          "Fetch Officer Error:",
          err
        );
      }
    };

  /* =====================================================
     FETCH COMPLAINTS
  ===================================================== */

  const fetchComplaints =
    async () => {

      try {

        const res =
          await fetch(
            `${BACKEND}/api/complaints/all`
          );

        if (!res.ok) {

          throw new Error(
            `HTTP Error ${res.status}`
          );
        }

        const data =
          await res.json();

        console.log(
          "Complaints:",
          data
        );

        if (data.success) {

          const healthComplaints =
            data.complaints.filter(

              (c) =>

                c.department
                  ?.toLowerCase()
                  ?.trim()
                  .includes("health")
            );

          setComplaints(
            healthComplaints
          );
        }

      } catch (err) {

        console.error(
          "Fetch Complaint Error:",
          err
        );
      }
    };

  /* =====================================================
     SLA TIMER
  ===================================================== */

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

  /* =====================================================
     ASSIGN COMPLAINT
  ===================================================== */
/* =====================================================
   ASSIGN COMPLAINT
===================================================== */

const assignComplaint = async (
  complaint,
  officer
) => {

  try {

    if (
      !complaint?._id ||
      !officer?._id
    ) {

      alert(
        "Invalid Complaint or Officer"
      );

      return;
    }

    const res =
      await fetch(

        `${BACKEND}/api/officers/assign/${complaint._id}`,

        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            officerId:
              officer._id,

            officerName:
              officer.fullName,

            department:
              officer.department,
          }),
        }
      );

    if (!res.ok) {

      const errorText =
        await res.text();

      console.error(
        "Backend Error:",
        errorText
      );

      throw new Error(
        `HTTP Error ${res.status}`
      );
    }

    const data =
      await res.json();

    console.log(
      "Assign Response:",
      data
    );

    if (data.success) {

      alert(
        "Complaint Assigned Successfully"
      );

      fetchComplaints();

      fetchOfficers();

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

    console.error(
      "Assign Complaint Error:",
      err
    );

    alert(
      "Failed To Assign Complaint"
    );
  }
};
  /* =====================================================
     DELETE OFFICER
  ===================================================== */

  const deleteOfficer =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete Officer?"
        );

      if (!confirmDelete)
        return;

      try {

        const res =
          await fetch(

            `${BACKEND}/api/officers/delete/${id}`,

            {
              method: "DELETE",
            }
          );

        if (!res.ok) {

          throw new Error(
            `HTTP Error ${res.status}`
          );
        }

        const data =
          await res.json();

        if (data.success) {

          alert(
            "Officer Deleted Successfully"
          );

          fetchOfficers();
        }

      } catch (err) {

        console.error(err);
      }
    };

  return (

    <div style={styles.wrapper}>

      {!showAdd ? (

        <>

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div style={styles.header}>

            <div>

              <h2 style={styles.title}>
                🏥 Health Department Officer Panel
              </h2>

              <p style={styles.subtitle}>
                Smart Health Complaint Assignment Dashboard
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

          {/* =====================================================
              OFFICERS GRID
          ===================================================== */}

          <div style={styles.grid}>

            {officers.map(
              (officer) => {

                const assignedComplaint =
                  complaints.find(

                    (c) =>

                      c.assignedOfficerId ===
                      officer._id
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

                    {/* HEADER */}

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

                    {/* OFFICER INFO */}

                    <div style={styles.infoGrid}>

                      <div style={styles.infoBox}>
                        <label>
                          Employee ID
                        </label>

                        <p>
                          {
                            officer.empId
                          }
                        </p>
                      </div>

                      <div style={styles.infoBox}>
                        <label>
                          Phone
                        </label>

                        <p>
                          {
                            officer.phone
                          }
                        </p>
                      </div>

                      <div style={styles.infoBox}>
                        <label>
                          Email
                        </label>

                        <p>
                          {
                            officer.email
                          }
                        </p>
                      </div>

                      <div style={styles.infoBox}>
                        <label>
                          Department
                        </label>

                        <p>
                          Health Department
                        </p>
                      </div>

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
                            Issue:
                          </strong>{" "}
                          {
                            assignedComplaint.issue
                          }
                        </p>

                        <p>
                          <strong>
                            Status:
                          </strong>{" "}
                          {
                            assignedComplaint.status
                          }
                        </p>

                        <p>
                          <strong>
                            Address:
                          </strong>{" "}
                          {
                            assignedComplaint.address
                          }
                        </p>

                        <p>
                          <strong>
                            Remark:
                          </strong>{" "}
                          {
                            assignedComplaint.officerRemark ||
                            "No Remark"
                          }
                        </p>

                        <p>
                          <strong>
                            SLA:
                          </strong>{" "}
                          {getRemainingTime(
                            assignedComplaint
                          )}
                        </p>

                        {assignedComplaint
                          .officerUpdatedImage && (

                          <img
                            src={`${BACKEND}/uploads/${assignedComplaint.officerUpdatedImage}`}
                            alt="update"
                            style={
                              styles.image
                            }
                          />
                        )}

                        <a
                          href={`https://www.google.com/maps?q=${assignedComplaint.lat},${assignedComplaint.lon}`}
                          target="_blank"
                          rel="noreferrer"
                          style={
                            styles.mapLink
                          }
                        >
                          View Complaint Location
                        </a>

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
                        Profile
                      </button>

                      {!assignedComplaint && (

                        <button
                          style={
                            styles.assignBtn
                          }
                          onClick={() =>
                            setAssigningOfficer(
                              officer
                            )
                          }
                        >
                          Assign Complaint
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

          {/* =====================================================
              PROFILE MODAL
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

                <h2>
                  Officer Profile
                </h2>

                <div style={styles.modalGrid}>

                  <div style={styles.modalBox}>
                    <label>Name</label>

                    <p>
                      {
                        selectedOfficer.fullName
                      }
                    </p>
                  </div>

                  <div style={styles.modalBox}>
                    <label>Employee ID</label>

                    <p>
                      {
                        selectedOfficer.empId
                      }
                    </p>
                  </div>

                  <div style={styles.modalBox}>
                    <label>Email</label>

                    <p>
                      {
                        selectedOfficer.email
                      }
                    </p>
                  </div>

                  <div style={styles.modalBox}>
                    <label>Phone</label>

                    <p>
                      {
                        selectedOfficer.phone
                      }
                    </p>
                  </div>

                  <div style={styles.modalBox}>
                    <label>Designation</label>

                    <p>
                      {
                        selectedOfficer.designation
                      }
                    </p>
                  </div>

                  <div style={styles.modalBox}>
                    <label>Address</label>

                    <p>
                      {
                        selectedOfficer.address
                      }
                    </p>
                  </div>

                </div>

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

          {/* =====================================================
              ASSIGN MODAL
          ===================================================== */}

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
                      key={c._id}
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
                          {
                            c.issue
                          }
                        </p>

                        <small>
                          SLA:{" "}
                          {getRemainingTime(
                            c
                          )}
                        </small>

                      </div>

                      <button
                        style={
                          styles.assignBtn
                        }
                        onClick={() =>
                          assignComplaint(
                            c,
                            assigningOfficer
                          )
                        }
                      >
                        Assign
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
            HEALTH_DEPARTMENT
          }
          onBack={() =>
            setShowAdd(false)
          }
        />

      )}

    </div>
  );
};

/* =====================================================
   STYLES
===================================================== */

const styles = {

  wrapper: {

    padding: 35,

    background:
      "#f1f5f9",

    minHeight: "100vh",
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom: 35,
  },

  title: {

    margin: 0,

    fontSize: 32,

    fontWeight: 700,

    color: "#0f172a",
  },

  subtitle: {

    color: "#64748b",

    marginTop: 8,
  },

  primaryBtn: {

    background: "#0f172a",

    color: "#fff",

    border: "none",

    padding:
      "12px 22px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
  },

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(420px,1fr))",

    gap: 25,
  },

  card: {

    background: "#ffffff",

    padding: 28,

    borderRadius: 24,

    border:
      "1px solid #e2e8f0",

    boxShadow:
      "0 10px 25px rgba(0,0,0,0.06)",
  },

  cardHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",
  },

  statusBadge: {

    color: "#fff",

    padding:
      "6px 14px",

    borderRadius: 20,

    fontSize: 13,

    fontWeight: 600,
  },

  small: {

    color: "#64748b",

    marginTop: 5,
  },

  infoGrid: {

    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: 15,

    marginTop: 20,
  },

  infoBox: {

    background: "#f8fafc",

    padding: 16,

    borderRadius: 16,

    border:
      "1px solid #e2e8f0",
  },

  workBox: {

    background: "#f8fafc",

    padding: 18,

    borderRadius: 18,

    marginTop: 22,

    border:
      "1px solid #e2e8f0",
  },

  complaintTop: {

    display: "flex",

    justifyContent:
      "space-between",

    marginBottom: 10,
  },

  priorityTag: {

    background: "#dc2626",

    color: "#fff",

    padding:
      "4px 12px",

    borderRadius: 20,

    fontSize: 12,
  },

  image: {

    width: "100%",

    height: 220,

    objectFit: "cover",

    borderRadius: 16,

    marginTop: 15,
  },

  mapLink: {

    display: "inline-block",

    marginTop: 15,

    textDecoration: "none",

    color: "#2563eb",

    fontWeight: 600,
  },

  buttonGroup: {

    display: "flex",

    gap: 10,

    marginTop: 22,

    flexWrap: "wrap",
  },

  profileBtn: {

    background: "#0f172a",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

    borderRadius: 10,

    cursor: "pointer",
  },

  assignBtn: {

    background: "#2563eb",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

    borderRadius: 10,

    cursor: "pointer",
  },

  deleteBtn: {

    background: "#dc2626",

    color: "#fff",

    border: "none",

    padding:
      "10px 16px",

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

    alignItems:
      "center",

    zIndex: 999,
  },

  modal: {

    background: "#fff",

    padding: 35,

    width: "750px",

    maxHeight: "90vh",

    overflowY: "auto",

    borderRadius: 28,

    boxShadow:
      "0 20px 50px rgba(0,0,0,0.25)",
  },

  modalGrid: {

    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: 18,

    marginTop: 25,
  },

  modalBox: {

    background: "#f8fafc",

    padding: 18,

    borderRadius: 16,

    border:
      "1px solid #e2e8f0",
  },

  modalRow: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    background: "#f8fafc",

    padding: 18,

    borderRadius: 16,

    marginBottom: 18,

    border:
      "1px solid #e2e8f0",
  },

  closeBtn: {

    marginTop: 20,

    background: "#dc2626",

    color: "#fff",

    border: "none",

    padding:
      "12px 20px",

    borderRadius: 12,

    cursor: "pointer",
  },
};

export default OfficersManagerPage;