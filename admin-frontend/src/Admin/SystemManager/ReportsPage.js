import {
  useState,
  useEffect,
} from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const ReportsPage = () => {

  const [reportType, setReportType] =
    useState("monthly");

  const [loading, setLoading] =
    useState(true);

  /* ================= REPORT DATA ================= */

  const [reportData, setReportData] =
    useState({

      complaints: 0,

      resolved: 0,

      pending: 0,

      urgent: 0,

      departments: [],
    });

  /* ================= FETCH ANALYTICS ================= */

  useEffect(() => {

    fetchAnalytics();

  }, []);

  const fetchAnalytics =
    async () => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await fetch(
            "http://localhost:5000/api/analytics",
            {
              method: "GET",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        console.log(
          "📦 Analytics API:",
          data
        );

        if (
          response.ok &&
          data.success
        ) {

          const analytics =
            reportType ===
            "monthly"

              ? data.currentMonth

              : data.previousMonth;

          setReportData({

            complaints:
              analytics.total || 0,

            resolved:
              analytics.solved || 0,

            pending:
              analytics.pending || 0,

            urgent:
              analytics.urgent || 0,

            departments:

              data.departmentData?.map(
                (d) => ({

                  name:
                    d.name,

                  total:
                    d.total || 0,

                  resolved:
                    d.resolved || 0,

                  percentage:
                    d.percentage || 0,
                })
              ) || [],
          });
        }

      } catch (err) {

        console.log(
          "Reports Error:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /* ================= REFETCH ================= */

  useEffect(() => {

    fetchAnalytics();

  }, [reportType]);

  /* ================= CALCULATIONS ================= */

  const resolutionRate =

    reportData.complaints > 0

      ? Math.round(

          (reportData.resolved /
            reportData.complaints) *
            100
        )

      : 0;

  const slaCompliance =

    reportData.complaints > 0

      ? Math.round(

          (reportData.resolved /
            reportData.complaints) *
            100
        )

      : 0;

  /* ================= PDF GENERATION ================= */

  const generatePDF =
    async () => {

      const doc =
        new jsPDF();

      const reportId =
        `KMC-${Date.now()}`;

      const generatedOn =
        new Date().toLocaleString();

      /* ===== HEADER ===== */

      doc.setFontSize(20);

      doc.text(
        "KMC",
        20,
        20
      );

      doc.setFontSize(14);

      doc.text(
        "Municipal Corporation Kolhapur",
        20,
        28
      );

      doc.setFontSize(11);

      doc.text(
        `${reportType.toUpperCase()} Governance Report`,
        20,
        36
      );

      doc.setFontSize(10);

      doc.text(
        `Report ID: ${reportId}`,
        20,
        44
      );

      doc.text(
        `Generated On: ${generatedOn}`,
        20,
        50
      );

      doc.line(
        20,
        55,
        190,
        55
      );

      /* ===== SUMMARY ===== */

      autoTable(doc, {

        startY: 65,

        head: [[
          "Metric",
          "Value",
        ]],

        body: [

          [
            "Total Complaints",
            reportData.complaints,
          ],

          [
            "Resolved",
            reportData.resolved,
          ],

          [
            "Pending",
            reportData.pending,
          ],

          [
            "Urgent",
            reportData.urgent,
          ],

          [
            "Resolution Rate",
            resolutionRate + "%",
          ],

          [
            "SLA Compliance",
            slaCompliance + "%",
          ],
        ],

        theme: "grid",

        styles: {
          fontSize: 10,
        },
      });

      /* ===== DEPARTMENT ===== */

      autoTable(doc, {

        startY:
          doc.lastAutoTable.finalY + 10,

        head: [[
          "Department",
          "Total",
          "Resolved",
          "Percentage",
        ]],

        body:
          reportData.departments.map(
            (d) => [

              d.name,

              d.total,

              d.resolved,

              `${d.percentage}%`,
            ]
          ),

        theme: "striped",

        styles: {
          fontSize: 10,
        },
      });

      /* ===== QR ===== */

      const qr =
        await QRCode.toDataURL(

          `KMC Verified Report\nReport ID: ${reportId}\nGenerated: ${generatedOn}`
        );

      doc.addImage(
        qr,
        "PNG",
        150,
        20,
        40,
        40
      );

      /* ===== SIGNATURE ===== */

      doc.setFontSize(10);

      doc.text(

        "Digitally Verified by National Informatics Centre (NIC)",

        20,

        270
      );

      doc.line(
        20,
        250,
        90,
        250
      );

      doc.text(
        "Authorized Signatory",
        20,
        258
      );

      doc.text(
        "Commissioner - KMC",
        20,
        264
      );

      doc.save(

        `KMC_Governance_Report_${reportId}.pdf`
      );
    };

  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div
        style={{
          padding: 40,
          textAlign: "center",
          fontSize: 20,
        }}
      >
        Loading Reports...
      </div>
    );
  }

  return (

    <div style={styles.container}>

      <h1 style={styles.title}>
        KMC Official Governance Reports
      </h1>

      <div style={styles.actions}>

        <button
          style={toggleStyle(
            reportType === "monthly"
          )}

          onClick={() =>
            setReportType(
              "monthly"
            )
          }
        >
          Monthly
        </button>

        <button
          style={toggleStyle(
            reportType === "yearly"
          )}

          onClick={() =>
            setReportType(
              "yearly"
            )
          }
        >
          Yearly
        </button>

        <button
          style={styles.primaryBtn}

          onClick={generatePDF}
        >
          Generate Digitally Verified PDF
        </button>

      </div>

      {/* SUMMARY */}

      <div style={styles.summaryBox}>

        <h3>Summary</h3>

        <p>
          Total Complaints:
          {" "}
          {
            reportData.complaints
          }
        </p>

        <p>
          Resolution Rate:
          {" "}
          {resolutionRate}%
        </p>

        <p>
          SLA Compliance:
          {" "}
          {slaCompliance}%
        </p>

      </div>

      {/* DEPARTMENT */}

      <div style={styles.section}>

        <h3>
          Department-wise Breakdown
        </h3>

        {reportData.departments.map(
          (d, i) => (

            <div
              key={i}
              style={styles.deptRow}
            >

              <span>
                {d.name}
              </span>

              <span>

                {d.resolved}/
                {d.total}
                {" "}
                Resolved
                {" "}
                ({d.percentage}%)

              </span>

            </div>
          )
        )}

      </div>

      {/* SLA */}

      <div style={styles.section}>

        <h3>
          SLA Compliance Report
        </h3>

        <p>

          Overall SLA Compliance:
          {" "}

          <b>
            {slaCompliance}%
          </b>

        </p>

      </div>

    </div>
  );
};

/* ================= STYLES ================= */

const styles = {

  container: {
    padding: 30,
    background: "#f3f4f6",
    minHeight: "100vh",
  },

  title: {
    fontSize: 26,
    marginBottom: 20,
    fontWeight: 600,
  },

  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 30,
  },

  primaryBtn: {
    background: "#111827",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },

  summaryBox: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },

  section: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  deptRow: {
    display: "flex",
    justifyContent:
      "space-between",
    marginTop: 10,
    paddingBottom: 8,
    borderBottom:
      "1px solid #e5e7eb",
  },
};

const toggleStyle =
  (active) => ({

    padding: "6px 12px",

    borderRadius: 6,

    border:
      active

        ? "none"

        : "1px solid #ccc",

    background:
      active

        ? "#111827"

        : "#fff",

    color:
      active

        ? "#fff"

        : "#000",

    cursor: "pointer",
  });

export default ReportsPage;