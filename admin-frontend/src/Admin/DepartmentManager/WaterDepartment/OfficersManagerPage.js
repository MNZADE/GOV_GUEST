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

/* =========================================================
   PAGE
========================================================= */

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

  /* =========================================================
     LIVE CLOCK
  ========================================================= */

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

  /* =========================================================
     FETCH INITIAL DATA
  ========================================================= */

  useEffect(() => {

    fetchOfficers();

    fetchComplaints();

  }, []);

  /* =========================================================
     SOCKET REALTIME
  ========================================================= */

  useEffect(() => {

    socket.on(
      "complaintUpdated",
      (updatedComplaint) => {

        /* =====================================
           UPDATE COMPLAINTS
        ===================================== */

        setComplaints(
          (prev) =>

            prev.map(
              (item) =>

                item._id ===
                updatedComplaint._id

                  ? updatedComplaint

                  : item
            )
        );

        /* =====================================
           OFFICER FREE AFTER RESOLVED
        ===================================== */

        if (

          updatedComplaint.status ===
            "Resolved" ||

          updatedComplaint.status ===
            "Rejected"
        ) {

          setOfficers(
            (prev) =>

              prev.map(
                (officer) =>

                  officer._id ===
                  updatedComplaint.assignedOfficerId

                    ? {

                        ...officer,

                        currentStatus:
                          "Available",
                      }

                    : officer
              )
          );
        }
      }
    );

    return () => {

      socket.off(
        "complaintUpdated"
      );
    };

  }, []);

  /* =========================================================
     FETCH OFFICERS
  ========================================================= */

  const fetchOfficers =
    async () => {

      try {

        const res =
          await fetch(

            `${BACKEND}/api/officers/all`
          );

        const data =
          await res.json();

        if (
          data.success
        ) {

          const waterOfficers =
            data.officers.filter(

              (o) =>

                o.department
                  ?.toLowerCase()
                  ?.includes("water")
            );

          setOfficers(
            waterOfficers
          );
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =========================================================
     FETCH COMPLAINTS
  ========================================================= */

  const fetchComplaints =
    async () => {

      try {

        const res =
          await fetch(

            `${BACKEND}/api/complaints/all`
          );

        const data =
          await res.json();

        if (
          data.success
        ) {

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

  /* =========================================================
     SLA RULES
  ========================================================= */

  const SLA_RULES = {

    Escalated: 6,

    Urgent: 12,

    High: 12,

    Medium: 24,

    Normal: 48,

    Low: 72,
  };

  /* =========================================================
     SLA TIMER
  ========================================================= */

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

  /* =========================================================
     ASSIGN COMPLAINT
  ========================================================= */

  const assignComplaint =
    async (
      complaint,
      officer
    ) => {

      try {

        /* =====================================
           CHECK ACTIVE COMPLAINT
        ===================================== */

        const activeComplaint =
          complaints.find(

            (c) =>

              c.assignedOfficerId ===
                officer._id &&

              c.status !==
                "Resolved" &&

              c.status !==
                "Rejected"
          );

        if (
          activeComplaint
        ) {

          alert(
            "Officer is already busy with another complaint"
          );

          return;
        }

        /* =====================================
           API CALL
        ===================================== */

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

        const data =
          await res.json();

        console.log(
          "Assign Response:",
          data
        );

        /* =====================================
           ERROR
        ===================================== */

        if (!res.ok) {

          alert(

            data.message ||
            "Assignment Failed"
          );

          return;
        }

        /* =====================================
           SUCCESS
        ===================================== */

        if (
          data.success
        ) {

          alert(
            "Complaint Assigned Successfully"
          );

          /* =====================================
             UPDATE COMPLAINT
          ===================================== */

          setComplaints(
            (prev) =>

              prev.map(
                (item) =>

                  item._id ===
                  complaint._id

                    ? {

                        ...item,

                        ...data.complaint,
                      }

                    : item
              )
          );

          /* =====================================
             UPDATE OFFICER STATUS
          ===================================== */

          setOfficers(
            (prev) =>

              prev.map(
                (item) =>

                  item._id ===
                  officer._id

                    ? {

                        ...item,

                        currentStatus:
                          "Busy",
                      }

                    : item
              )
          );

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

  /* =========================================================
     DELETE OFFICER
  ========================================================= */

  const deleteOfficer =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete Officer?"
        );

      if (
        !confirmDelete
      )
        return;

      try {

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

        if (
          data.success
        ) {

          alert(
            "Officer Deleted"
          );

          fetchOfficers();
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =========================================================
     OFFICER ANALYTICS
  ========================================================= */

  const getOfficerStats =
    (officerId) => {

      const total =
        complaints.filter(

          (c) =>

            c.assignedOfficerId ===
            officerId
        ).length;

      const resolved =
        complaints.filter(

          (c) =>

            c.assignedOfficerId ===
              officerId &&

            c.status ===
              "Resolved"
        ).length;

      const active =
        complaints.filter(

          (c) =>

            c.assignedOfficerId ===
              officerId &&

            c.status !==
              "Resolved" &&

            c.status !==
              "Rejected"
        ).length;

      return {

        total,

        resolved,

        active,

        efficiency:
          total > 0

            ? Math.round(
                (resolved /
                  total) *
                  100
              )

            : 0,
      };
    };

  /* =========================================================
     UI
  ========================================================= */

  return (

    <div style={styles.wrapper}>

      {!showAdd ? (

        <>

          {/* =========================================================
             HEADER
          ========================================================= */}

          <div style={styles.header}>

            <div>

              <h1 style={styles.title}>
                💧 Water Department Officer Panel
              </h1>

              <p style={styles.subtitle}>
                Smart Complaint Assignment & Monitoring System
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

          {/* =========================================================
             GRID
          ========================================================= */}

          <div style={styles.grid}>

            {officers.map(
              (officer) => {

                /* =====================================
                   ACTIVE COMPLAINT ONLY
                ===================================== */

                const assignedComplaint =
                  complaints.find(

                    (c) =>

                      c.assignedOfficerId ===
                        officer._id &&

                      c.status !==
                        "Resolved" &&

                      c.status !==
                        "Rejected"
                  );

                const stats =
                  getOfficerStats(
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

                        <h2>
                          {
                            officer.fullName
                          }
                        </h2>

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

                          ? "Busy On Complaint"

                          : "Available"}

                      </span>

                    </div>

                    {/* ANALYTICS */}

                    <div
                      style={
                        styles.analyticsBox
                      }
                    >

                      <div
                        style={
                          styles.analyticsItem
                        }
                      >

                        <h3>
                          {
                            stats.total
                          }
                        </h3>

                        <p>
                          Total
                        </p>

                      </div>

                      <div
                        style={
                          styles.analyticsItem
                        }
                      >

                        <h3>
                          {
                            stats.resolved
                          }
                        </h3>

                        <p>
                          Resolved
                        </p>

                      </div>

                      <div
                        style={
                          styles.analyticsItem
                        }
                      >

                        <h3>
                          {
                            stats.active
                          }
                        </h3>

                        <p>
                          Active
                        </p>

                      </div>

                      <div
                        style={
                          styles.analyticsItem
                        }
                      >

                        <h3>
                          {
                            stats.efficiency
                          }
                          %
                        </h3>

                        <p>
                          Efficiency
                        </p>

                      </div>

                    </div>

                    {/* ACTIVE COMPLAINT */}

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
                          </strong>

                          {" "}

                          {
                            assignedComplaint.issue
                          }

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
                            Remark:
                          </strong>

                          {" "}

                          {
                            assignedComplaint.officerRemark ||

                            "No Remark"
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

                        {assignedComplaint.officerUpdatedImage && (

                          <img

                            src={`${BACKEND}/uploads/${assignedComplaint.officerUpdatedImage}`}

                            alt="update"

                            style={
                              styles.image
                            }
                          />
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

                <p>
                  <strong>Department:</strong>
                  {" "}
                  {
                    selectedOfficer.department
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

                      !c.assignedOfficerId ||

                      c.status ===
                        "Resolved" ||

                      c.status ===
                        "Rejected"
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

/* =========================================================
   STYLES
========================================================= */

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

    alignItems:
      "center",

    marginBottom: 40,
  },

  title: {

    margin: 0,

    fontSize: 34,

    fontWeight: 700,
  },

  subtitle: {

    color: "#0369a1",

    marginTop: 6,
  },

  primaryBtn: {

    background: "#0284c7",

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
      "repeat(auto-fit,minmax(380px,1fr))",

    gap: 25,
  },

  card: {

    background: "#fff",

    padding: 24,

    borderRadius: 22,

    boxShadow:
      "0 10px 25px rgba(0,0,0,0.08)",
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
      "6px 14px",

    borderRadius: 20,

    fontSize: 13,

    fontWeight: 600,
  },

  small: {

    color: "#64748b",
  },

  analyticsBox: {

    display: "grid",

    gridTemplateColumns:
      "repeat(4,1fr)",

    gap: 12,

    marginTop: 24,

    marginBottom: 20,
  },

  analyticsItem: {

    background:
      "#f0f9ff",

    padding: 12,

    borderRadius: 14,

    textAlign:
      "center",
  },

  workBox: {

    background: "#f0f9ff",

    padding: 18,

    borderRadius: 16,

    marginTop: 20,
  },

  complaintTop: {

    display: "flex",

    justifyContent:
      "space-between",

    marginBottom: 12,
  },

  priorityTag: {

    background: "#0284c7",

    color: "#fff",

    padding:
      "4px 12px",

    borderRadius: 20,

    fontSize: 13,
  },

  image: {

    width: "100%",

    borderRadius: 14,

    marginTop: 14,

    maxHeight: 240,

    objectFit:
      "cover",
  },

  buttonGroup: {

    display: "flex",

    gap: 10,

    marginTop: 24,

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

    alignItems:
      "center",

    zIndex: 999,
  },

  modal: {

    background: "#fff",

    padding: 30,

    width: 520,

    borderRadius: 22,

    maxHeight: "90vh",

    overflowY:
      "auto",
  },

  modalRow: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    background: "#f0f9ff",

    padding: 15,

    borderRadius: 14,

    marginBottom: 15,
  },

  closeBtn: {

    marginTop: 20,

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