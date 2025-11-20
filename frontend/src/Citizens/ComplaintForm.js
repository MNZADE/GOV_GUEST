import React, { useEffect, useState } from "react";
import Select from "react-select";
import logo from "D:/govguest/frontend/src/assets/logo.png";

// Departments
const DEPARTMENTS = {
  "Sanitation & Solid Waste Department": [
    "Garbage Not Collected",
    "Overflowing Bins",
    "Dead Animal Removal",
    "Street Sweeping Required",
  ],
  "Water Supply Department": [
    "Water Leakage",
    "Low Water Pressure",
    "No Water Supply",
    "Damaged Water Pipe",
  ],
  "Roads & Transportation Department": [
    "Road Damage",
    "Potholes",
    "Footpath Broken",
    "Speed Breaker Required",
  ],
  "Street Light / Electrical Department": [
    "Street Light Not Working",
    "Flickering Light",
    "Pole Damaged",
    "New Light Required",
  ],
  "Drainage & Sewerage Department": [
    "Drainage Blocked",
    "Sewer Overflow",
    "Manhole Broken",
    "Bad Smell From Drain",
  ],
  "Health Department": [
    "Mosquito Problem",
    "Garbage Burning",
    "Public Toilet Issue",
    "Health Hazard",
  ],
  "Other Department": ["Other Issue", "Unlisted Problem", "General Complaint"],
};

const ComplaintForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [citizen, setCitizen] = useState({
    name: "",
    aadhaar: "",
    phone: "",
    address: "",
  });

  const [departments, setDepartments] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [formData, setFormData] = useState({
    optionalAddress: "",
    issue: "",
    description: "",
  });

  const [images, setImages] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("citizenData");
    if (!stored) {
      alert("Session expired");
      window.location.href = "/";
    }
    setCitizen(JSON.parse(stored));
  }, []);

  const handleDepartmentChange = (selected) => {
    setDepartments(selected);
    const allSubs = selected.flatMap((dep) => DEPARTMENTS[dep.value]);
    setSubcategories(allSubs);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) return alert("Max 5 images allowed");

    const valid = files.filter((f) => f.size < 5 * 1024 * 1024);
    if (valid.length !== files.length) alert("Each image must be below 5MB");

    const mapped = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages([...images, ...mapped]);
  };

  const deleteImage = (i) => {
    const temp = [...images];
    temp.splice(i, 1);
    setImages(temp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("name", citizen.name);
      fd.append("aadhaar", citizen.aadhaar);
      fd.append("phone", citizen.phone);
      fd.append("address", citizen.address);

      fd.append("optionalAddress", formData.optionalAddress);
      fd.append("issue", formData.issue);
      fd.append("description", formData.description);

      fd.append("departments", JSON.stringify(departments.map((d) => d.value)));
      fd.append(
        "subcategories",
        JSON.stringify(
          Array.isArray(subcategories)
            ? subcategories
            : subcategories.map((s) => s.value)
        )
      );

      images.forEach((img) => fd.append("images", img.file));

      const res = await fetch(
        "http://localhost:5000/api/complaints/submit",
        {
          method: "POST",
          body: fd,
        }
      );

      const data = await res.json();
      if (!data.success) return alert("Error submitting complaint");

      alert("Complaint Submitted Successfully!");
      window.location.href = "/track-complaints";
    } catch {
      alert("Server Error");
    }
    setSubmitting(false);
  };

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} style={styles.logo} alt="logo" />
          <h2 style={styles.navTitle}>Kolhapur Municipal Corporation</h2>
        </div>

        <button
          style={styles.backButton}
          onClick={() => (window.location.href = "/citizen-dashboard")}
        >
          ⬅ Back to Dashboard
        </button>
      </div>

      {/* FORM CARD */}
      <div style={styles.formWrapper}>
        <div style={styles.card}>
          <h1 style={styles.title}>📝 Submit a Complaint</h1>
          <p style={styles.subtitle}>
            Fill out your complaint details below for faster municipal action.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={styles.twoColumn}>
              {/* LEFT */}
              <div style={styles.column}>
                <Input label="Full Name" value={citizen.name} readOnly />
                <Input label="Aadhaar Number" value={citizen.aadhaar} readOnly />
                <Input label="Phone Number" value={citizen.phone} readOnly />
                <Input label="Address" value={citizen.address} readOnly />
                <Input
                  label="Nearby Landmark (Optional)"
                  placeholder="Enter landmark"
                  value={formData.optionalAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      optionalAddress: e.target.value,
                    })
                  }
                />
              </div>

              {/* RIGHT */}
              <div style={styles.column}>
                <label style={styles.label}>Select Department</label>
                <Select
                  isMulti
                  options={Object.keys(DEPARTMENTS).map((d) => ({
                    label: d,
                    value: d,
                  }))}
                  value={departments}
                  onChange={handleDepartmentChange}
                  styles={reactSelectStyle}
                />

                {departments.length > 0 && (
                  <>
                    <label style={styles.label}>Select Sub-Category</label>
                    <Select
                      isMulti
                      options={subcategories.map((s) => ({
                        label: s,
                        value: s,
                      }))}
                      onChange={(selected) =>
                        setSubcategories(selected.map((s) => s.value))
                      }
                      styles={reactSelectStyle}
                    />
                  </>
                )}

                <Input
                  label="Complaint Title"
                  placeholder="Short title"
                  required
                  value={formData.issue}
                  onChange={(e) =>
                    setFormData({ ...formData, issue: e.target.value })
                  }
                />

                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Describe your issue..."
                  value={formData.description}
                  required
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                ></textarea>

                <label style={styles.label}>Upload Images (Max 5)</label>
                <div style={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={styles.fileInput}
                  />
                  📂 Click to upload images
                </div>

                <div style={styles.previewGrid}>
                  {images.map((img, i) => (
                    <div key={i} style={styles.previewItem}>
                      <img src={img.preview} style={styles.previewImage} />
                      <button
                        type="button"
                        style={styles.deleteBtn}
                        onClick={() => deleteImage(i)}
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button style={styles.submitButton} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Complaint 🚀"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* INPUT COMPONENT */
const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: "5px" }}>
    <label style={styles.label}>{label}</label>
    <input {...props} style={styles.input} />
  </div>
);

/* react-select styling */
const reactSelectStyle = {
  control: (base) => ({
    ...base,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "10px",
    padding: "2px",
    color: "#fff",
  }),
  menu: (base) => ({
    ...base,
    background: "#003366",
    color: "#fff",
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "#0055aa" : "#003366",
    color: "#fff",
  }),
};

/* UPDATED MODERN UI */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #003366, #004c99)",
    paddingTop: "110px",
    paddingBottom: "60px",
    fontFamily: "'Poppins', sans-serif",
  },

  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    height: "75px",
    background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.10px",
    zIndex: 10,
  },

  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  logo: {
    width: "55px",
    height: "55px",
    borderRadius: "50%",
  },

  navTitle: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "600",
  },

  backButton: {
    background: "#ffcc00",
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    color: "#003366",
    marginRight: "80px",   // ← shifts button slightly left
    whiteSpace: "nowrap",  // ← prevents cutting of text
  },

  formWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "0 20px",
  },

  card: {
    width: "100%",
    maxWidth: "1000px",
    background: "rgba(255,255,255,0.15)",
    padding: "40px",
    borderRadius: "20px",
    color: "#fff",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
  },

  title: {
    textAlign: "center",
    fontSize: "32px",
    fontWeight: "700",
    color: "#ffcc00",
    marginBottom: "8px",
  },

  subtitle: {
    textAlign: "center",
    color: "#d6e6ff",
    marginBottom: "35px",
    fontSize: "15px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  label: {
    marginBottom: "6px",
    color: "#ffcc00",
    fontWeight: "600",
    fontSize: "14px",
  },

  input: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: "10px",
    padding: "14px",
    color: "#fff",
    fontSize: "14px",
    width: "100%",
  },

  textarea: {
    width: "100%",
    height: "110px",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: "14px",
  },

  uploadBox: {
    border: "2px dashed rgba(255,255,255,0.45)",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "12px",
    position: "relative",
    cursor: "pointer",
    color: "#e6e6e6",
    fontSize: "15px",
  },

  fileInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    cursor: "pointer",
  },

  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "14px",
  },

  previewItem: {
    position: "relative",
  },

  previewImage: {
    width: "100%",
    height: "130px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "2px solid rgba(255,255,255,0.3)",
  },

  deleteBtn: {
    position: "absolute",
    top: "5px",
    right: "5px",
    background: "rgba(0,0,0,0.65)",
    borderRadius: "50%",
    padding: "6px 9px",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontSize: "14px",
  },

  submitButton: {
    width: "100%",
    padding: "16px",
    fontSize: "18px",
    marginTop: "30px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(90deg, #ffcc00, #ffd633)",
    color: "#003366",
    fontWeight: "700",
    boxShadow: "0 5px 15px rgba(0,0,0,0.25)",
  },
};

export default ComplaintForm;
