import React, { useState } from "react";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  User,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import AddOfficer from "../shared/AddOfficer";

const OfficersPage = ({ department = "Sanitation Department" }) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editOfficer, setEditOfficer] = useState(null);

  const [officers, setOfficers] = useState([
    {
      empId: "SAN-10234",
      department,
      fullName: "Dr. Anjali Deshmukh",
      ward: "Ward 7",
      phone: "+91 9876543210",
      email: "anjali.deshmukh@sanitation.kmc.gov.in",
      designation: "Health Inspector",
      assignedComplaint: null,
    },
  ]);

  const [complaints] = useState([
    {
      id: "SAN-1001",
      title: "Garbage Not Collected",
      description: "Garbage not collected for 3 days.",
      location: "Ward 7"
    },
    {
      id: "SAN-1002",
      title: "Drainage Overflow",
      description: "Drainage water overflowing on road.",
      location: "Ward 4"
    },
  ]);

  /* ================= ADD ================= */

  const handleAddOfficer = (newOfficer) => {
    setOfficers(prev => [
      ...prev,
      { ...newOfficer, assignedComplaint: null }
    ]);
  };

  /* ================= UPDATE ================= */

  const handleUpdateOfficer = (updatedOfficer) => {
    setOfficers(prev =>
      prev.map(o =>
        o.empId === updatedOfficer.empId ? updatedOfficer : o
      )
    );
  };

  /* ================= DELETE ================= */

  const handleDelete = (empId) => {
    setOfficers(prev => prev.filter(o => o.empId !== empId));
  };

  /* ================= ASSIGN ================= */

  const assignComplaint = (empId, complaintId) => {
    setOfficers(prev =>
      prev.map(o =>
        o.empId === empId
          ? { ...o, assignedComplaint: complaintId }
          : o
      )
    );
  };

  const getComplaintDetails = (id) =>
    complaints.find(c => c.id === id);

  const filteredOfficers = officers.filter(o =>
    o.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= ADD / EDIT SCREEN ================= */

  if (showAddOfficer) {
    return (
      <AddOfficer
        department={department}
        editOfficer={editOfficer}
        onAddOfficer={handleAddOfficer}
        onUpdateOfficer={handleUpdateOfficer}
        onBack={() => {
          setShowAddOfficer(false);
          setEditOfficer(null);
        }}
      />
    );
  }

  return (
    <div style={pageContainer}>

      {/* HEADER */}
      <div style={header}>
        <h1 style={{ margin: 0 }}>{department} – Officers</h1>

        <button
          style={addButton}
          onClick={() => {
            setEditOfficer(null);
            setShowAddOfficer(true);
          }}
        >
          <Plus size={14}/> Add
        </button>
      </div>

      {/* SEARCH */}
      <div style={searchBox}>
        <Search size={14}/>
        <input
          type="text"
          placeholder="Search Officer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInput}
        />
      </div>

      {/* GRID */}
      <div style={grid}>
        {filteredOfficers.map((officer) => {

          const isBusy = officer.assignedComplaint !== null;
          const complaintDetails = getComplaintDetails(officer.assignedComplaint);

          return (
            <div key={officer.empId} style={card}>

              <div style={cardHeader}>
                <div style={avatar}>
                  <User size={20}/>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    {officer.fullName}
                  </h3>
                  <span style={wardBadge}>
                    {officer.ward || department}
                  </span>
                </div>

                <span style={statusBadge(isBusy)}>
                  {isBusy ? "Busy" : "Free"}
                </span>
              </div>

              <div style={divider}></div>

              <div style={infoSection}>
                <p><Phone size={13}/> {officer.phone}</p>
                <p><Mail size={13}/> {officer.email}</p>
                <p><MapPin size={13}/> {officer.designation}</p>
              </div>

              {isBusy && (
                <div style={assignedBox}>
                  Assigned: {officer.assignedComplaint}
                </div>
              )}

              <div style={buttonRow}>

                <button
                  style={profileBtn}
                  onClick={() => setSelectedOfficer(officer)}
                >
                  <Eye size={13}/> Profile
                </button>

                {isBusy && (
                  <button
                    style={complaintBtn}
                    onClick={() => setSelectedComplaint(complaintDetails)}
                  >
                    View Complaint
                  </button>
                )}

                <button
                  style={editBtn}
                  onClick={() => {
                    setEditOfficer(officer);
                    setShowAddOfficer(true);
                  }}
                >
                  <Edit size={13}/>
                </button>

                <button
                  style={deleteBtn}
                  onClick={() => handleDelete(officer.empId)}
                >
                  <Trash2 size={13}/>
                </button>

                {!isBusy && (
                  <select
                    style={assignDropdown}
                    onChange={(e) =>
                      assignComplaint(officer.empId, e.target.value)
                    }
                  >
                    <option value="">Assign</option>
                    {complaints.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PROFILE MODAL */}
      {selectedOfficer && (
        <Modal
          title="Officer Profile"
          onClose={() => setSelectedOfficer(null)}
        >
          <p><strong>ID:</strong> {selectedOfficer.empId}</p>
          <p><strong>Email:</strong> {selectedOfficer.email}</p>
          <p><strong>Phone:</strong> {selectedOfficer.phone}</p>
          <p><strong>Designation:</strong> {selectedOfficer.designation}</p>
        </Modal>
      )}

      {/* COMPLAINT MODAL */}
      {selectedComplaint && (
        <Modal
          title="Complaint Details"
          onClose={() => setSelectedComplaint(null)}
        >
          <p><strong>ID:</strong> {selectedComplaint.id}</p>
          <p><strong>Title:</strong> {selectedComplaint.title}</p>
          <p><strong>Description:</strong> {selectedComplaint.description}</p>
          <p><strong>Location:</strong> {selectedComplaint.location}</p>
        </Modal>
      )}

    </div>
  );
};

/* ================= MODAL ================= */

const Modal = ({ title, children, onClose }) => (
  <div style={overlay} onClick={onClose}>
    <div style={modal} onClick={(e) => e.stopPropagation()}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
      <button style={closeBtn} onClick={onClose}>Close</button>
    </div>
  </div>
);

/* ================= MODERN AI STYLES ================= */

const pageContainer = {
  padding: 32,
  background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20
};

const addButton = {
  background: "linear-gradient(135deg,#2563eb,#1e40af)",
  color: "#fff",
  padding: "5px 10px",
  fontSize: 12,
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 4
};

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#ffffffcc",
  padding: "6px 12px",
  borderRadius: 20,
  width: 250,
  marginBottom: 25
};

const searchInput = {
  border: "none",
  outline: "none",
  fontSize: 13,
  width: "100%",
  background: "transparent"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
  gap: 20
};

const card = {
  background: "rgba(255,255,255,0.85)",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const cardHeader = { display: "flex", alignItems: "center", gap: 12 };

const avatar = {
  background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
  color: "#fff",
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const wardBadge = {
  display: "inline-block",
  fontSize: 11,
  padding: "3px 8px",
  borderRadius: 12,
  background: "#e0f2fe",
  marginTop: 4
};

const statusBadge = (busy) => ({
  marginLeft: "auto",
  padding: "4px 8px",
  borderRadius: 12,
  fontSize: 11,
  background: busy ? "#fee2e2" : "#dcfce7",
  color: busy ? "#991b1b" : "#166534"
});

const divider = { height: 1, background: "#f1f5f9", margin: "16px 0" };

const infoSection = { fontSize: 13, display: "flex", flexDirection: "column", gap: 6 };

const assignedBox = {
  background: "#eef2ff",
  padding: 8,
  borderRadius: 8,
  marginTop: 8,
  fontSize: 12
};

const buttonRow = { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 };

const profileBtn = { background: "#2563eb", color: "#fff", padding: "4px 8px", fontSize: 12, borderRadius: 6, border: "none" };
const complaintBtn = { background: "#0f766e", color: "#fff", padding: "4px 8px", fontSize: 12, borderRadius: 6, border: "none" };
const editBtn = { background: "#f59e0b", color: "#fff", padding: "4px 8px", borderRadius: 6, border: "none" };
const deleteBtn = { background: "#dc2626", color: "#fff", padding: "4px 8px", borderRadius: 6, border: "none" };
const assignDropdown = { padding: "4px 6px", borderRadius: 6, fontSize: 12 };

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "#fff",
  padding: 24,
  borderRadius: 14,
  width: 400,
  boxShadow: "0 20px 50px rgba(0,0,0,0.15)"
};

const closeBtn = {
  marginTop: 15,
  padding: "5px 10px",
  background: "#1e3a8a",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 12
};

export default OfficersPage;