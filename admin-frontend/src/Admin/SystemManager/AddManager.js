import React, {
  useState,
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

/* =====================================================
   📧 GENERATE OFFICIAL EMAIL
===================================================== */

const generateOfficialEmail = (
  name,
  department,
  role
) => {

  if (!name) return "";

  const firstName =
    name
      .trim()
      .split(" ")[0]
      .toLowerCase();

  const unique =
    Math.floor(
      1000 +
        Math.random() *
          9000
    );

  /* =========================================
     SYSTEM MANAGER
  ========================================= */

  if (
    role ===
    "System Manager"
  ) {

    return `sm.${firstName}.${unique}@kmc.gov.in`;
  }

  /* =========================================
     DEPARTMENT MANAGER
  ========================================= */

  if (!department) return "";

  const deptMap = {

    "Health Department":
      "health",

    "Sanitation Department":
      "sanitation",

    "Water Supply Department":
      "water",

    "Electricity Department":
      "electricity",

    "Road & Transportation Department":
      "roads",

    "Drainage & Sewage Department":
      "drainage",

    "General Complaint Department":
      "general",
  };

  const deptKey =
    deptMap[department];

  if (!deptKey) return "";

  return `${deptKey}.${firstName}.${unique}@kmc.gov.in`;
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

const AddManager = () => {

  const navigate =
    useNavigate();

  /* =========================================
     STATES
  ========================================= */

  const [
    accountType,
    setAccountType,
  ] = useState(
    "Department Manager"
  );

  const [
    verified,
    setVerified,
  ] = useState(false);

  const [
    verification,
    setVerification,
  ] = useState({

    email: "",

    password: "",
  });

  const [
    form,
    setForm,
  ] = useState({

    fullName: "",

    address: "",

    department: "",

    officialEmail: "",

    personalEmail: "",

    phone: "",

    password: "",

    isActive: true,
  });

  const [
    message,
    setMessage,
  ] = useState("");

  /* =====================================================
     AUTO GENERATE EMAIL
  ===================================================== */

  useEffect(() => {

    setForm((prev) => ({

      ...prev,

      officialEmail:
        generateOfficialEmail(

          prev.fullName,

          prev.department,

          accountType
        ),
    }));

  }, [

    form.fullName,

    form.department,

    accountType,
  ]);

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange =
    (e) => {

      const {
        name,
        value,
        type,
        checked,
      } = e.target;

      /* PHONE VALIDATION */

      if (
        name === "phone"
      ) {

        if (
          !/^\d{0,10}$/.test(
            value
          )
        ) {

          return;
        }
      }

      setForm({

        ...form,

        [name]:

          type ===
          "checkbox"

            ? checked

            : value,
      });
    };

  /* =====================================================
     VERIFY OLD SYSTEM MANAGER
  ===================================================== */

  const verifyOldManager =
    async () => {

      setMessage("");

      if (

        !verification.email ||

        !verification.password

      ) {

        setMessage(
          "❌ Enter old System Manager credentials"
        );

        return;
      }

      try {

        const res =
          await fetch(

            "http://localhost:5000/api/manager-auth/login",

            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({

                  email:
                    verification.email,

                  password:
                    verification.password,
                }),
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          setMessage(
            "❌ Invalid credentials"
          );

          return;
        }

        /* CHECK ROLE */

        if (

          data.user.role !==
          "system_manager"

        ) {

          setMessage(
            "❌ Only System Manager can verify"
          );

          return;
        }

        setVerified(true);

        setMessage(
          "✅ Verification successful"
        );

      } catch (error) {

        console.error(
          error
        );

        setMessage(
          "❌ Server error"
        );
      }
    };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const submit =
    async () => {

      setMessage("");

      /* VALIDATION */

      if (

        !form.fullName ||

        !form.password

      ) {

        setMessage(
          "❌ Please fill all required fields"
        );

        return;
      }

      if (

        accountType ===
          "Department Manager" &&

        !form.department

      ) {

        setMessage(
          "❌ Please select department"
        );

        return;
      }

      if (
        form.phone.length !==
        10
      ) {

        setMessage(
          "❌ Phone number must be exactly 10 digits"
        );

        return;
      }

      if (
        form.password.length <
        6
      ) {

        setMessage(
          "❌ Password must be at least 6 characters"
        );

        return;
      }

      if (

        accountType ===
          "System Manager" &&

        !verified

      ) {

        setMessage(
          "❌ Verify old System Manager first"
        );

        return;
      }

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        await axios.post(

          "http://localhost:5000/api/manager/create-manager",

          {

            name:
              form.fullName,

            email:
              form.officialEmail,

            password:
              form.password,

            department:

              accountType ===
              "System Manager"

                ? null

                : form.department,

            personalEmail:
              form.personalEmail,

            mobile:
              form.phone,

            address:
              form.address,

            isActive:
              form.isActive,

            role:

              accountType ===
              "System Manager"

                ? "system_manager"

                : "department_manager",
          },

          {
            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setMessage(
          `✅ ${accountType} created successfully`
        );

        setTimeout(() => {

          navigate(
            "/system-manager/managers"
          );

        }, 1200);

      } catch (error) {

        console.error(
          error
        );

        setMessage(

          error.response
            ?.data?.message ||

          "❌ Failed to create manager"
        );
      }
    };

  /* =====================================================
     JSX
  ===================================================== */

  return (

    <div style={styles.page}>

      <div style={styles.card}>

        {/* HEADER */}

        <div style={styles.header}>

          <div>

            <h2 style={styles.title}>
              Department Manager Registration
            </h2>

            <p style={styles.subTitle}>
              Government Employee Account Creation Portal
            </p>

          </div>

        </div>

        {/* MESSAGE */}

        {message && (

          <div
            style={{
              ...styles.message,

              background:
                message.startsWith(
                  "✅"
                )

                  ? "#ecfdf5"

                  : "#fee2e2",

              color:
                message.startsWith(
                  "✅"
                )

                  ? "#065f46"

                  : "#b91c1c",
            }}
          >
            {message}
          </div>
        )}

        {/* ACCOUNT TYPE */}

        <div style={styles.field}>

          <label style={styles.label}>
            Account Type
          </label>

          <select
            value={
              accountType
            }
            onChange={(e) => {

              setAccountType(
                e.target.value
              );

              setVerified(
                false
              );

              setForm(
                (prev) => ({

                  ...prev,

                  department:
                    "",
                })
              );
            }}
            style={
              styles.input
            }
          >

            <option>
              Department Manager
            </option>

            <option>
              System Manager
            </option>

          </select>

        </div>

        {/* VERIFY SYSTEM MANAGER */}

        {accountType ===
          "System Manager" &&

          !verified && (

          <>

            <Field
              label="Current System Manager Email"
              value={
                verification.email
              }
              onChange={(e) =>
                setVerification({

                  ...verification,

                  email:
                    e.target
                      .value,
                })
              }
            />

            <Field
              label="Current System Manager Password"
              type="password"
              value={
                verification.password
              }
              onChange={(e) =>
                setVerification({

                  ...verification,

                  password:
                    e.target
                      .value,
                })
              }
            />

            <div
              style={
                styles.buttonRow
              }
            >

              <button
                onClick={
                  verifyOldManager
                }
                style={
                  styles.primaryBtn
                }
              >
                Verify Credentials
              </button>

            </div>

          </>
        )}

        {/* MAIN FORM */}

        {(accountType ===
          "Department Manager" ||

          verified) && (

          <>

            <Field
              label="Full Name"
              name="fullName"
              value={
                form.fullName
              }
              onChange={
                handleChange
              }
            />

            <Field
              label="Residential Address"
              name="address"
              value={
                form.address
              }
              onChange={
                handleChange
              }
            />

            {/* DEPARTMENT */}

            {accountType ===
              "Department Manager" && (

              <div
                style={
                  styles.field
                }
              >

                <label
                  style={
                    styles.label
                  }
                >
                  Department
                </label>

                <select
                  name="department"
                  value={
                    form.department
                  }
                  onChange={
                    handleChange
                  }
                  style={
                    styles.input
                  }
                >

                  <option value="">
                    Select Department
                  </option>

                  <option>
                    Health Department
                  </option>

                  <option>
                    Sanitation Department
                  </option>

                  <option>
                    Water Supply Department
                  </option>

                  <option>
                    Electricity Department
                  </option>

                  <option>
                    Road & Transportation Department
                  </option>

                  <option>
                    Drainage & Sewage Department
                  </option>

                  <option>
                    General Complaint Department
                  </option>

                </select>

              </div>
            )}

            <Field
              label="Designation"
              value={
                accountType
              }
              disabled
            />

            <Field
              label="Official Email (Login ID)"
              value={
                form.officialEmail
              }
              disabled
            />

            <Field
              label="Personal Email"
              name="personalEmail"
              value={
                form.personalEmail
              }
              onChange={
                handleChange
              }
            />

            <Field
              label="Mobile Number"
              name="phone"
              value={
                form.phone
              }
              onChange={
                handleChange
              }
            />

            <Field
              label="Temporary Password"
              name="password"
              value={
                form.password
              }
              onChange={
                handleChange
              }
              type="password"
            />

            {/* ACTIVE */}

            <div
              style={
                styles.checkboxRow
              }
            >

              <input
                type="checkbox"
                name="isActive"
                checked={
                  form.isActive
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Activate login immediately
              </span>

            </div>

            {/* BUTTONS */}

            <div
              style={
                styles.buttonRow
              }
            >

              <button
                onClick={submit}
                style={
                  styles.primaryBtn
                }
              >
                Create Manager
              </button>

              <button
                onClick={() =>
                  navigate(
                    "/system-manager/managers"
                  )
                }
                style={
                  styles.secondaryBtn
                }
              >
                Cancel
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
};

/* =====================================================
   FIELD COMPONENT
===================================================== */

const Field = ({

  label,

  name,

  value,

  onChange,

  disabled,

  type = "text",

}) => (

  <div style={styles.field}>

    <label style={styles.label}>
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      style={{
        ...styles.input,

        background:

          disabled

            ? "#f3f4f6"

            : "#fff",
      }}
    />

  </div>
);

/* =====================================================
   STYLES
===================================================== */

const styles = {

  page: {

    minHeight:
      "100vh",

    background:
      "linear-gradient(to bottom right, #eff6ff, #f8fafc)",

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "flex-start",

    padding:
      "40px 20px",

    fontFamily:
      "Segoe UI, sans-serif",
  },

  card: {

    width: "520px",

    background:
      "#ffffff",

    padding: 30,

    borderRadius: 22,

    boxShadow:
      "0 18px 45px rgba(0,0,0,0.12)",
  },

  header: {

    marginBottom: 25,
  },

  title: {

    textAlign:
      "center",

    color: "#0f172a",

    marginBottom: 8,

    fontSize: 28,

    fontWeight: 700,
  },

  subTitle: {

    textAlign:
      "center",

    fontSize: 14,

    color: "#64748b",
  },

  field: {

    marginBottom: 16,
  },

  label: {

    fontSize: 14,

    fontWeight: 600,

    marginBottom: 7,

    display: "block",

    color: "#0f172a",
  },

  input: {

    width: "100%",

    padding:
      "12px 14px",

    borderRadius: 12,

    border:
      "1px solid #d1d5db",

    fontSize: 14,

    outline: "none",

    transition:
      "0.3s",
  },

  checkboxRow: {

    display: "flex",

    gap: 10,

    margin:
      "20px 0 25px",

    alignItems:
      "center",
  },

  buttonRow: {

    display: "flex",

    gap: 14,
  },

  primaryBtn: {

    flex: 1,

    padding: 14,

    background:
      "linear-gradient(to right, #2563eb, #1d4ed8)",

    color: "#fff",

    borderRadius: 12,

    border: "none",

    fontWeight: 700,

    cursor: "pointer",

    fontSize: 15,
  },

  secondaryBtn: {

    flex: 1,

    padding: 14,

    background:
      "#e5e7eb",

    borderRadius: 12,

    border: "none",

    fontWeight: 700,

    cursor: "pointer",

    fontSize: 15,
  },

  message: {

    padding: 14,

    borderRadius: 12,

    marginBottom: 18,

    textAlign: "center",

    fontWeight: 600,
  },
};

export default AddManager;