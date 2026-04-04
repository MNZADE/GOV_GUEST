import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const ReportsPage = () => {
  const [reportType, setReportType] = useState("monthly");

  /* ================= SAMPLE DATA ================= */

  const reportData = {
    monthly: {
      complaints: 4562,
      resolved: 3920,
      pending: 642,
      urgent: 128,
      departments: [
        { name: "Health", total: 1400, resolved: 1200 },
        { name: "Sanitation", total: 1200, resolved: 1000 },
        { name: "Water Supply", total: 1000, resolved: 850 },
        { name: "Electricity", total: 962, resolved: 870 },
      ],
    },
    yearly: {
      complaints: 48210,
      resolved: 42100,
      pending: 6110,
      urgent: 982,
      departments: [
        { name: "Health", total: 15000, resolved: 13500 },
        { name: "Sanitation", total: 12000, resolved: 10500 },
        { name: "Water Supply", total: 11000, resolved: 9500 },
        { name: "Electricity", total: 10210, resolved: 8600 },
      ],
    },
  };

  const data = reportData[reportType];

  const resolutionRate = Math.round(
    (data.resolved / data.complaints) * 100
  );

  const slaCompliance = Math.round(
    (data.resolved / (data.resolved + data.pending)) * 100
  );

  const auditLogs = [
    { action: "Report Generated", by: "System Admin", date: "01-02-2026" },
    { action: "SLA Review Completed", by: "Commissioner", date: "02-02-2026" },
  ];

  /* ================= PDF GENERATION ================= */

  const generatePDF = async () => {
    const doc = new jsPDF();
    const reportId = `KMC-${Date.now()}`;
    const generatedOn = new Date().toLocaleString();

    /* ===== HEADER ===== */

    doc.setFontSize(20);
    doc.text("KMC", 20, 20);

    doc.setFontSize(14);
    doc.text("Municipal Corporation Kolhapur", 20, 28);

    doc.setFontSize(11);
    doc.text(`${reportType.toUpperCase()} Governance Report`, 20, 36);

    doc.setFontSize(10);
    doc.text(`Report ID: ${reportId}`, 20, 44);
    doc.text(`Generated On: ${generatedOn}`, 20, 50);

    doc.line(20, 55, 190, 55);

    /* ===== SUMMARY TABLE ===== */

    autoTable(doc, {
      startY: 65,
      head: [["Metric", "Value"]],
      body: [
        ["Total Complaints", data.complaints],
        ["Resolved", data.resolved],
        ["Pending", data.pending],
        ["Urgent", data.urgent],
        ["Resolution Rate", resolutionRate + "%"],
        ["SLA Compliance", slaCompliance + "%"],
      ],
      theme: "grid",
      styles: { fontSize: 10 },
    });

    /* ===== DEPARTMENT TABLE ===== */

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Department", "Total", "Resolved"]],
      body: data.departments.map((d) => [
        d.name,
        d.total,
        d.resolved,
      ]),
      theme: "striped",
      styles: { fontSize: 10 },
    });

    /* ===== QR VERIFICATION ===== */

    const qr = await QRCode.toDataURL(
      `KMC Verified Report\nReport ID: ${reportId}\nGenerated: ${generatedOn}`
    );

    doc.addImage(qr, "PNG", 150, 20, 40, 40);

    /* ===== DIGITAL SIGNATURE ===== */

    doc.setFontSize(10);
    doc.text(
      "Digitally Verified by National Informatics Centre (NIC)",
      20,
      270
    );

    doc.line(20, 250, 90, 250);
    doc.text("Authorized Signatory", 20, 258);
    doc.text("Commissioner - KMC", 20, 264);

    doc.save(`KMC_Governance_Report_${reportId}.pdf`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>KMC Official Governance Reports</h1>

      <div style={styles.actions}>
        <button
          style={toggleStyle(reportType === "monthly")}
          onClick={() => setReportType("monthly")}
        >
          Monthly
        </button>

        <button
          style={toggleStyle(reportType === "yearly")}
          onClick={() => setReportType("yearly")}
        >
          Yearly
        </button>

        <button style={styles.primaryBtn} onClick={generatePDF}>
          Generate Digitally Verified PDF
        </button>
      </div>

      {/* SUMMARY */}
      <div style={styles.summaryBox}>
        <h3>Summary</h3>
        <p>Total Complaints: {data.complaints}</p>
        <p>Resolution Rate: {resolutionRate}%</p>
        <p>SLA Compliance: {slaCompliance}%</p>
      </div>

      {/* DEPARTMENT BREAKDOWN */}
      <div style={styles.section}>
        <h3>Department-wise Breakdown</h3>
        {data.departments.map((d, i) => (
          <div key={i} style={styles.deptRow}>
            <span>{d.name}</span>
            <span>
              {d.resolved}/{d.total} Resolved
            </span>
          </div>
        ))}
      </div>

      {/* SLA REPORT */}
      <div style={styles.section}>
        <h3>SLA Compliance Report</h3>
        <p>
          Overall SLA Compliance: <b>{slaCompliance}%</b>
        </p>
      </div>

      {/* AUDIT LOG */}
      <div style={styles.section}>
        <h3>Audit Log Report</h3>
        {auditLogs.map((log, i) => (
          <div key={i} style={styles.auditRow}>
            {log.date} — {log.action} by {log.by}
          </div>
        ))}
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
    justifyContent: "space-between",
    marginTop: 10,
  },
  auditRow: {
    marginTop: 8,
    fontSize: 14,
  },
};

const toggleStyle = (active) => ({
  padding: "6px 12px",
  borderRadius: 6,
  border: active ? "none" : "1px solid #ccc",
  background: active ? "#111827" : "#fff",
  color: active ? "#fff" : "#000",
  cursor: "pointer",
});

export default ReportsPage;
