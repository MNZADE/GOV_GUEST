import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

// ⭐ Replace with actual Base64 Seal (optional)
const KMC_SEAL = "data:image/png;base64,REPLACE_BASE64_HERE";

// ⭐ Logo from public folder
const GOVT_LOGO = process.env.PUBLIC_URL + "/logo.png";

/* URL → Base64 */
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
    console.warn("Image load failed:", url);
    return null;
  }
};

/* ================================================================
   MAIN FUNCTION — Fetch full data from backend then generate PDF
================================================================ */
export const generateComplaintPDF = async (complaint) => {
  try {
    // ⭐ FETCH FULL COMPLAINT DATA FROM BACKEND
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

    /* -------------------------------
       PDF START — SAME UI AS YOUR CODE
       -------------------------------- */
    const doc = new jsPDF("p", "mm", "a4");

    // =====================================================
    // HEADER BAR
    // =====================================================
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, 210, 30, "F");

    // Government Logo
    const logoBase64 = await getBase64FromUrl(GOVT_LOGO);
    if (logoBase64) doc.addImage(logoBase64, "PNG", 12, 4, 22, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(17);
    doc.text("Government of Maharashtra", 105, 12, { align: "center" });

    doc.setFontSize(13);
    doc.text("Kolhapur Municipal Corporation (KMC)", 105, 22, {
      align: "center",
    });

    doc.setTextColor(0, 0, 0);

    // =====================================================
    // WATERMARK
    // =====================================================
    try {
      doc.addImage(KMC_SEAL, "PNG", 45, 65, 120, 120);
    } catch {}

    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.text("KMC SMART CITY", 20, 150, { angle: 30 });
    doc.setTextColor(0, 0, 0);

    const complaintId = fullComplaint.complaintId;

    // =====================================================
    // COMPLAINT HEADING
    // =====================================================
    doc.setFontSize(18);
    doc.text("Complaint Report", 105, 42, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Complaint Number: ${complaintId}`, 105, 49, {
      align: "center",
    });

    // QR CODE
    const qr = await QRCode.toDataURL(
      `Complaint: ${complaintId}\nStatus: ${fullComplaint.status}`
    );
    doc.addImage(qr, "PNG", 170, 34, 28, 28);

    // Divider
    doc.setDrawColor(0, 51, 102);
    doc.line(15, 55, 195, 55);

    // =====================================================
    // DETAILS TABLE
    // =====================================================
    autoTable(doc, {
      startY: 60,
      theme: "grid",
      head: [["Field", "Details"]],
      body: [
        ["Complaint Number", complaintId],
        ["Citizen Name", fullComplaint.name],
        ["Aadhaar", fullComplaint.aadhaar],
        ["Phone", fullComplaint.phone],
        ["Issue", fullComplaint.issue],
        ["Department", fullComplaint.category],
        ["Status", fullComplaint.status],
        ["Filed On", fullComplaint.date],
        ["Address", fullComplaint.address],
        ["Landmark", fullComplaint.optionalAddress || "—"],
      ],

      headStyles: { fillColor: [0, 51, 102], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      bodyStyles: { fontSize: 11 },
      margin: { left: 15, right: 15 },
    });

    let y = doc.lastAutoTable.finalY + 10;

    // =====================================================
    // DESCRIPTION
    // =====================================================
    doc.setFontSize(14);
    doc.text("Issue Description", 15, y);

    doc.setFontSize(11);
    doc.text(fullComplaint.description || "No description provided.", 15, y + 6, {
      maxWidth: 180,
    });

    y += 25;

    // =====================================================
    // IMAGES
    // =====================================================
    if (fullComplaint.images?.length > 0) {
      doc.setFontSize(14);
      doc.text("Uploaded Images", 15, y);

      y += 6;

      for (const url of fullComplaint.images) {
        const img = await getBase64FromUrl(url);

        if (img) doc.addImage(img, "JPEG", 15, y, 90, 65);

        y += 75;
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      }
    }

    // =====================================================
    // TIMELINE
    // =====================================================
    const steps = ["Submitted", "Verified", "Assigned", "In Progress", "Resolved"];
    const currentIndex = steps.indexOf(fullComplaint.status);

    doc.setFontSize(14);
    doc.text("Complaint Timeline", 15, y);
    y += 10;

    steps.forEach((step, index) => {
      doc.setFillColor(index <= currentIndex ? 0 : 150, 150, 0);
      doc.circle(20, y, 3, "F");
      doc.text(`${index + 1}. ${step}`, 30, y + 2);
      y += 10;
    });

    y += 10;

    // =====================================================
    // OFFICER REMARKS
    // =====================================================
    doc.setFontSize(14);
    doc.text("Officer Remarks", 15, y);
    doc.setFontSize(11);
    doc.text(fullComplaint.officerNotes || "No remarks yet.", 15, y + 6, {
      maxWidth: 180,
    });

    // =====================================================
    // SIGNATURE + FOOTER
    // =====================================================
    doc.line(130, 260, 190, 260);
    doc.text("Officer Signature", 140, 265);

    doc.setFontSize(9);
    doc.text("Auto-generated under the KMC Smart City Mission.", 15, 290);

    doc.save(`${complaintId}.pdf`);

  } catch (err) {
    console.log("PDF Error:", err);
    alert("Error generating PDF");
  }
};
