import express from "express";
import multer from "multer";
import twilio from "twilio";
import path from "path";
import fs from "fs";

import Complaint from "../models/Complaint.js";
import Notification from "../models/Notification.js";
import createNotification from "../utils/createNotification.js";
import auth from "../middleware/adminAuth.js";

const router = express.Router();

console.log("✅ Complaint routes loaded");

/* =========================================================
   📁 CREATE UPLOADS FOLDER
========================================================= */

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* =========================================================
   📸 MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

/* =========================================================
   📸 FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {

  const allowedTypes =
    /jpeg|jpg|png|webp/;

  const extname =
    allowedTypes.test(
      path.extname(
        file.originalname
      ).toLowerCase()
    );

  const mimetype =
    allowedTypes.test(
      file.mimetype
    );

  if (extname && mimetype) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only image files are allowed"
      )
    );
  }
};

/* =========================================================
   📸 MULTER UPLOAD
========================================================= */

const upload = multer({

  storage,
  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});

/* =========================================================
   📲 TWILIO
========================================================= */

const client = twilio(

  process.env.TWILIO_SID,

  process.env.TWILIO_AUTH_TOKEN
);

/* =========================================================
   🏢 DEPARTMENT PREFIX
========================================================= */

const DEPT_PREFIX = {

  sanitation: "SAN",

  water: "WAT",

  roads: "ROD",

  streetlight: "STL",

  drainage: "DRN",

  health: "HLT",

  other: "OTH",
};

/* =========================================================
   📦 GENERATE GROUP ID
========================================================= */

const generateGroupId = () => {

  return `GRP-${Date.now()}`;
};

/* =========================================================
   🔄 NORMALIZE DEPARTMENT
========================================================= */

const normalizeDepartment =
  (department = "") => {

    return department

      .toLowerCase()

      .replace(
        "electricity department",
        "streetlight"
      )

      .replace(
        "electric department",
        "streetlight"
      )

      .replace(
        "electricity",
        "streetlight"
      )

      .replace(
        "street light department",
        "streetlight"
      )

      .replace(
        "street light",
        "streetlight"
      )

      .replace(
        "street-light",
        "streetlight"
      )

      .replace(
        "water department",
        "water"
      )

      .replace(
        "water supply department",
        "water"
      )

      .replace(
        " department",
        ""
      )

      .trim();
  };

/* =========================================================
   🆔 GENERATE COMPLAINT ID
========================================================= */

const generateComplaintId =
  async (department) => {

    const prefix =
      DEPT_PREFIX[
        department.toLowerCase()
      ] || "GEN";

    const now =
      new Date();

    const dateStr =
      now.getFullYear() +
      String(
        now.getMonth() + 1
      ).padStart(2, "0") +
      String(
        now.getDate()
      ).padStart(2, "0");

    const start =
      new Date();

    start.setHours(
      0,
      0,
      0,
      0
    );

    const end =
      new Date();

    end.setHours(
      23,
      59,
      59,
      999
    );

    const count =
      await Complaint.countDocuments({

        department: {
          $regex:
            `^${department}$`,
          $options: "i",
        },

        createdAt: {
          $gte: start,
          $lte: end,
        },
      });

    const serial =
      String(count + 1)
        .padStart(3, "0");

    return `${prefix}-${dateStr}-${serial}`;
  };

/* =========================================================
   📅 FORMAT DATE
========================================================= */

function formatDateTime() {

  const now =
    new Date();

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const year =
    now.getFullYear();

  let hours =
    now.getHours();

  const minutes =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  const ampm =
    hours >= 12
      ? "PM"
      : "AM";

  hours =
    hours % 12 || 12;

  return {

    date:
      `${day}/${month}/${year}`,

    time:
      `${hours}:${minutes} ${ampm}`,

    dateTime:
      `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`,
  };
}

/* =========================================================
   🔍 TRACK COMPLAINT
========================================================= */

router.get(
  "/track/:complaintId",

  async (req, res) => {

    try {

      const complaint =
        await Complaint.findOne({

          complaintId:
            req.params.complaintId,
        });

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

      res.status(500).json({

        success: false,
      });
    }
  }
);

/* =========================================================
   👤 SUBMIT COMPLAINT
========================================================= */

