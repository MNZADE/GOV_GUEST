import React, { useState, useEffect } from "react";

const AddOfficer = ({ department, onAddOfficer, onBack }) => {
  const [officer, setOfficer] = useState({
    department: "",
    empId: "",
    fullName: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    designation: "",
    role: "Clerk",
    joiningDate: "",
    address: "",
    status: "Active",
  });

  // ✅ Exact department names (must match login/router)
  const departmentCodes = {
    "Electricity Department": "ELE",
    "Water Supply Department": "WAT",
    "Health Department": "HLT",
    "Sanitation Department": "SAN",
  };

  const departmentDomains = {
    "Electricity Department": "electricity",
    "Water Supply Department": "water",
    "Health Department": "health",
    "Sanitation Department": "sanitation",
  };

  // Generate Employee ID + Official Email
  useEffect(() => {
    if (department) {
      const normalizedDept = department.trim();
      const prefix = departmentCodes[normalizedDept] || "DEP";

      const id =
        prefix + "-" + Math.floor(10000 + Math.random() * 90000);

      const domain = departmentDomains[normalizedDept] || "dept";

      const generatedEmail =
        id.toLowerCase() + "@" + domain + ".kmc.gov.in";

      setOfficer((prev) => ({
        ...prev,
        department: normalizedDept,
        empId: id,
        email: generatedEmail,
      }));
    }
  }, [department]);

  const handleChange = (key, value) => {
    setOfficer({ ...officer, [key]: value });
  };

  const handleSubmit = () => {
    if (!officer.fullName || !officer.phone) {
      alert("Full Name and Contact Number are mandatory.");
      return;
    }

    onAddOfficer(officer);
    onBack();
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.govHeader}>
        <div>
          <h1 style={styles.govTitle}>
            Kolhapur Municipal Corporation
          </h1>
          <p style={styles.govSub}>{department}</p>
        </div>
        <div style={styles.formCode}>
          FORM-OFFICER/REG/2026
        </div>
      </div>

      {/* FORM CARD */}
      <div style={styles.card}>
        <h3 style={styles.section}>
          I. Administrative Details
        </h3>

        <div style={styles.grid}>
          <Field label="Department">
            <input value={officer.department} disabled />
          </Field>

          <Field label="Employee ID">
            <input value={officer.empId} disabled />
          </Field>

          <Field label="Official Email ID">
            <input value={officer.email} disabled />
          </Field>

          <Field label="Designation">
            <input
              value={officer.designation}
              onChange={(e) =>
                handleChange("designation", e.target.value)
              }
            />
          </Field>

          <Field label="Role">
            <select
              value={officer.role}
              onChange={(e) =>
                handleChange("role", e.target.value)
              }
            >
              <option>Clerk</option>
              <option>Inspector</option>
              <option>Manager</option>
            </select>
          </Field>

          <Field label="Joining Date">
            <input
              type="date"
              value={officer.joiningDate}
              onChange={(e) =>
                handleChange("joiningDate", e.target.value)
              }
            />
          </Field>

          <Field label="Status">
            <select
              value={officer.status}
              onChange={(e) =>
                handleChange("status", e.target.value)
              }
            >
              <option>Active</option>
              <option>Suspended</option>
              <option>Transferred</option>
            </select>
          </Field>
        </div>

        <h3 style={styles.section}>
          II. Personal Information
        </h3>

        <div style={styles.grid}>
          <Field label="Full Name">
            <input
              value={officer.fullName}
              onChange={(e) =>
                handleChange("fullName", e.target.value)
              }
            />
          </Field>

          <Field label="Gender">
            <select
              value={officer.gender}
              onChange={(e) =>
                handleChange("gender", e.target.value)
              }
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Field>

          <Field label="Date of Birth">
            <input
              type="date"
              value={officer.dob}
              onChange={(e) =>
                handleChange("dob", e.target.value)
              }
            />
          </Field>

          <Field label="Contact Number">
            <input
              value={officer.phone}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
            />
          </Field>

          <Field label="Residential Address" full>
            <textarea
              rows={3}
              value={officer.address}
              onChange={(e) =>
                handleChange("address", e.target.value)
              }
            />
          </Field>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.primaryBtn}
            onClick={handleSubmit}
          >
            Submit Registration
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={onBack}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* Reusable Field */
const Field = ({ label, children, full }) => (
  <div
    style={{
      ...styles.field,
      gridColumn: full ? "1 / span 2" : "auto",
    }}
  >
    <label style={styles.label}>
      {label.toUpperCase()}
    </label>
    {children}
  </div>
);

/* Styling */
const styles = {
  page: {
    maxWidth: "1150px",
    margin: "40px auto",
    fontFamily: "Segoe UI, Arial, sans-serif",
  },
  govHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "3px solid #1e3a8a",
    paddingBottom: "15px",
    marginBottom: "25px",
  },
  govTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
  },
  govSub: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
  formCode: {
    fontSize: "12px",
    color: "#6b7280",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #d1d5db",
    padding: "35px",
  },
  section: {
    marginTop: "25px",
    marginBottom: "15px",
    fontSize: "15px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "22px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  actions: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
  },
  primaryBtn: {
    background: "#1e3a8a",
    color: "#fff",
    padding: "12px 32px",
    border: "none",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#6b7280",
    color: "#fff",
    padding: "12px 32px",
    border: "none",
    cursor: "pointer",
  },
};

export default AddOfficer;