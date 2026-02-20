import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import admin from "firebase-admin";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { citizens } from "./aadhaarData.js";
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";

dotenv.config();

const app = express();

/* --------------------------------------------------
   FIX __dirname FOR ES MODULE
-------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* --------------------------------------------------
   LOAD FIREBASE SERVICE ACCOUNT
-------------------------------------------------- */
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "firebaseServiceAccount.json"),
    "utf8"
  )
);

/* --------------------------------------------------
   CORS CONFIG
-------------------------------------------------- */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------------------------------------
   CONNECT MONGODB
-------------------------------------------------- */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* --------------------------------------------------
   INIT FIREBASE ADMIN
-------------------------------------------------- */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/* --------------------------------------------------
   FIREBASE AUTH MIDDLEWARE
-------------------------------------------------- */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* --------------------------------------------------
   PUBLIC ROUTES
-------------------------------------------------- */

// Validate Aadhaar (NO AUTH)
app.post("/api/validate-aadhaar", (req, res) => {
  const { aadhaar } = req.body;

  const citizen = citizens.find((c) => c.aadhaar === aadhaar);

  if (!citizen) {
    return res.status(404).json({
      success: false,
      message: "Aadhaar not found",
    });
  }

  res.json({
    success: true,
    name: citizen.name,
    phone: citizen.phone,
  });
});

/* --------------------------------------------------
   AUTH ROUTES (PROTECTED)
-------------------------------------------------- */
app.use("/api/auth", verifyFirebaseToken, authRoutes);

/* --------------------------------------------------
   GET CITIZEN DETAILS (PROTECTED)
-------------------------------------------------- */
app.post("/api/get-citizen", verifyFirebaseToken, (req, res) => {
  const { aadhaar } = req.body;

  const citizen = citizens.find((c) => c.aadhaar === aadhaar);

  if (!citizen) {
    return res.status(404).json({
      success: false,
      message: "Citizen not found",
    });
  }

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
   COMPLAINT ROUTES (PROTECTED)
-------------------------------------------------- */
app.use("/api/complaints", verifyFirebaseToken, complaintRoutes);

/* --------------------------------------------------
   DEFAULT ROUTE
-------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("🔥 GovGuest Aadhaar + Firebase OTP + Complaint System");
});

/* --------------------------------------------------
   START SERVER
-------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
