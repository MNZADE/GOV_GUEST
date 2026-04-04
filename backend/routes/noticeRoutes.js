import express from "express";
import Notice from "../models/Notice.js";

const router = express.Router();

/* ================= ADMIN CREATE NOTICE ================= */
router.post("/create", async (req, res) => {
  try {
    const { title, message, type } = req.body;

    const notice = await Notice.create({
      title,
      message,
      type,
    });

    res.json({ success: true, notice });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* ================= GET ALL NOTICES ================= */
router.get("/all", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });

    res.json({ success: true, notices });

  } catch {
    res.status(500).json({ success: false });
  }
});

export default router;