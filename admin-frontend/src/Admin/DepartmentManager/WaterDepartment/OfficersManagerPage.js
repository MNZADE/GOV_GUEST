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

  const WATER_DEPARTMENT =
    "Water Supply Department";

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
     FETCH DATA
  ===================================== */

  useEffect(() => {

    fetchOfficers();
    fetchComplaints();

  }, []);

  /* =====================================
     SOCKET
  ===================================== */

  useEffect(() => {

    socket.on(
      "complaintUpdated",
      () => {

        fetchComplaints();
        fetchOfficers();
      }
    );

    return () => {

      socket.off(
        "complaintUpdated"
      );
    };

  }, []);

  /* =====================================
     FETCH OFFICERS
  ===================================== */

  const fetchOfficers =
    async () => {

      try {

        const res =
          await fetch(

            `${BACKEND}/api/officers/all`
          );

        const data =
          await res.json();

        if (data.success) {

          const waterOfficers =
            data.officers.filter(

              (o) =>

                o.department ===
                WATER_DEPARTMENT
            );

          setOfficers(
            waterOfficers
          );
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =====================================
     FETCH COMPLAINTS
  ===================================== */
const fetchComplaints =
  async () => {

    try {

      const res =
        await fetch(

          `${BACKEND}/api/complaints/all`
        );

      const text =
        await res.text();

      console.log(text);

      const data =
        JSON.parse(text);

      if (data.success) {

        /* =========================
           ONLY WATER DEPARTMENT
        ========================= */

        const waterComplaints =
          data.complaints.filter(

            (c) =>

              c.department
                ?.toLowerCase()
                ?.includes("water")
          );

        setComplaints(
          waterComplaints
        );
      }

    } catch (err) {

      console.log(err);
    }
  };

  /* =====================================
     SLA
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

      console.log(
        "Assigning Complaint:",
        complaint
      );

      console.log(
        "Assigning Officer:",
        officer
      );

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
            }),
          }
        );

      /* =========================
         GET RESPONSE TEXT
      ========================= */

      const text =
        await res.text();

      console.log(text);

      const data =
        JSON.parse(text);

      /* =========================
         ERROR
      ========================= */

      if (!res.ok) {

        alert(

          data.message ||
          "Assignment Failed"
        );

        return;
      }

      /* =========================
         SUCCESS
      ========================= */

      if (data.success) {

        alert(
          "Complaint Assigned Successfully & Email Sent"
        );

        fetchComplaints();

        fetchOfficers();

        setAssigningOfficer(
          null
        );
      }

    } catch (err) {

      console.log(err);

      alert(
        "Server Error"
      );
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

        const res =
          await fetch(

            `${BACKEND}/api/officers/delete/${id}`,

            {
              method: "DELETE",
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

          {/* =====================================
             HEADER
          ===================================== */}

          <div style={styles.header}>

            <div>

              <h2 style={styles.title}>
                💧 Water Department
                Officer Panel
              </h2>

              <p style={styles.subtitle}>
                Smart Complaint
                Assignment System
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

          {/* =====================================
             OFFICERS
          ===================================== */}

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

                    {/* =====================
                       COMPLAINT
                    ===================== */}

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
                            Remark:
                          </strong>{" "}
                          {
                            assignedComplaint.officerRemark ||
                            "No remark"
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
                          View Location
                        </a>

                      </div>
                    )}

                    {/* =====================
                       BUTTONS
                    ===================== */}

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

          {/* =====================================
             PROFILE MODAL
          ===================================== */}

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
                  <strong>
                    Name:
                  </strong>{" "}
                  {
                    selectedOfficer.fullName
                  }
                </p>

                <p>
                  <strong>
                    Employee ID:
                  </strong>{" "}
                  {
                    selectedOfficer.empId
                  }
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {
                    selectedOfficer.email
                  }
                </p>

                <p>
                  <strong>
                    Phone:
                  </strong>{" "}
                  {
                    selectedOfficer.phone
                  }
                </p>

                <p>
                  <strong>
                    Designation:
                  </strong>{" "}
                  {
                    selectedOfficer.designation
                  }
                </p>

                <p>
                  <strong>
                    Address:
                  </strong>{" "}
                  {
                    selectedOfficer.address
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

          {/* =====================================
             ASSIGN MODAL
          ===================================== */}

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
            WATER_DEPARTMENT
          }
          onBack={() =>
            setShowAdd(false)
          }
        />

      )}

    </div>
  );
};

const styles = {

  wrapper: {

    padding: 40,

    background:
      "linear-gradient(to right,#e0f2fe,#f0f9ff)",

    minHeight: "100vh",
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    marginBottom: 40,
  },

  title: {

    margin: 0,
  },

  subtitle: {

    color: "#0369a1",
  },

  primaryBtn: {

    background: "#0284c7",

    color: "#fff",

    border: "none",

    padding:
      "12px 20px",

    borderRadius: 12,

    cursor: "pointer",
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
  },

  cardHeader: {

    display: "flex",

    justifyContent:
      "space-between",
  },

  statusBadge: {

    color: "#fff",

    padding:
      "5px 12px",

    borderRadius: 20,

    height: "fit-content",
  },

  small: {

    color: "#64748b",
  },

  workBox: {

    background: "#f0f9ff",

    padding: 15,

    borderRadius: 14,

    marginTop: 20,
  },

  complaintTop: {

    display: "flex",

    justifyContent:
      "space-between",
  },

  priorityTag: {

    background: "#0284c7",

    color: "#fff",

    padding:
      "4px 10px",

    borderRadius: 20,
  },

  image: {

    width: "100%",

    borderRadius: 12,

    marginTop: 10,
  },

  mapLink: {

    display: "inline-block",

    marginTop: 10,

    textDecoration: "none",

    color: "#0284c7",
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

    background: "#0284c7",

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
  },

  modal: {

    background: "#fff",

    padding: 30,

    width: 500,

    borderRadius: 20,
  },

  modalRow: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    background: "#f0f9ff",

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