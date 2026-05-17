import React, {
  useState,
} from "react";

const OfficersManagerPage = () => {

  const [
    officers,
    setOfficers,
  ] = useState([

    {
      id: 1,

      name: "Rahul Patil",

      role:
        "Complaint Officer",

      department:
        "General Complaint",

      status:
        "Available",

      phone:
        "9876543210",

      assignedComplaint:
        "OC-101",
    },

    {
      id: 2,

      name: "Amit Jadhav",

      role:
        "Field Supervisor",

      department:
        "General Complaint",

      status: "Busy",

      phone:
        "9988776655",

      assignedComplaint:
        "OC-103",
    },

    {
      id: 3,

      name:
        "Sneha Kulkarni",

      role:
        "Public Officer",

      department:
        "General Complaint",

      status:
        "Available",

      phone:
        "8877665544",

      assignedComplaint:
        "None",
    },
  ]);

  /* =====================================================
     ASSIGN COMPLAINT
  ===================================================== */

  const assignComplaint = (
    officerId
  ) => {

    const complaintId =
      prompt(
        "Enter Complaint ID"
      );

    if (!complaintId) return;

    const updated =
      officers.map((officer) =>

        officer.id ===
        officerId

          ? {
              ...officer,

              assignedComplaint:
                complaintId,

              status: "Busy",
            }

          : officer
      );

    setOfficers(updated);

    alert(
      "Complaint Assigned Successfully"
    );
  };

  /* =====================================================
     DELETE OFFICER
  ===================================================== */

  const deleteOfficer = (
    officerId
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this officer?"
      );

    if (
      !confirmDelete
    )
      return;

    const updated =
      officers.filter(
        (officer) =>
          officer.id !==
          officerId
      );

    setOfficers(updated);

    alert(
      "Officer Deleted Successfully"
    );
  };

  /* =====================================================
     ADD OFFICER PAGE
  ===================================================== */

  const openAddOfficerPage =
    () => {

      window.location.href =
        "/add-officer";
    };

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

          <p style={styles.subtitle}>
            Manage officers and assign complaints
          </p>

        </div>

        {/* ADD OFFICER BUTTON */}

        <button

          style={
            styles.addOfficerBtn
          }

          onClick={
            openAddOfficerPage
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
          (officer, index) => (

            <div
              key={officer.id}
              style={styles.card}
            >

              {/* PROFILE */}

              <div
                style={
                  styles.topSection
                }
              >

                <img

                  src={`https://i.pravatar.cc/150?img=${
                    index + 10
                  }`}

                  alt="Officer"

                  style={
                    styles.profileImage
                  }
                />

                <div>

                  <h3
                    style={
                      styles.name
                    }
                  >
                    {
                      officer.name
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
                      officer.assignedComplaint
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
                        officer.status ===
                        "Available"
                          ? "#dcfce7"
                          : "#fee2e2",

                      color:
                        officer.status ===
                        "Available"
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  >
                    {
                      officer.status
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
                    styles.viewBtn
                  }
                >
                  View Profile
                </button>

                <button

                  style={
                    styles.assignBtn
                  }

                  onClick={() =>
                    assignComplaint(
                      officer.id
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
                    styles.editBtn
                  }
                >
                  Edit
                </button>

                <button

                  style={
                    styles.deleteBtn
                  }

                  onClick={() =>
                    deleteOfficer(
                      officer.id
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

    </div>
  );
};

const styles = {

  container: {

    padding: 10,
  },

  /* =====================================================
     HEADER
  ===================================================== */

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
      "linear-gradient(135deg,#2563eb,#1d4ed8)",

    color: "#fff",

    border: "none",

    padding: "14px 22px",

    borderRadius: 14,

    cursor: "pointer",

    fontWeight: 700,

    fontSize: 15,

    boxShadow:
      "0 10px 25px rgba(37,99,235,0.25)",
  },

  /* =====================================================
     GRID
  ===================================================== */

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(340px,1fr))",

    gap: 24,
  },

  /* =====================================================
     CARD
  ===================================================== */

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

  profileImage: {

    width: 72,

    height: 72,

    borderRadius: "50%",

    objectFit: "cover",

    border:
      "3px solid #dbeafe",
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

  /* =====================================================
     DETAILS
  ===================================================== */

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

  /* =====================================================
     BUTTONS
  ===================================================== */

  buttonWrapper: {

    display: "flex",

    gap: 12,

    marginBottom: 12,
  },

  bottomButtons: {

    display: "flex",

    gap: 12,
  },

  viewBtn: {

    flex: 1,

    background: "#0f172a",

    color: "#fff",

    border: "none",

    padding: "12px 18px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,
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

  editBtn: {

    flex: 1,

    background: "#f59e0b",

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
};

export default OfficersManagerPage;