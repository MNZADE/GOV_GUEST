import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import fs from "fs";

import Complaint from "../models/Complaint.js";
import Officer from "../models/Officer.js";

const router = express.Router();

/* ==================================================
   CREATE UPLOADS FOLDER
================================================== */

if (!fs.existsSync("uploads")) {

  fs.mkdirSync("uploads");
}

/* ==================================================
   EMAIL CONFIG
================================================== */

const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,
    },
  });

/* ==================================================
   MULTER STORAGE
================================================== */

const storage =
  multer.diskStorage({

    destination:
      (req, file, cb) => {

        cb(
          null,
          "uploads/"
        );
      },

    filename:
      (req, file, cb) => {

        cb(

          null,

          Date.now() +
            "-" +
            file.originalname
        );
      },
  });

const upload =
  multer({
    storage,
  });

/* ==================================================
   REGISTER OFFICER
================================================== */

router.post(
  "/register",

  async (req, res) => {

    try {

      const {

        department,
        empId,
        fullName,
        gender,
        dob,
        phone,
        email,
        designation,
        role,
        joiningDate,
        address,
      } = req.body;

      /* =====================================
         CHECK EXISTING
      ===================================== */

      const existingOfficer =
        await Officer.findOne({
          empId,
        });

      if (existingOfficer) {

        return res.status(400).json({

          success: false,

          message:
            "Officer already exists",
        });
      }

      /* =====================================
         CREATE OFFICER
      ===================================== */

      const officer =
        await Officer.create({

          department:
            department
              ?.toLowerCase()
              ?.trim(),

          empId,

          fullName,

          gender,

          dob,

          phone,

          email,

          designation,

          role,

          joiningDate,

          address,

          status:
            "Active",
        });

      res.json({

        success: true,

        message:
          "Officer registered successfully",

        officer,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* ==================================================
   GET ALL OFFICERS
================================================== */

router.get(
  "/all",

  async (req, res) => {

    try {

      const officers =
        await Officer.find()
          .sort({

            createdAt: -1,
          });

      res.json({

        success: true,

        officers,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,
      });
    }
  }
);

/* ==================================================
   DELETE OFFICER
================================================== */

router.delete(
  "/delete/:id",

  async (req, res) => {

    try {

      const officer =
        await Officer.findById(
          req.params.id
        );

      if (!officer) {

        return res.status(404).json({

          success: false,

          message:
            "Officer not found",
        });
      }

      /* =====================================
         RESET COMPLAINTS
      ===================================== */

      await Complaint.updateMany(

        {
          assignedOfficerId:
            officer._id.toString(),
        },

        {
          $set: {

            assignedOfficerId:
              "",

            assignedOfficerName:
              "",

            assignedOfficerEmail:
              "",

            status:
              "Pending",
          },
        }
      );

      /* =====================================
         DELETE OFFICER
      ===================================== */

      await Officer.findByIdAndDelete(
        req.params.id
      );

      res.json({

        success: true,

        message:
          "Officer deleted successfully",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* ==================================================
   ASSIGN COMPLAINT
================================================== */

router.put(
  "/assign/:id",

  async (req, res) => {

    try {

      const {

        officerId,
        officerName,
        officerEmail,

      } = req.body;

      /* =====================================
         FIND COMPLAINT
      ===================================== */

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {

        return res.status(404).json({

          success: false,

          message:
            "Complaint not found",
        });
      }

      /* =====================================
         FIND OFFICER
      ===================================== */

      const officer =
        await Officer.findById(
          officerId
        );

      if (!officer) {

        return res.status(404).json({

          success: false,

          message:
            "Officer not found",
        });
      }

      /* =====================================
         SAME DEPARTMENT CHECK
      ===================================== */

      const complaintDepartment =
        complaint.department
          ?.toLowerCase()
          ?.trim();

      const officerDepartment =
        officer.department
          ?.toLowerCase()
          ?.trim();

      if (

        complaintDepartment !==
        officerDepartment

      ) {

        return res.status(400).json({

          success: false,

          message:
            "Only same department complaints can be assigned",
        });
      }

      /* =====================================
         UPDATE COMPLAINT
      ===================================== */

      complaint.assignedOfficerId =
        officerId;

      complaint.assignedOfficerName =
        officerName;

      complaint.assignedOfficerEmail =
        officerEmail;

      complaint.status =
        "In Progress";

      complaint.updatedAt =
        new Date();

      /* =====================================
         HISTORY
      ===================================== */

      if (!complaint.history) {

        complaint.history = [];
      }

      complaint.history.push({

        status:
          "Assigned",

        message:
          `Assigned to ${officerName}`,

        updatedAt:
          new Date(),
      });

      await complaint.save();

      /* =====================================
         MAP LINK
      ===================================== */

      const mapLink =
        `https://www.google.com/maps?q=${
          complaint.latitude ||
          complaint.lat
        },${
          complaint.longitude ||
          complaint.lon
        }`;

      /* =====================================
         UPDATE LINK
      ===================================== */

      const updateLink =
        `http://localhost:3000/officer-update/${complaint._id}`;

      /* =====================================
         EMAIL
      ===================================== */

      if (officerEmail) {

        await transporter.sendMail({

          from:
            process.env.EMAIL_USER,

          to:
            officerEmail,

          subject:
            `Complaint Assigned - ${complaint.complaintId}`,

          html: `

            <div style="font-family:Arial;padding:20px;">

              <h2 style="color:#0284c7;">
                Complaint Assigned
              </h2>

              <p>
                <b>Complaint ID:</b>
                ${complaint.complaintId}
              </p>

              <p>
                <b>Issue:</b>
                ${complaint.issue}
              </p>

              <p>
                <b>Address:</b>
                ${complaint.address}
              </p>

              <p>
                <b>Status:</b>
                ${complaint.status}
              </p>

              <br/>

              <a
                href="${mapLink}"

                style="
                  background:#16a34a;
                  color:white;
                  padding:12px 20px;
                  border-radius:8px;
                  text-decoration:none;
                  display:inline-block;
                  margin-right:10px;
                "
              >
                Open Location
              </a>

              <a
                href="${updateLink}"

                style="
                  background:#2563eb;
                  color:white;
                  padding:12px 20px;
                  border-radius:8px;
                  text-decoration:none;
                  display:inline-block;
                "
              >
                Upload Work Update
              </a>

            </div>
          `,
        });
      }

      /* =====================================
         SOCKET
      ===================================== */

      const io =
        req.app.get("io");

      if (io) {

        io.emit(

          "complaintUpdated",

          complaint
        );
      }

      res.json({

        success: true,

        message:
          "Complaint assigned successfully",

        complaint,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* ==================================================
   OFFICER UPDATE
================================================== */

router.put(

  "/update/:id",

  upload.single("image"),

  async (req, res) => {

    try {

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {

        return res.status(404).json({

          success: false,

          message:
            "Complaint not found",
        });
      }

      complaint.status =
        req.body.status ||
        "Resolved";

      complaint.officerRemark =
        req.body.remark ||
        "";

      if (req.file) {

        complaint.officerUpdatedImage =
          req.file.filename;
      }

      complaint.resolvedAt =
        new Date();

      complaint.updatedAt =
        new Date();

      if (!complaint.history) {

        complaint.history = [];
      }

      complaint.history.push({

        status:
          complaint.status,

        message:
          req.body.remark ||
          "Officer updated complaint",

        updatedAt:
          new Date(),
      });

      await complaint.save();

      /* =====================================
         SOCKET
      ===================================== */

      const io =
        req.app.get("io");

      if (io) {

        io.emit(

          "complaintUpdated",

          complaint
        );
      }

      res.json({

        success: true,

        message:
          "Complaint updated successfully",

        complaint,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* ==================================================
   GET SINGLE COMPLAINT
================================================== */

router.get(
  "/complaint/:id",

  async (req, res) => {

    try {

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {

        return res.status(404).json({

          success: false,

          message:
            "Complaint not found",
        });
      }

      res.json({

        success: true,

        complaint,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,
      });
    }
  }
);

export default router;