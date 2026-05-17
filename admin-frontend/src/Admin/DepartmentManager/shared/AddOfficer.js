import React, {
  useState,
  useEffect,
} from "react";

const AddOfficer = ({
  department,
  onAddOfficer,
  onBack,
}) => {

  const [officer, setOfficer] =
    useState({

      department: "",

      empId: "",

      fullName: "",

      gender: "",

      dob: "",

      phone: "",

      email: "",

      role: "Clerk",

      joiningDate: "",

      address: "",

      status: "Active",
    });

  /* =====================================
     DEPARTMENT CODES
  ===================================== */

  const departmentCodes = {

    "Electricity Department":
      "ELE",

    "Water Supply Department":
      "WAT",

    "Health Department":
      "HLT",

    "Sanitation Department":
      "SAN",

    "Road Department":
      "ROD",
  };

  /* =====================================
     GENERATE EMPLOYEE ID
  ===================================== */

  useEffect(() => {

    if (department) {

      const normalizedDept =
        department.trim();

      const prefix =
        departmentCodes[
          normalizedDept
        ] || "DEP";

      const id =

        prefix +
        "-" +
        Math.floor(

          10000 +
            Math.random() *
              90000
        );

      setOfficer((prev) => ({

        ...prev,

        department:
          normalizedDept,

        empId: id,
      }));
    }

  }, [department]);

  /* =====================================
     HANDLE CHANGE
  ===================================== */

  const handleChange = (
    key,
    value
  ) => {

    setOfficer({

      ...officer,

      [key]: value,
    });
  };

  /* =====================================
     VALIDATION
  ===================================== */

  const validateForm = () => {

    /* =========================
       REQUIRED FIELDS
    ========================= */

    if (

      !officer.fullName ||
      !officer.phone ||
      !officer.email ||
      !officer.gender ||
      !officer.dob ||
      !officer.joiningDate ||
      !officer.address

    ) {

      alert(
        "Please fill all required fields"
      );

      return false;
    }

    /* =========================
       NAME VALIDATION
    ========================= */

    const nameRegex =
      /^[A-Za-z\s]+$/;

    if (

      !nameRegex.test(
        officer.fullName
      )

    ) {

      alert(
        "Full Name should contain only letters"
      );

      return false;
    }

    /* =========================
       PHONE VALIDATION
    ========================= */

    const phoneRegex =
      /^[6-9]\d{9}$/;

    if (

      !phoneRegex.test(
        officer.phone
      )

    ) {

      alert(
        "Enter valid 10-digit Indian mobile number"
      );

      return false;
    }

    /* =========================
       EMAIL VALIDATION
    ========================= */

    const gmailRegex =
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (

      !gmailRegex.test(
        officer.email
      )

    ) {

      alert(
        "Please enter valid Gmail address"
      );

      return false;
    }

    /* =========================
       AGE VALIDATION
    ========================= */

    const dob =
      new Date(
        officer.dob
      );

    const today =
      new Date();

    let age =
      today.getFullYear() -
      dob.getFullYear();

    const monthDiff =
      today.getMonth() -
      dob.getMonth();

    if (

      monthDiff < 0 ||

      (
        monthDiff === 0 &&
        today.getDate() <
          dob.getDate()
      )
    ) {

      age--;
    }

    if (age < 18) {

      alert(
        "Officer must be at least 18 years old"
      );

      return false;
    }

    /* =========================
       JOINING DATE VALIDATION
    ========================= */

    const joining =
      new Date(
        officer.joiningDate
      );

    if (
      joining > today
    ) {

      alert(
        "Joining date cannot be future date"
      );

      return false;
    }

    return true;
  };

  /* =====================================
     SUBMIT
  ===================================== */

  const handleSubmit =
    async () => {

      try {

        /* =========================
           VALIDATE
        ========================= */

        if (
          !validateForm()
        ) {

          return;
        }

        /* =========================
           TOKEN
        ========================= */

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        /* =========================
           API CALL
        ========================= */

        const response =
          await fetch(

            "http://localhost:5000/api/officers/register",

            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  officer
                ),
            }
          );

        const data =
          await response.json();

        /* =========================
           SUCCESS
        ========================= */

        if (data.success) {

          alert(
            "Officer Registered Successfully"
          );

          if (onAddOfficer) {

            onAddOfficer(
              data.officer
            );
          }

          onBack();

        } else {

          alert(

            data.message ||
            "Registration Failed"
          );
        }

      } catch (err) {

        console.error(err);

        alert(
          "Server Error"
        );
      }
    };

  return (

    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.govHeader}>

        <div>

          <h1 style={styles.govTitle}>
            Kolhapur Municipal Corporation
          </h1>

          <p style={styles.govSub}>
            {department}
          </p>

        </div>

        <div style={styles.formCode}>
          FORM-OFFICER/REG/2026
        </div>

      </div>

      {/* FORM */}

      <div style={styles.card}>

        {/* ADMIN SECTION */}

        <h3 style={styles.section}>
          I. Administrative Details
        </h3>

        <div style={styles.grid}>

          <Field label="Department">

            <input
              value={
                officer.department
              }
              disabled
            />

          </Field>

          <Field label="Employee ID">

            <input
              value={
                officer.empId
              }
              disabled
            />

          </Field>

          <Field label="Personal Gmail">

            <input

              type="email"

              placeholder="Enter Gmail"

              value={
                officer.email
              }

              onChange={(e) =>

                handleChange(

                  "email",

                  e.target.value
                )
              }
            />

          </Field>

          <Field label="Role">

            <select

              value={
                officer.role
              }

              onChange={(e) =>

                handleChange(

                  "role",

                  e.target.value
                )
              }
            >

              <option>
                Clerk
              </option>

              <option>
                Inspector
              </option>

              <option>
                Manager
              </option>

            </select>

          </Field>

          <Field label="Joining Date">

            <input

              type="date"

              value={
                officer.joiningDate
              }

              onChange={(e) =>

                handleChange(

                  "joiningDate",

                  e.target.value
                )
              }
            />

          </Field>

          <Field label="Status">

            <select

              value={
                officer.status
              }

              onChange={(e) =>

                handleChange(

                  "status",

                  e.target.value
                )
              }
            >

              <option>
                Active
              </option>

              <option>
                Suspended
              </option>

              <option>
                Transferred
              </option>

            </select>

          </Field>

        </div>

        {/* PERSONAL SECTION */}

        <h3 style={styles.section}>
          II. Personal Information
        </h3>

        <div style={styles.grid}>

          <Field label="Full Name">

            <input

              placeholder="Enter Full Name"

              value={
                officer.fullName
              }

              onChange={(e) =>

                handleChange(

                  "fullName",

                  e.target.value
                )
              }
            />

          </Field>

          <Field label="Gender">

            <select

              value={
                officer.gender
              }

              onChange={(e) =>

                handleChange(

                  "gender",

                  e.target.value
                )
              }
            >

              <option value="">
                Select
              </option>

              <option>
                Male
              </option>

              <option>
                Female
              </option>

              <option>
                Other
              </option>

            </select>

          </Field>

          <Field label="Date of Birth">

            <input

              type="date"

              value={
                officer.dob
              }

              onChange={(e) =>

                handleChange(

                  "dob",

                  e.target.value
                )
              }
            />

          </Field>

          <Field label="Contact Number">

            <input

              type="tel"

              maxLength={10}

              placeholder="Enter Mobile Number"

              value={
                officer.phone
              }

              onChange={(e) =>

                handleChange(

                  "phone",

                  e.target.value
                    .replace(
                      /\D/g,
                      ""
                    )
                )
              }
            />

          </Field>

          <Field
            label="Residential Address"
            full
          >

            <textarea

              rows={3}

              placeholder="Enter Full Address"

              value={
                officer.address
              }

              onChange={(e) =>

                handleChange(

                  "address",

                  e.target.value
                )
              }
            />

          </Field>

        </div>

        {/* ACTION BUTTONS */}

        <div style={styles.actions}>

          <button

            style={
              styles.primaryBtn
            }

            onClick={
              handleSubmit
            }
          >

            Submit Registration

          </button>

          <button

            style={
              styles.secondaryBtn
            }

            onClick={onBack}
          >

            Cancel

          </button>

        </div>

      </div>

    </div>
  );
};

