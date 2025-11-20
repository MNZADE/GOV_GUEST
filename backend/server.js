import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";
import mongoose from "mongoose";
import { citizens } from "./aadhaarData.js";
import complaintRoutes from "./routes/complaintRoutes.js";

dotenv.config();

const app = express();

/* --------------------------------------------------
   ⭐ FIXED CORS — DELETE NOW WORKS
-------------------------------------------------- */
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
  })
);

// Proper preflight reply
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

/* --------------------------------------------------
   BODY PARSERS
-------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------------------------------------
   CONNECT TO MONGODB
-------------------------------------------------- */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

/* --------------------------------------------------
   TWILIO SETUP
-------------------------------------------------- */
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* --------------------------------------------------
   OTP STORE
-------------------------------------------------- */
const otpStore = {};
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* --------------------------------------------------
   SEND OTP
-------------------------------------------------- */
app.post("/api/send-otp", async (req, res) => {
  const { aadhaar } = req.body;

  const citizen = citizens.find((c) => c.aadhaar === aadhaar);
  if (!citizen)
    return res.status(404).json({ success: false, message: "Aadhaar not found!" });

  const otp = generateOTP();
  otpStore[citizen.phone] = {
    otp,
    expiresAt: Date.now() + 120000,
  };

  console.log(`📩 OTP ${otp} → ${citizen.phone}`);

  try {
    await client.messages.create({
      body: `Your KMC Verification OTP is ${otp}. Valid for 2 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: citizen.phone,
    });

    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("❌ Twilio Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

/* --------------------------------------------------
   VERIFY OTP
-------------------------------------------------- */
app.post("/api/verify-otp", (req, res) => {
  const { phoneNumber, otp } = req.body;

  const record = otpStore[phoneNumber];

  if (!record)
    return res.status(400).json({ success: false, message: "No OTP found." });

  if (Date.now() > record.expiresAt) {
    delete otpStore[phoneNumber];
    return res.status(400).json({ success: false, message: "OTP expired." });
  }

  if (record.otp !== otp)
    return res.status(400).json({ success: false, message: "Invalid OTP." });

  delete otpStore[phoneNumber];
  res.json({ success: true, message: "OTP verified successfully!" });
});

/* --------------------------------------------------
   GET PHONE BY AADHAAR
-------------------------------------------------- */
app.post("/api/get-phone", (req, res) => {
  const { aadhaar } = req.body;

  const citizen = citizens.find((c) => c.aadhaar === aadhaar);

  if (!citizen)
    return res.status(404).json({ success: false, message: "Aadhaar not found" });

  res.json({ success: true, phone: citizen.phone });
});

/* --------------------------------------------------
   GET CITIZEN DETAILS
-------------------------------------------------- */
app.post("/api/get-citizen", (req, res) => {
  const { aadhaar } = req.body;

  const citizen = citizens.find((c) => c.aadhaar === aadhaar);

  if (!citizen)
    return res
      .status(404)
      .json({ success: false, message: "Citizen not found" });

  res.json({
    success: true,
    citizen: {
      name: citizen.name,
      aadhaar: citizen.aadhaar,
      address: citizen.address,
      phone: citizen.phone,
    },
  });
});

/* --------------------------------------------------
   COMPLAINT ROUTES (Multi Department)
-------------------------------------------------- */
app.use("/api/complaints", complaintRoutes);

/* --------------------------------------------------
   DEFAULT ROUTE
-------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("KMC Aadhaar OTP + Complaint System (Multi-Department) 🚀");
});

/* --------------------------------------------------
   START SERVER
-------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
