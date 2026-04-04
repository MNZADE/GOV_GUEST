import express from "express";
import dotenv from "dotenv";
import { citizens } from "../aadhaarData.js";
import twilio from "twilio";

dotenv.config();

const router = express.Router();

/* ================= TWILIO CLIENT ================= */
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ================= OTP STORE ================= */
const otpStore = new Map();

/* ================= RATE LIMIT ================= */
const otpRequestLimit = new Map();

/* ================= FORMAT PHONE ================= */
const formatPhone = (phone) => {
  phone = phone.toString().trim();

  if (phone.startsWith("+91")) return phone;
  if (phone.startsWith("0")) phone = phone.slice(1);

  return `+91${phone}`;
};

/* ================= SEND OTP (AADHAAR BASED) ================= */
router.post("/send-otp", async (req, res) => {
  try {
    const { aadhaar } = req.body;

    if (!aadhaar) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar required",
      });
    }

    /* 🔍 FIND CITIZEN */
    const citizen = citizens.find(
      (c) => c.aadhaar === aadhaar.trim()
    );

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Aadhaar not found",
      });
    }

    /* 📞 REGISTERED PHONE */
    const formattedPhone = formatPhone(citizen.phone);

    /* 🚫 RATE LIMIT */
    const lastRequest = otpRequestLimit.get(formattedPhone);
    if (lastRequest && Date.now() - lastRequest < 60000) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP",
      });
    }

    /* 🔢 GENERATE OTP */
    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore.set(formattedPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    otpRequestLimit.set(formattedPhone, Date.now());

    console.log(`📲 OTP for ${formattedPhone}:`, otp); // debug

    /* 📩 SEND WHATSAPP OTP */
    await client.messages.create({
      body: `🔐 Your OTP is: ${otp}\nValid for 5 minutes.`,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${formattedPhone}`,
    });

    return res.json({
      success: true,
      message: "OTP sent to registered mobile number",
      phone: formattedPhone.slice(-4).padStart(formattedPhone.length, "*"), // masked
    });

  } catch (err) {
    console.error("❌ OTP ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

/* ================= VERIFY OTP ================= */
const verifyOTP = (phone, otp) => {
  const data = otpStore.get(phone);

  console.log("VERIFY:", phone, data); // debug

  if (!data) return false;

  if (Date.now() > data.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  if (Number(data.otp) === Number(otp)) {
    otpStore.delete(phone);
    return true;
  }

  return false;
};

/* ================= LOGIN ================= */
router.post("/login", (req, res) => {
  try {
    const { aadhaar, otp } = req.body;

    if (!aadhaar || !otp) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar & OTP required",
      });
    }

    /* 🔍 FIND CITIZEN */
    const citizen = citizens.find(
      (c) => c.aadhaar === aadhaar.trim()
    );

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: "Aadhaar not found",
      });
    }

    /* 📞 REGISTERED PHONE */
    const formattedPhone = formatPhone(citizen.phone);

    /* 🔐 VERIFY OTP */
    const isValid = verifyOTP(formattedPhone, otp);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    /* ✅ SUCCESS */
    return res.json({
      success: true,
      message: "Login successful",
      citizen: {
        name: citizen.name,
        aadhaar: citizen.aadhaar,
        phone: citizen.phone,
        address: citizen.address,
      },
    });

  } catch (error) {
    console.error("❌ LOGIN ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;