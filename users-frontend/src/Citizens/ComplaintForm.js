import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useTranslation } from "react-i18next";
import EXIF from "exif-js";
import logo from "../assets/logo.png";

/* ================================
   DEPARTMENTS
================================ */
const DEPARTMENTS = {
  sanitation: ["garbage","overflowBins","deadAnimal","streetCleaning"],
  water: ["waterLeak","lowPressure","noWater","pipeDamage"],
  roads: ["roadDamage","potholes","footpath","speedBreaker"],
  streetLight: ["lightNotWorking","flickering","poleDamage","newLight"],
  drainage: ["drainBlocked","sewerOverflow","manhole","badSmell"],
  health: ["mosquito","garbageBurning","toiletIssue","healthHazard"],
  other: ["other","general"],
};

const ComplaintForm = () => {
  const { t, i18n } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const [citizen, setCitizen] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);

  const [formData, setFormData] = useState({
    optionalAddress: "",
    issue: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [geoError, setGeoError] = useState("");

  /* ================= LOAD ================= */
  useEffect(() => {
  const savedLang =
    localStorage.getItem("lang") ||
    localStorage.getItem("preferredLanguage") ||
    "mr";

  i18n.changeLanguage(savedLang);

  const stored = localStorage.getItem("citizenData");

  if (!stored) {
    alert(t("common.sessionExpired"));
    window.location.href = "/";
    return;
  }

  const user = JSON.parse(stored);
  setCitizen(user);

  // ✅ EDIT MODE (WORKING FIX)
  const editData = JSON.parse(localStorage.getItem("editComplaint"));

  if (editData) {
    console.log("✏️ Editing complaint:", editData);

    // basic fields
    setFormData({
      optionalAddress: editData.optionalAddress || "",
      issue: editData.issue || "",
      description: editData.description || "",
    });

    // departments
    if (editData.departments && editData.departments.length > 0) {
      const deptOptions = editData.departments.map((d) => ({
        label: t(`departments.${d}`),
        value: d,
      }));

      setDepartments(deptOptions);

      // build subcategories correctly
      const allSubs = deptOptions.flatMap(
        (dep) => DEPARTMENTS[dep.value] || []
      );

      setSubcategories(allSubs);

      // selected subcategories
      if (editData.subcategories && editData.subcategories.length > 0) {
        setSelectedSubcategories(editData.subcategories);
      }
    }

    // clear after use
    localStorage.removeItem("editComplaint");
  }

}, []);
  /* ================= DEPARTMENT ================= */
  const handleDepartmentChange = (selected) => {
    setDepartments(selected || []);

    const allSubs = selected
      ? selected.flatMap((dep) => DEPARTMENTS[dep.value])
      : [];

    setSubcategories(allSubs);
    setSelectedSubcategories([]);
  };

  /* ================= IMAGE ================= */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5)
      return alert(t("complaint.maxImages"));

    const valid = files.filter((f) => f.size < 5 * 1024 * 1024);
    if (valid.length !== files.length)
      alert(t("complaint.imageSize"));

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

  /* ================= LIVE GPS ================= */
  const getLiveLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => reject("Location permission denied")
      );
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.issue.trim()) {
    alert("⚠️ Please enter complaint title");
    return;
  }

  // ✅ NEW: Confirmation alert before submit
  const confirmSubmit = window.confirm(
    "⚠️ Please ensure your uploaded image matches your complaint.\n\nIf incorrect, your complaint may be rejected by the manager.\n\nDo you want to continue?"
  );

  if (!confirmSubmit) return;

  setSubmitting(true);
  setGeoError("");

  try {
    const fd = new FormData();

    fd.append("name", citizen.name);
    fd.append("aadhaar", citizen.aadhaar);
    fd.append("phone", citizen.phone);
    fd.append("address", citizen.address);

    fd.append("optionalAddress", formData.optionalAddress);
    fd.append("issue", formData.issue);
    fd.append("description", formData.description);

    fd.append(
      "departments",
      JSON.stringify(departments.map((d) => d.value))
    );
    fd.append("subcategories", JSON.stringify(selectedSubcategories));

    images.forEach((img) => fd.append("images", img.file));

    /* ================= GEO ================= */
    let lat = null;
    let lon = null;

    for (let img of images) {
      const result = await new Promise((resolve) => {
        EXIF.getData(img.file, function () {
          const latData = EXIF.getTag(this, "GPSLatitude");
          const lonData = EXIF.getTag(this, "GPSLongitude");

          if (latData && lonData) {
            const convert = (coord) =>
              coord[0] + coord[1] / 60 + coord[2] / 3600;

            resolve({
              lat: convert(latData),
              lon: convert(lonData),
            });
          } else resolve(null);
        });
      });

      if (result) {
        lat = result.lat;
        lon = result.lon;
        break;
      }
    }

    if (!lat || !lon) {
      try {
        const live = await getLiveLocation();
        lat = live.lat;
        lon = live.lon;
        setGeoError("📍 Using your device location");
      } catch {}
    }

    if (lat && lon) {
      fd.append("lat", lat);
      fd.append("lon", lon);
    }

    const res = await fetch(
      "http://localhost:5000/api/complaints/citizen/submit",
      {
        method: "POST",
        body: fd,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Server error:", text);
      throw new Error("Server failed");
    }

    const data = await res.json();

    // ✅ UPDATED: Handle rejection from manager/backend
    if (!data.success) {
      alert(
        `❌ Complaint Rejected\n\nReason: ${
          data.message || "Your complaint was rejected by manager"
        }`
      );
      setSubmitting(false);
      return;
    }

    // ✅ SUCCESS
    alert(
      `✅ ${t("complaint.success")}\n\n📦 Group ID: ${
        data.groupId
      }\n\n🆔 Complaint IDs:\n${data.complaintIds.join("\n")}`
    );

    window.location.href = "/track-complaints";

  } catch (err) {
    console.error("🔥 ERROR:", err);
    alert("Server error. Check console.");
  }

  setSubmitting(false);
};

  /* ================= LOADING ================= */
  if (!citizen) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: 50 }}>
        Loading...
      </div>
    );
  }
  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} style={styles.logo} alt="logo" />
          <h2 style={styles.navTitle}>{t("app.name")}</h2>
        </div>

        <button
          style={styles.backButton}
          onClick={() => (window.location.href = "/citizen-dashboard")}
        >
          ⬅ {t("common.back")}
        </button>
      </div>

      <div style={styles.formWrapper}>
        <div style={styles.card}>
          <h1 style={styles.title}>{t("complaint.title")}</h1>
          <p style={styles.subtitle}>{t("complaint.subtitle")}</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.twoColumn}>

              <div style={styles.column}>
                <Input label={t("form.name")} value={citizen.name} readOnly />
                <Input label={t("form.aadhaar")} value={`XXXX XXXX ${citizen.aadhaar.slice(-4)}`} readOnly />
                <Input label={t("form.phone")} value={citizen.phone} readOnly />
                <Input label={t("form.address")} value={citizen.address} readOnly />

                <Input
                  label={t("form.landmark")}
                  value={formData.optionalAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, optionalAddress: e.target.value })
                  }
                />
              </div>

              <div style={styles.column}>
                <label style={styles.label}>{t("form.department")}</label>
                <Select
                  isMulti
                  options={Object.keys(DEPARTMENTS).map((d) => ({
                    label: t(`departments.${d}`),
                    value: d,
                  }))}
                  value={departments}
                  onChange={handleDepartmentChange}
                  styles={reactSelectStyle}
                />

                {departments.length > 0 && (
                  <>
                    <label style={styles.label}>{t("form.subcategory")}</label>
                    <Select
                      isMulti
                      options={subcategories.map((s) => ({
                        label: t(`subcategories.${s}`),
                        value: s,
                      }))}
                      value={selectedSubcategories.map((s) => ({
                        label: t(`subcategories.${s}`),
                        value: s,
                      }))}
                      onChange={(selected) =>
                        setSelectedSubcategories(selected.map((s) => s.value))
                      }
                      styles={reactSelectStyle}
                    />
                  </>
                )}

                <Input
                  label={t("form.title")}
                  value={formData.issue}
                  onChange={(e) =>
                    setFormData({ ...formData, issue: e.target.value })
                  }
                />

                <label style={styles.label}>{t("form.description")}</label>
                <textarea
                  style={styles.textarea}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <label style={styles.label}>{t("form.upload")}</label>
                <div style={styles.uploadBox}>
                  <input type="file" multiple onChange={handleImageUpload} style={styles.fileInput} />
                  📂 {t("form.uploadText")}
                </div>

                <div style={styles.previewGrid}>
                  {images.map((img, i) => (
                    <div key={i} style={styles.previewItem}>
                      <img src={img.preview} style={styles.previewImage} />
                      <button style={styles.deleteBtn} onClick={() => deleteImage(i)}>✖</button>
                    </div>
                  ))}
                </div>

                {geoError && <p style={{ color: "yellow" }}>{geoError}</p>}
              </div>
            </div>

            <button style={styles.submitButton}>
              {submitting ? t("form.submitting") : t("form.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* INPUT */
const Input = ({ label, ...props }) => (
  <div>
    <label style={styles.label}>{label}</label>
    <input {...props} style={styles.input} />
  </div>
);

/* DROPDOWN STYLE */
const reactSelectStyle = {
  control: (base) => ({
    ...base,
    background: "rgba(255,255,255,0.15)",
    color: "#000",
  }),
  menu: (base) => ({ ...base, background: "#fff" }),
  option: (base) => ({ ...base, color: "#000" }),
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
