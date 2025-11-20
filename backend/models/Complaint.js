import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  complaintId: { 
    type: String, 
    required: true,
    unique: true
  },

  name: { type: String, required: true },
  aadhaar: { type: String, required: true },
  phone: { type: String, required: true },

  address: { type: String, required: true },
  optionalAddress: { type: String },

  /* --------------------------------------------------
     MULTIPLE DEPARTMENTS (MAIN FIELD)
  -------------------------------------------------- */
  departments: {
    type: [String],
    required: true,
  },

  /* --------------------------------------------------
     MULTIPLE SUBCATEGORIES (MAIN FIELD)
  -------------------------------------------------- */
  subcategories: {
    type: [String],
    default: [],
  },

  /* --------------------------------------------------
     FALLBACK (old data support)
     Do NOT remove unless ALL old data is updated.
  -------------------------------------------------- */
  department: { type: String, default: "" },
  subcategory: { type: String, default: "" },

  /* --------------------------------------------------
     ISSUE INFO
  -------------------------------------------------- */
  issue: { type: String, required: true },
  description: { type: String },

  /* --------------------------------------------------
     IMAGES
  -------------------------------------------------- */
  images: {
    type: [String],
    default: [],
  },

  /* --------------------------------------------------
     STATUS
  -------------------------------------------------- */
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },

  /* --------------------------------------------------
     TIMESTAMP FIELDS
  -------------------------------------------------- */
  date: { type: String },       // DD/MM/YYYY
  time: { type: String },       // hh:mm AM/PM
  dateTime: { type: String },   // Full readable timestamp

  /* --------------------------------------------------
     AUTO TIMESTAMP
  -------------------------------------------------- */
  createdAt: { type: Date, default: Date.now },

  /* --------------------------------------------------
     SOFT DELETE SUPPORT
     Helps track deleted complaints (optional)
  -------------------------------------------------- */
  isDeleted: { type: Boolean, default: false },
});

/* --------------------------------------------------
   SORTING INDEX (Newest First)
-------------------------------------------------- */
complaintSchema.index({ createdAt: -1 });

export default mongoose.model("Complaint", complaintSchema);