router.post(

  "/citizen/submit",

  upload.array("images", 5),

  async (req, res) => {

    try {

      const {

        name,
        aadhaar,
        phone,
        address,
        optionalAddress,
        issue,
        description,
        departments,
        subcategories,
        lat,
        lon,

      } = req.body;

      const imageFiles =
        req.files?.map(
          (file) =>
            file.filename
        ) || [];

      const {
        date,
        time,
        dateTime,
      } = formatDateTime();

      let departmentList =
        JSON.parse(
          departments || "[]"
        );

      let subcategoryList =
        JSON.parse(
          subcategories || "[]"
        );

      const groupId =
        generateGroupId();

      let createdComplaints =
        [];

      for (let dept of departmentList) {

        const normalizedDept =
          normalizeDepartment(
            dept
          );

        const complaintId =
          await generateComplaintId(
            normalizedDept
          );

        const complaint =
          await Complaint.create({

            complaintId,

            groupId,

            department:
              normalizedDept,

            name,

            aadhaar:
              String(aadhaar),

            phone,

            address,

            optionalAddress,

            subcategories:
              subcategoryList,

            issue:
              issue ||
              "No Title",

            description,

            images:
              imageFiles,

            lat:
              lat || null,

            lon:
              lon || null,

            status:
              "Pending",

            priority:
              "Medium",

            date,

            time,

            dateTime,

            createdAt:
              new Date(),
          });

        createdComplaints.push(
          complaint
        );

        const io =
          req.app.get("io");

        if (io) {

          io.to(
            normalizedDept
          ).emit(
            "newComplaint",
            complaint
          );
        }
      }

      const io =
        req.app.get("io");

      if (io) {

        io.emit(
          "newComplaintGlobal",
          createdComplaints
        );
      }

      try {

        await createNotification(
          io,
          {

            title:
              "New Complaint Registered",

            message:
              `${issue} - ${groupId}`,

            recipientRole:
              "system_manager",
          }
        );

      } catch (err) {

        console.error(
          "Notification Error:",
          err
        );
      }

      /* SMS */

      try {

        const cleanPhone =
          phone
            .replace("+91", "")
            .replace(/\D/g, "");

        if (
          cleanPhone.length === 10
        ) {

          const messageBody =
            `Complaint Submitted

Group ID: ${groupId}

Complaint IDs:
${createdComplaints
  .map(
    c => c.complaintId
  )
  .join("\n")}`;

          await client.messages.create({

            body:
              messageBody,

            from:
              process.env.TWILIO_PHONE_NUMBER,

            to:
              `+91${cleanPhone}`,
          });
        }

      } catch (err) {

        console.log(
          "Twilio Error:",
          err.message
        );
      }

      res.json({

        success: true,

        groupId,

        complaintIds:
          createdComplaints.map(
            c => c.complaintId
          ),
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

/* =========================================================
   👤 USER COMPLAINTS
========================================================= */

router.get(
  "/user/:aadhaar",

  async (req, res) => {

    try {

      const complaints =
        await Complaint.find({

          aadhaar:
            String(
              req.params.aadhaar
            ),
        }).sort({
          createdAt: -1,
        });

      res.json({

        success: true,

        complaints,
      });

    } catch (err) {

      res.status(500).json({

        success: false,
      });
    }
  }
);

/* =========================================================
   👨‍💼 MANAGER DASHBOARD
========================================================= */
/* =========================================================
   👨‍💼 SANITATION DASHBOARD ROUTE
========================================================= */

router.get(
  "/manager/sanitation",

  auth,

  async (req, res) => {

    try {

      console.log(
        "✅ Sanitation Dashboard Route Hit"
      );

      /* =====================================
         CHECK ACCESS
      ===================================== */

      if (

        req.user.role !==
          "department_manager" &&

        req.user.role !==
          "system_manager"

      ) {

        return res.status(403).json({

          success: false,

          message:
            "Unauthorized Access",
        });
      }

      /* =====================================
         FETCH SANITATION COMPLAINTS
      ===================================== */

      const complaints =
        await Complaint.find({

          department: {

            $in: [

              "sanitation",

              "Sanitation",

              "sanitation department",

              "Sanitation Department",
            ],
          },
        })

          .sort({
            createdAt: -1,
          });

      console.log(
        "Complaints Found:",
        complaints.length
      );

      /* =====================================
         RESPONSE
      ===================================== */

      return res.json({

        success: true,

        total:
          complaints.length,

        complaints,
      });

    } catch (err) {

      console.error(
        "Sanitation Dashboard Error:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* =========================================================
   🔄 UPDATE SANITATION COMPLAINT
========================================================= */

router.put(

  "/manager/update/:id",

  auth,

  async (req, res) => {

    try {

      console.log(
        "Updating Complaint:",
        req.params.id
      );

      const {
        status,
        priority,
        adminMessage,
      } = req.body;

      /* =====================================
         FIND COMPLAINT
      ===================================== */

      const complaint =
        await Complaint.findOne({

          complaintId:
            req.params.id,
        });

      if (!complaint) {

        return res.status(404).json({

          success: false,

          message:
            "Complaint not found",
        });
      }

      /* =====================================
         UPDATE DATA
      ===================================== */

      complaint.status =
        status ||
        complaint.status;

      complaint.priority =
        priority ||
        complaint.priority;

      complaint.adminMessage =
        adminMessage ||
        complaint.adminMessage;

      complaint.updatedAt =
        new Date();

      /* =====================================
         SAVE
      ===================================== */

      await complaint.save();

      /* =====================================
         SOCKET UPDATE
      ===================================== */

      const io =
        req.app.get("io");

      if (io) {

        io.emit(
          "complaintUpdated",
          complaint
        );
      }

      console.log(
        "✅ Complaint Updated"
      );

      /* =====================================
         RESPONSE
      ===================================== */

      return res.json({

        success: true,

        message:
          "Complaint updated successfully",

        complaint,
      });

    } catch (err) {

      console.error(
        "Update Error:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* =========================================================
   ❌ DELETE SANITATION COMPLAINT
========================================================= */

router.delete(

  "/user/:aadhaar/:complaintId",

  async (req, res) => {

    try {

      console.log(
        "Deleting Complaint:",
        req.params.complaintId
      );

      /* =====================================
         DELETE COMPLAINT
      ===================================== */

      const removed =
        await Complaint.findOneAndDelete({

          complaintId:
            req.params.complaintId,

          aadhaar:
            String(
              req.params.aadhaar
            ),
        });

      if (!removed) {

        return res.status(404).json({

          success: false,

          message:
            "Complaint not found",
        });
      }

      console.log(
        "✅ Complaint Deleted"
      );

      /* =====================================
         RESPONSE
      ===================================== */

      return res.json({

        success: true,

        message:
          "Complaint deleted successfully",
      });

    } catch (err) {

      console.error(
        "Delete Error:",
        err
      );

      return res.status(500).json({

        success: false,

        message:
          "Delete Failed",
      });
    }
  }
);

/* =========================================================
   📌 EXPORT ROUTER
========================================================= */

export default router;