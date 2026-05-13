import React, {
  useState,
  useEffect,
} from "react";

import {
  Search,
  Phone,
  Mail,
  MapPin,
  User,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

import AddOfficer from "../shared/AddOfficer";

const OfficersPage = ({
  department =
    "Sanitation Department",
}) => {

  /* =====================================================
     STATES
  ===================================================== */

  const [
    officers,
    setOfficers,
  ] = useState([]);

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedOfficer,
    setSelectedOfficer,
  ] = useState(null);

  const [
    selectedComplaint,
    setSelectedComplaint,
  ] = useState(null);

  const [
    showAddOfficer,
    setShowAddOfficer,
  ] = useState(false);

  const [
    editOfficer,
    setEditOfficer,
  ] = useState(null);

  /* =====================================================
     FETCH OFFICERS
  ===================================================== */

  useEffect(() => {

    fetchOfficers();

    fetchComplaints();

  }, [department]);

  const fetchOfficers =
    async () => {

      try {

        const res =
          await fetch(
            "http://localhost:5000/api/officers/all"
          );

        const data =
          await res.json();

        if (data.success) {

          const filtered =
            data.officers.filter(
              (officer) => {

                const officerDept =

                  officer.department
                    ?.toLowerCase()
                    ?.replace(
                      " department",
                      ""
                    )
                    ?.trim();

                const currentDept =

                  department
                    ?.toLowerCase()
                    ?.replace(
                      " department",
                      ""
                    )
                    ?.trim();

                return (
                  officerDept ===
                  currentDept
                );
              }
            );

          setOfficers(
            filtered
          );
        }

      } catch (err) {

        console.log(err);
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
            "http://localhost:5000/api/complaints/all"
          );

        const data =
          await res.json();

        if (data.success) {

          const filtered =
            data.complaints.filter(
              (complaint) => {

                const complaintDept =

                  complaint.department
                    ?.toLowerCase()
                    ?.replace(
                      " department",
                      ""
                    )
                    ?.trim();

                const currentDept =

                  department
                    ?.toLowerCase()
                    ?.replace(
                      " department",
                      ""
                    )
                    ?.trim();

                return (
                  complaintDept ===
                  currentDept
                );
              }
            );

          setComplaints(
            filtered
          );
        }

      } catch (err) {

        console.log(err);
      }
    };

  /* =====================================================
     DELETE OFFICER
  ===================================================== */

  const handleDelete =
    async (officerId) => {

      const confirmDelete =
        window.confirm(
          "Delete this officer?"
        );

      if (!confirmDelete)
        return;

      try {

        const res =
          await fetch(

            `http://localhost:5000/api/officers/delete/${officerId}`,

            {
              method:
                "DELETE",
            }
          );

        const data =
          await res.json();

        if (data.success) {

          alert(
            "Officer Deleted Successfully"
          );

          fetchOfficers();
        }

      } catch (err) {

        console.log(err);

        alert(
          "Delete Failed"
        );
      }
    };

  /* =====================================================
     ASSIGN COMPLAINT
  ===================================================== */

  const assignComplaint =
    async (
      complaintId,
      officerId
    ) => {

      try {

        const res =
          await fetch(

            `http://localhost:5000/api/officers/assign/${complaintId}`,

            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                officerId,
              }),
            }
          );

        const data =
          await res.json();

        if (data.success) {

          alert(
            "Complaint Assigned Successfully"
          );

          fetchOfficers();

          fetchComplaints();
        }

        else {

          alert(
            data.message
          );
        }

      } catch (err) {

        console.log(err);

        alert(
          "Assignment Failed"
        );
      }
    };

  /* =====================================================
     FILTER SEARCH
  ===================================================== */

  const filteredOfficers =
    officers.filter(
      (officer) =>
        officer.fullName
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  /* =====================================================
     ADD OFFICER PAGE
  ===================================================== */

  if (showAddOfficer) {

    return (

      <AddOfficer
        department={department}
        editOfficer={
          editOfficer
        }
        onBack={() => {

          setShowAddOfficer(
            false
          );

          setEditOfficer(
            null
          );

          fetchOfficers();
        }}
      />
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (

    <div style={pageContainer}>

      {/* =================================================
          HEADER
      ================================================= */}

      <div style={header}>

        <h1 style={{ margin: 0 }}>
          {department}
          {" "}
          Officers
        </h1>

        <button
          style={addButton}
          onClick={() => {

            setEditOfficer(
              null
            );

            setShowAddOfficer(
              true
            );
          }}
        >
          <Plus size={14} />
          Add Officer
        </button>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div style={searchBox}>

        <Search size={14} />

        <input
          type="text"
          placeholder="Search Officer..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          style={searchInput}
        />

      </div>

      {/* =================================================
          OFFICERS GRID
      ================================================= */}

      <div style={grid}>

        {filteredOfficers.map(
          (officer) => {

            const isBusy =

              officer.assignedComplaintId ||

              officer.assignedComplaint;

            const complaintDetails =

              complaints.find(
                (c) =>

                  c._id ===
                    officer.assignedComplaintId ||

                  c.id ===
                    officer.assignedComplaint
              );

            return (

              <div
                key={officer._id}
                style={card}
              >

                {/* CARD HEADER */}

                <div style={cardHeader}>

                  <div style={avatar}>
                    <User size={20} />
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >

                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                      }}
                    >
                      {officer.fullName}
                    </h3>

                    <span style={wardBadge}>
                      {officer.department}
                    </span>

                  </div>

                  <span
                    style={statusBadge(
                      isBusy
                    )}
                  >
                    {isBusy
                      ? "Busy"
                      : "Free"}
                  </span>

                </div>

                <div style={divider} />

                {/* INFO */}

                <div style={infoSection}>

                  <p>
                    <Phone size={13} />
                    {" "}
                    {officer.phone}
                  </p>

                  <p>
                    <Mail size={13} />
                    {" "}
                    {officer.email}
                  </p>

                  <p>
                    <MapPin size={13} />
                    {" "}
                    {
                      officer.designation
                    }
                  </p>

                </div>

                {/* ASSIGNED */}

                {isBusy && (

                  <div style={assignedBox}>

                    Assigned:
                    {" "}
                    {
                      complaintDetails
                        ?.complaintId ||

                      complaintDetails
                        ?.id
                    }

                  </div>
                )}

                {/* BUTTONS */}

                <div style={buttonRow}>

                  {/* PROFILE */}

                  <button
                    style={profileBtn}
                    onClick={() =>
                      setSelectedOfficer(
                        officer
                      )
                    }
                  >
                    <Eye size={13} />
                    Profile
                  </button>

                  {/* VIEW COMPLAINT */}

                  {isBusy && (

                    <button
                      style={complaintBtn}
                      onClick={() =>
                        setSelectedComplaint(
                          complaintDetails
                        )
                      }
                    >
                      View Complaint
                    </button>
                  )}

                  {/* EDIT */}

                  <button
                    style={editBtn}
                    onClick={() => {

                      setEditOfficer(
                        officer
                      );

                      setShowAddOfficer(
                        true
                      );
                    }}
                  >
                    <Edit size={13} />
                  </button>

                  {/* DELETE */}

                  <button
                    style={deleteBtn}
                    onClick={() =>
                      handleDelete(
                        officer._id
                      )
                    }
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* ASSIGN */}

                  {!isBusy && (

                    <select

                      style={
                        assignDropdown
                      }

                      onChange={(e) => {

                        if (
                          !e.target.value
                        )
                          return;

                        assignComplaint(
                          e.target.value,
                          officer._id
                        );
                      }}
                    >

                      <option value="">
                        Assign Complaint
                      </option>

                      {complaints

                        .filter(
                          (c) =>
                            !c.assignedOfficerId
                        )

                        .map((c) => (

                          <option
                            key={c._id}
                            value={c._id}
                          >
                            {
                              c.complaintId
                            }
                            {" - "}
                            {c.issue}
                          </option>
                        ))}

                    </select>
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* =================================================
          PROFILE MODAL
      ================================================= */}

      {selectedOfficer && (

        <Modal
          title="Officer Profile"
          onClose={() =>
            setSelectedOfficer(
              null
            )
          }
        >

          <p>
            <strong>ID:</strong>
            {" "}
            {
              selectedOfficer.empId
            }
          </p>

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
            <strong>
              Department:
            </strong>
            {" "}
            {
              selectedOfficer.department
            }
          </p>

          <p>
            <strong>
              Designation:
            </strong>
            {" "}
            {
              selectedOfficer.designation
            }
          </p>

        </Modal>
      )}

      {/* =================================================
          COMPLAINT MODAL
      ================================================= */}

      {selectedComplaint && (

        <Modal
          title="Complaint Details"
          onClose={() =>
            setSelectedComplaint(
              null
            )
          }
        >

          <p>
            <strong>ID:</strong>
            {" "}
            {
              selectedComplaint.complaintId
            }
          </p>

          <p>
            <strong>Issue:</strong>
            {" "}
            {
              selectedComplaint.issue
            }
          </p>

          <p>
            <strong>
              Description:
            </strong>
            {" "}
            {
              selectedComplaint.description
            }
          </p>

          <p>
            <strong>
              Department:
            </strong>
            {" "}
            {
              selectedComplaint.department
            }
          </p>

          <p>
            <strong>
              Location:
            </strong>
            {" "}
            {
              selectedComplaint.location
            }
          </p>

        </Modal>
      )}

    </div>
  );
};

/* =====================================================
   MODAL
===================================================== */

const Modal = ({
  title,
  children,
  onClose,
}) => (

  <div
    style={overlay}
    onClick={onClose}
  >

    <div
      style={modal}
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      <h2
        style={{
          marginTop: 0,
        }}
      >
        {title}
      </h2>

      {children}

      <button
        style={closeBtn}
        onClick={onClose}
      >
        Close
      </button>

    </div>

  </div>
);

/* =====================================================
   STYLES
===================================================== */

const pageContainer = {
  padding: 32,
  background:
    "linear-gradient(135deg,#eef2ff,#f8fafc)",
  minHeight: "100vh",
};

const header = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const addButton = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  display: "flex",
  gap: 5,
  cursor: "pointer",
};

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "#fff",
  padding: "10px 14px",
  borderRadius: 12,
  width: 300,
  marginBottom: 25,
};

const searchInput = {
  border: "none",
  outline: "none",
  width: "100%",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(320px,1fr))",
  gap: 20,
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 18,
  boxShadow:
    "0 10px 25px rgba(0,0,0,0.06)",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const avatar = {
  width: 45,
  height: 45,
  borderRadius: "50%",
  background: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
};

const wardBadge = {
  fontSize: 11,
  background: "#dbeafe",
  padding: "4px 10px",
  borderRadius: 20,
};

const statusBadge = (
  busy
) => ({
  marginLeft: "auto",
  background: busy
    ? "#fee2e2"
    : "#dcfce7",
  color: busy
    ? "#991b1b"
    : "#166534",
  padding: "5px 10px",
  borderRadius: 20,
  fontSize: 12,
});

const divider = {
  height: 1,
  background: "#e2e8f0",
  margin: "16px 0",
};

const infoSection = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontSize: 13,
};

const assignedBox = {
  background: "#eff6ff",
  padding: 10,
  borderRadius: 10,
  marginTop: 10,
  fontSize: 13,
};

const buttonRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 15,
};

const profileBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 8,
};

const complaintBtn = {
  background: "#0f766e",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 8,
};

const editBtn = {
  background: "#f59e0b",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 8,
};

const deleteBtn = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 8,
};

const assignDropdown = {
  padding: "6px 10px",
  borderRadius: 8,
};

const overlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  width: 400,
};

const closeBtn = {
  marginTop: 20,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
};

export default OfficersPage;