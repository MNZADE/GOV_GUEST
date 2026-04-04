import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

const KMC_SEAL = "data:image/png;base64,REPLACE_BASE64_HERE";
const GOVT_LOGO = process.env.PUBLIC_URL + "/logo.png";

/* Convert Image URL → Base64 */
const getBase64FromUrl = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("⚠ Image load failed:", url);
    return null;
  }
};

/* ⭐ Aadhaar Masking (XXXXXXXX1234) */
const maskAadhaar = (aadhaar) => {
  if (!aadhaar || aadhaar.length < 4) return "XXXXXXXXXXXX";
  return "XXXXXXXX" + aadhaar.slice(-4);
};

export const generateComplaintPDF = async (complaint) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/complaints/user/${complaint.aadhaar}`
    );

    const data = await res.json();

    const fullComplaint = data.complaints.find(
      (c) => c.complaintId === complaint.complaintId
    );

    if (!fullComplaint) {
      alert("❌ Could not load complaint details.");
      return;
    }

    // Timestamps
    const filedTimestamp =
      fullComplaint.dateTime ||
      `${fullComplaint.date} • ${fullComplaint.time}`;

    const now = new Date();
    const pdfTimestamp = now.toLocaleString("en-IN", {
      hour12: true,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const doc = new jsPDF("p", "mm", "a4");

    /* HEADER */
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, 210, 28, "F");

    const logoBase64 = await getBase64FromUrl(GOVT_LOGO);
    if (logoBase64) doc.addImage(logoBase64, "PNG", 10, 4, 20, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Government of Maharashtra", 105, 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("Kolhapur Municipal Corporation (KMC)", 105, 20, {
      align: "center",
    });

    doc.setTextColor(0, 0, 0);

    /* WATERMARK */
    try {
      doc.addImage(KMC_SEAL, "PNG", 45, 80, 120, 120);
    } catch {}

    doc.setFontSize(38);
    doc.setTextColor(220, 220, 220);
    doc.text("KMC SMART CITY", 18, 155, { angle: 30 });
    doc.setTextColor(0, 0, 0);

    const complaintId = fullComplaint.complaintId;

    /* TITLE */
    doc.setFontSize(18);
    doc.text("Complaint Report", 105, 40, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Complaint Number: ${complaintId}`, 105, 47, {
      align: "center",
    });

    // QR (Left & down spaced)
    const qr = await QRCode.toDataURL(
      `Complaint: ${complaintId}\nStatus: ${fullComplaint.status}`
    );
    doc.addImage(qr, "PNG", 160, 36, 28, 28);

    doc.line(15, 53, 195, 53);

    /* DETAILS TABLE */
    autoTable(doc, {
      startY: 58,
      theme: "grid",
      headStyles: { fillColor: [0, 51, 102], textColor: 255 },
      styles: { fontSize: 11, cellPadding: 3 },
      head: [["Field", "Details"]],
      body: [
        ["Complaint Number", complaintId],
        ["Citizen Name", fullComplaint.name],
        ["Aadhaar", maskAadhaar(fullComplaint.aadhaar)],
        ["Phone", fullComplaint.phone],
        [
          "Departments",
          Array.isArray(fullComplaint.departments)
            ? fullComplaint.departments.join(", ")
            : fullComplaint.department,
        ],
        [
          "Sub-Categories",
          Array.isArray(fullComplaint.subcategories)
            ? fullComplaint.subcategories.join(", ")
            : fullComplaint.subcategory,
        ],
        ["Issue", fullComplaint.issue],
        ["Status", fullComplaint.status],
        ["Filed On", filedTimestamp],
        ["Address", fullComplaint.address],
        ["Landmark", fullComplaint.optionalAddress || "—"],
      ],
      margin: { left: 15, right: 15 },
    });

    let y = doc.lastAutoTable.finalY + 12;

    /* ⭐ DESCRIPTION REMOVED COMPLETELY — NO SPACE LEFT */


    /* FOOTER */
    doc.setFontSize(10);
    doc.line(130, 275, 190, 275);
    doc.text("Officer Signature", 140, 282);

    doc.setFontSize(9);
    doc.text(`PDF Generated On: ${pdfTimestamp}`, 15, 286);
    doc.text(
      "This document is auto-generated under the KMC Smart City Mission.",
      15,
      292
    );

    doc.save(`${complaintId}.pdf`);
  } catch (err) {
    console.log("❌ PDF Error:", err);
    alert("Error generating PDF");
  }
};