/* =====================================
   REUSABLE FIELD
===================================== */

const Field = ({
  label,
  children,
  full,
}) => (

  <div

    style={{

      ...styles.field,

      gridColumn:
        full
          ? "1 / span 2"
          : "auto",
    }}
  >

    <label style={styles.label}>
      {label.toUpperCase()}
    </label>

    {children}

  </div>
);

/* =====================================
   STYLES
===================================== */

const styles = {

  page: {

    minHeight: "100vh",

    padding: "40px",

    background:
      "linear-gradient(135deg,#dbeafe,#f0f9ff,#e0f2fe)",

    fontFamily:
      "'Poppins', sans-serif",
  },

  govHeader: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: "30px",

    padding:
      "20px 25px",

    background:
      "rgba(255,255,255,0.6)",

    backdropFilter:
      "blur(15px)",

    borderRadius: "20px",

    boxShadow:
      "0 8px 25px rgba(0,0,0,0.08)",
  },

  govTitle: {

    margin: 0,

    fontSize: "30px",

    fontWeight: "700",

    color: "#0f172a",
  },

  govSub: {

    marginTop: "6px",

    color: "#0369a1",

    fontSize: "15px",

    fontWeight: "500",
  },

  formCode: {

    background:
      "#0ea5e9",

    color: "#fff",

    padding:
      "10px 18px",

    borderRadius: "12px",

    fontSize: "13px",

    fontWeight: "600",
  },

  card: {

    background:
      "rgba(255,255,255,0.72)",

    backdropFilter:
      "blur(16px)",

    borderRadius: "28px",

    padding: "40px",

    boxShadow:
      "0 15px 35px rgba(0,0,0,0.08)",
  },

  section: {

    fontSize: "18px",

    fontWeight: "700",

    marginBottom: "22px",

    marginTop: "30px",

    color: "#0f172a",
  },

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",

    gap: "24px",
  },

  field: {

    display: "flex",

    flexDirection: "column",
  },

  label: {

    marginBottom: "8px",

    fontSize: "12px",

    fontWeight: "700",

    color: "#334155",
  },

  actions: {

    marginTop: "45px",

    display: "flex",

    justifyContent:
      "flex-end",

    gap: "18px",
  },

  primaryBtn: {

    background:
      "linear-gradient(135deg,#0284c7,#0ea5e9)",

    color: "#fff",

    padding:
      "14px 34px",

    border: "none",

    borderRadius: "14px",

    cursor: "pointer",

    fontSize: "15px",

    fontWeight: "600",
  },

  secondaryBtn: {

    background:
      "linear-gradient(135deg,#64748b,#94a3b8)",

    color: "#fff",

    padding:
      "14px 34px",

    border: "none",

    borderRadius: "14px",

    cursor: "pointer",

    fontSize: "15px",

    fontWeight: "600",
  },
};

export default AddOfficer;