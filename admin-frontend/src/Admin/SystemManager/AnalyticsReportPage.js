import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  ShieldCheck,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  FileBarChart2,
  Building2,
  Download,
  CalendarDays,
} from "lucide-react";

/* =========================================================
   ANALYTICS REPORT PAGE
========================================================= */

const AnalyticsReportPage = () => {

  /* =========================================================
     ANALYTICS DATA
  ========================================================= */

  const analytics = {

    urgentComplaints: 1,

    pendingComplaints: 3,

    resolutionRate: 33,

    totalComplaints: 9,

    resolved: 3,

    pending: 3,

    urgent: 1,

    departments: [

      {
        name: "Water",
        total: 3,
        resolved: 1,
        pending: 0,
        urgent: 0,
        rate: "33%",
      },

      {
        name: "Sanitation",
        total: 1,
        resolved: 1,
        pending: 0,
        urgent: 0,
        rate: "100%",
      },

      {
        name: "Roads",
        total: 1,
        resolved: 0,
        pending: 1,
        urgent: 0,
        rate: "0%",
      },

      {
        name: "Streetlight",
        total: 1,
        resolved: 1,
        pending: 0,
        urgent: 0,
        rate: "100%",
      },

      {
        name: "Drainage",
        total: 1,
        resolved: 0,
        pending: 1,
        urgent: 0,
        rate: "0%",
      },

      {
        name: "Health",
        total: 1,
        resolved: 0,
        pending: 0,
        urgent: 1,
        rate: "0%",
      },

      {
        name: "Other",
        total: 1,
        resolved: 0,
        pending: 1,
        urgent: 0,
        rate: "0%",
      },
    ],
  };

  /* =========================================================
     EXPORT GOVERNMENT PDF
  ========================================================= */

  const exportGovernmentPDF = () => {

    const doc = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const width =
      doc.internal.pageSize.width;

    const height =
      doc.internal.pageSize.height;

    /* ================= HEADER ================= */

    doc.setFillColor(
      8,
      30,
      52
    );

    doc.rect(
      0,
      0,
      width,
      40,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(22);

    doc.text(
      "Government Governance Analytics Report",
      width / 2,
      16,
      {
        align: "center",
      }
    );

    doc.setFontSize(12);

    doc.text(
      "Municipal Corporation Kolhapur Division",
      width / 2,
      26,
      {
        align: "center",
      }
    );

    doc.setFontSize(10);

    doc.text(
      `Generated On: ${new Date().toLocaleString()}`,
      width / 2,
      34,
      {
        align: "center",
      }
    );

    /* ================= SECTION TITLE ================= */

    doc.setTextColor(
      15,
      23,
      42
    );

    doc.setFontSize(16);

    doc.text(
      "Collector / Commissioner Review Dashboard",
      14,
      52
    );

    /* ================= KPI BOXES ================= */

    const cards = [

      {
        title:
          "Urgent Complaints",

        value:
          analytics.urgentComplaints,

        color:
          [220, 38, 38],
      },

      {
        title:
          "Pending Complaints",

        value:
          analytics.pendingComplaints,

        color:
          [217, 119, 6],
      },

      {
        title:
          "Resolution Rate",

        value:
          `${analytics.resolutionRate}%`,

        color:
          [22, 163, 74],
      },
    ];

    let x = 14;

    cards.forEach(
      (card) => {

        doc.setFillColor(
          ...card.color
        );

        doc.roundedRect(
          x,
          60,
          58,
          28,
          3,
          3,
          "F"
        );

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.setFontSize(10);

        doc.text(
          card.title,
          x + 4,
          69
        );

        doc.setFontSize(20);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          String(
            card.value
          ),
          x + 4,
          81
        );

        x += 64;
      }
    );

    /* ================= SUMMARY TABLE ================= */

    doc.setTextColor(
      15,
      23,
      42
    );

    doc.setFontSize(15);

    doc.text(
      "Complaint Summary Analytics",
      14,
      104
    );

    autoTable(doc, {

      startY: 110,

      head: [[
        "Analytics Category",
        "Count",
      ]],

      body: [

        [
          "Total Complaints",
          analytics.totalComplaints,
        ],

        [
          "Resolved Complaints",
          analytics.resolved,
        ],

        [
          "Pending Complaints",
          analytics.pending,
        ],

        [
          "Urgent Complaints",
          analytics.urgent,
        ],
      ],

      styles: {

        fontSize: 11,

        cellPadding: 5,
      },

      headStyles: {

        fillColor: [
          8,
          30,
          52,
        ],

        textColor: 255,
      },
    });

    /* ================= DEPARTMENT TABLE ================= */

    doc.setFontSize(15);

    doc.text(
      "Department Analytics Overview",
      14,
      160
    );

    autoTable(doc, {

      startY: 166,

      head: [[

        "Department",

        "Total",

        "Resolved",

        "Pending",

        "Urgent",

        "Resolution %",
      ]],

      body:
        analytics.departments.map(
          (
            dept
          ) => [

            dept.name,

            dept.total,

            dept.resolved,

            dept.pending,

            dept.urgent,

            dept.rate,
          ]
        ),

      styles: {

        fontSize: 10,

        cellPadding: 4,
      },

      headStyles: {

        fillColor: [
          30,
          41,
          59,
        ],

        textColor: 255,
      },
    });

    /* ================= SIGNATURE SECTION ================= */

    const finalY =
      doc.lastAutoTable.finalY + 20;

    doc.setFontSize(12);

    doc.setTextColor(
      0,
      0,
      0
    );

    doc.text(
      "Head Officer Signature",
      20,
      finalY + 20
    );

    doc.line(
      20,
      finalY + 16,
      80,
      finalY + 16
    );

    doc.text(
      "Municipal Commissioner",
      20,
      finalY + 28
    );

    doc.text(
      "Collector Signature",
      130,
      finalY + 20
    );

    doc.line(
      130,
      finalY + 16,
      190,
      finalY + 16
    );

    doc.text(
      "District Collector Office",
      130,
      finalY + 28
    );

    /* ================= TIMESTAMP ================= */

    doc.setFontSize(10);

    doc.text(
      `Generated Timestamp: ${new Date().toLocaleString()}`,
      14,
      height - 28
    );

    /* ================= FOOTER ================= */

    doc.setFillColor(
      8,
      30,
      52
    );

    doc.rect(
      0,
      height - 16,
      width,
      16,
      "F"
    );

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(9);

    doc.text(
      "Government of Maharashtra • Municipal Governance Monitoring System • Confidential Government Document",
      width / 2,
      height - 6,
      {
        align: "center",
      }
    );

    doc.save(
      "Government_Analytics_Report.pdf"
    );
  };

  /* =========================================================
     UI
  ========================================================= */

  return (

    <div style={styles.page}>

      {/* ================= HEADER ================= */}

      <div style={styles.header}>

        <div style={styles.logoSection}>

          <div style={styles.logoCircle}>

            <ShieldCheck size={36} />

          </div>

          <div>

            <h1 style={styles.mainTitle}>
              Governance Analytics Dashboard
            </h1>

            <p style={styles.subTitle}>
              Municipal Corporation Kolhapur Division
            </p>

          </div>

        </div>

        <button
          style={styles.exportBtn}
          onClick={
            exportGovernmentPDF
          }
        >

          <Download size={18} />

          Export Govt PDF

        </button>

      </div>

      {/* ================= HERO ================= */}

      <div style={styles.hero}>

        <div>

          <h2 style={styles.heroTitle}>
            Collector / Commissioner Review Panel
          </h2>

          <p style={styles.heroText}>
            Real-time municipal complaint governance,
            escalation monitoring,
            department performance tracking,
            and smart city operational analytics.
          </p>

        </div>

        <div style={styles.dateBox}>

          <CalendarDays size={22} />

          <div>

            <p style={styles.dateTitle}>
              Report Generated
            </p>

            <p style={styles.dateText}>
              {new Date().toLocaleDateString()}
            </p>

          </div>

        </div>

      </div>

      {/* ================= KPI ================= */}

      <div style={styles.kpiGrid}>

        <KPI
          icon={<AlertTriangle />}
          title="Urgent Complaints"
          value={analytics.urgentComplaints}
          color="#dc2626"
        />

        <KPI
          icon={<Clock3 />}
          title="Pending Complaints"
          value={analytics.pendingComplaints}
          color="#d97706"
        />

        <KPI
          icon={<CheckCircle2 />}
          title="Resolution Rate"
          value={`${analytics.resolutionRate}%`}
          color="#16a34a"
        />

        <KPI
          icon={<FileBarChart2 />}
          title="Total Complaints"
          value={analytics.totalComplaints}
          color="#2563eb"
        />

      </div>

      {/* ================= DEPARTMENT SECTION ================= */}

      <div style={styles.section}>

        <div style={styles.sectionHeader}>

          <Building2 size={24} />

          <h2>
            Department Analytics Overview
          </h2>

        </div>

        <div style={styles.departmentGrid}>

          {analytics.departments.map(
            (
              dept,
              index
            ) => (

              <div
                key={index}
                style={styles.departmentCard}
              >

                <div style={styles.departmentTop}>

                  <h3 style={styles.departmentName}>
                    {dept.name}
                  </h3>

                  <span style={styles.rateBadge}>
                    {dept.rate}
                  </span>

                </div>

                <div style={styles.departmentStats}>

                  <p>
                    📂 Total:
                    {" "}
                    {dept.total}
                  </p>

                  <p>
                    ✅ Resolved:
                    {" "}
                    {dept.resolved}
                  </p>

                  <p>
                    ⏳ Pending:
                    {" "}
                    {dept.pending}
                  </p>

                  <p>
                    🚨 Urgent:
                    {" "}
                    {dept.urgent}
                  </p>

                </div>

                <div style={styles.progressContainer}>

                  <div
                    style={{
                      ...styles.progressBar,

                      width:
                        dept.rate,
                    }}
                  />

                </div>

              </div>
            )
          )}

        </div>

      </div>

      {/* ================= REVIEW SECTION ================= */}

      <div style={styles.reviewSection}>

        <h2 style={styles.reviewTitle}>
          Government Complaint Review Certification
        </h2>

        <p style={styles.reviewText}>

          This governance analytics report is digitally
          generated for monitoring municipal complaint
          resolution efficiency, department escalation
          performance, urgent grievance handling,
          and smart city governance compliance.

        </p>

        <div style={styles.reviewGrid}>

          <div style={styles.reviewCard}>

            <h3>
              Collector Office Remarks
            </h3>

            <div style={styles.remarkBox}>
              Complaints and department analytics reviewed.
              Pending escalations require immediate attention.
            </div>

          </div>

          <div style={styles.reviewCard}>

            <h3>
              Commissioner Office Remarks
            </h3>

            <div style={styles.remarkBox}>
              Governance complaint monitoring verified.
              Department performance evaluation completed.
            </div>

          </div>

        </div>

      </div>

      {/* ================= SIGNATURE ================= */}

      <div style={styles.signatureSection}>

        <div style={styles.signatureCard}>

          <div style={styles.signatureLine} />

          <h3>
            Head Officer Signature
          </h3>

          <p>
            Municipal Commissioner
          </p>

          <p style={styles.signatureDate}>
            Date:
            {" "}
            {new Date().toLocaleDateString()}
          </p>

        </div>

        <div style={styles.signatureCard}>

          <div style={styles.signatureLine} />

          <h3>
            Collector Signature
          </h3>

          <p>
            District Collector Office
          </p>

          <p style={styles.signatureDate}>
            Date:
            {" "}
            {new Date().toLocaleDateString()}
          </p>

        </div>

      </div>

      {/* ================= TIMESTAMP ================= */}

      <div style={styles.timestampCard}>

        <h3>
          Report Authentication Timestamp
        </h3>

        <p>
          Generated:
          {" "}
          {new Date().toLocaleString()}
        </p>

        <p>
          Server Time Zone:
          Asia/Kolkata
        </p>

        <p>
          Status:
          Digitally Verified
        </p>

      </div>

      {/* ================= FOOTER ================= */}

      <div style={styles.footer}>

        <div>

          Government of Maharashtra
          {" • "}
          Municipal Corporation Kolhapur

        </div>

        <div style={styles.footerSmall}>

          NIC Smart Governance Infrastructure
          {" • "}
          Complaint Monitoring System
          {" • "}
          Confidential Government Document

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   KPI COMPONENT
========================================================= */

const KPI = ({
  icon,
  title,
  value,
  color,
}) => (

  <div style={styles.kpiCard}>

    <div
      style={{
        ...styles.kpiIcon,

        background:
          color,
      }}
    >
      {icon}
    </div>

    <div>

      <p style={styles.kpiLabel}>
        {title}
      </p>

      <h2 style={styles.kpiValue}>
        {value}
      </h2>

    </div>

  </div>
);

/* =========================================================
   STYLES
========================================================= */

const styles = {

  page: {

    background:
      "#edf2f7",

    minHeight:
      "100vh",

    padding: 30,
  },

  header: {

    background:
      "#08203c",

    borderRadius:
      22,

    padding:
      "24px 30px",

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom:
      30,

    color:
      "#fff",
  },

  logoSection: {

    display:
      "flex",

    gap: 16,

    alignItems:
      "center",
  },

  logoCircle: {

    width: 65,

    height: 65,

    borderRadius:
      "50%",

    background:
      "rgba(255,255,255,0.15)",

    display:
      "flex",

    justifyContent:
      "center",

    alignItems:
      "center",
  },

  mainTitle: {

    fontSize: 30,

    fontWeight: 700,
  },

  subTitle: {

    marginTop: 6,

    opacity: 0.85,
  },

  exportBtn: {

    background:
      "#fff",

    color:
      "#08203c",

    border:
      "none",

    padding:
      "14px 22px",

    borderRadius:
      14,

    display:
      "flex",

    gap: 10,

    alignItems:
      "center",

    cursor:
      "pointer",

    fontWeight: 700,
  },

  hero: {

    background:
      "linear-gradient(to right,#0f172a,#1e3a5f)",

    borderRadius:
      22,

    padding:
      35,

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    color:
      "#fff",

    marginBottom:
      35,
  },

  heroTitle: {

    fontSize: 34,

    fontWeight: 700,

    marginBottom: 12,
  },

  heroText: {

    maxWidth: 760,

    lineHeight: 1.8,

    opacity: 0.92,

    fontSize: 16,
  },

  dateBox: {

    background:
      "rgba(255,255,255,0.12)",

    padding:
      "18px 22px",

    borderRadius:
      16,

    display:
      "flex",

    gap: 14,

    alignItems:
      "center",
  },

  dateTitle: {

    fontWeight: 700,
  },

  dateText: {

    opacity: 0.85,
  },

  kpiGrid: {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",

    gap: 24,

    marginBottom:
      35,
  },

  kpiCard: {

    background:
      "#fff",

    borderRadius:
      20,

    padding:
      24,

    display:
      "flex",

    gap: 18,

    alignItems:
      "center",
  },

  kpiIcon: {

    width: 60,

    height: 60,

    borderRadius:
      16,

    display:
      "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    color:
      "#fff",
  },

  kpiLabel: {

    color:
      "#64748b",
  },

  kpiValue: {

    fontSize: 32,

    fontWeight: 700,
  },

  section: {

    background:
      "#fff",

    borderRadius:
      22,

    padding:
      30,

    marginBottom:
      35,
  },

  sectionHeader: {

    display:
      "flex",

    gap: 12,

    alignItems:
      "center",

    marginBottom:
      28,
  },

  departmentGrid: {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",

    gap: 24,
  },

  departmentCard: {

    background:
      "#f8fafc",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      18,

    padding:
      24,
  },

  departmentTop: {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom:
      18,
  },

  departmentName: {

    fontSize: 22,

    fontWeight: 700,
  },

  rateBadge: {

    background:
      "#dbeafe",

    color:
      "#1d4ed8",

    padding:
      "6px 12px",

    borderRadius:
      12,

    fontWeight: 700,
  },

  departmentStats: {

    display:
      "flex",

    flexDirection:
      "column",

    gap: 10,

    color:
      "#334155",

    marginBottom:
      20,
  },

  progressContainer: {

    width:
      "100%",

    height: 12,

    background:
      "#dbeafe",

    borderRadius:
      20,

    overflow:
      "hidden",
  },

  progressBar: {

    height:
      "100%",

    background:
      "#2563eb",
  },

  reviewSection: {

    background: "#ffffff",

    marginTop: 35,

    borderRadius: 20,

    padding: 30,
  },

  reviewTitle: {

    fontSize: 28,

    fontWeight: 700,

    marginBottom: 18,
  },

  reviewText: {

    lineHeight: 1.8,

    color: "#475569",

    marginBottom: 28,
  },

  reviewGrid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(300px,1fr))",

    gap: 24,
  },

  reviewCard: {

    background: "#f8fafc",

    border:
      "1px solid #e2e8f0",

    borderRadius: 18,

    padding: 24,
  },

  remarkBox: {

    marginTop: 16,

    background: "#ffffff",

    padding: 18,

    borderRadius: 12,

    border:
      "1px dashed #94a3b8",

    lineHeight: 1.7,
  },

  signatureSection: {

    marginTop: 40,

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",

    gap: 28,
  },

  signatureCard: {

    background: "#ffffff",

    padding: 30,

    borderRadius: 18,

    textAlign: "center",
  },

  signatureLine: {

    width: "80%",

    height: 2,

    background: "#0f172a",

    margin:
      "40px auto 18px",
  },

  signatureDate: {

    marginTop: 14,

    color: "#64748b",
  },

  timestampCard: {

    marginTop: 35,

    background:
      "linear-gradient(to right,#0f172a,#1e3a5f)",

    color: "#ffffff",

    padding: 28,

    borderRadius: 20,

    lineHeight: 2,
  },

  footer: {

    marginTop: 40,

    background: "#08203c",

    color: "#ffffff",

    borderRadius: 18,

    padding: 24,

    textAlign: "center",

    fontWeight: 600,
  },

  footerSmall: {

    marginTop: 10,

    fontSize: 13,

    opacity: 0.8,
  },
};

export default AnalyticsReportPage;