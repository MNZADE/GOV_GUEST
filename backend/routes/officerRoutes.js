import express from "express";
import multer from "multer";
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
   NORMALIZE DEPARTMENT
================================================== */

const normalizeDepartment =
  (dept = "") => {

    return dept
      .toLowerCase()
      .replace(/department/g, "")
      .replace(/supply/g, "")
      .replace(/\s+/g, "")
      .trim();
  };

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
        role,
        joiningDate,
        address,
      } = req.body;

      /* =====================================
         REQUIRED VALIDATION
      ===================================== */

      if (

        !department ||
        !empId ||
        !fullName ||
        !gender ||
        !dob ||
        !phone ||
        !email ||
        !role ||
        !joiningDate ||
        !address

      ) {

        return res.status(400).json({

          success: false,

          message:
            "All fields are required",
        });
      }

      /* =====================================
         NAME VALIDATION
      ===================================== */

      const nameRegex =
        /^[A-Za-z\s]+$/;

      if (
        !nameRegex.test(
          fullName
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid full name",
        });
      }

      /* =====================================
         EMAIL VALIDATION
      ===================================== */

      const gmailRegex =
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

      if (
        !gmailRegex.test(
          email
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid Gmail address",
        });
      }

      /* =====================================
         PHONE VALIDATION
      ===================================== */

      const phoneRegex =
        /^[6-9]\d{9}$/;

      if (
        !phoneRegex.test(
          phone
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid phone number",
        });
      }

      /* =====================================
         CHECK EXISTING
      ===================================== */

      const existingOfficer =
        await Officer.findOne({

          $or: [

            { empId },

            { email },

            { phone },
          ],
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

          role,

          joiningDate,

          address,

          status:
            "Active",

          currentStatus:
            "Available",

          assignedComplaintId:
            null,

          assignedComplaint:
            "",

          totalAssigned: 0,

          totalResolved: 0,
        });

      res.json({

        success: true,

        message:
          "Officer registered successfully",

        officer,
      });

    } catch (err) {

      console.error(
        "REGISTER ERROR:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          err.message ||
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
              null,

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
      } = req.body;

      console.log(
        "Complaint ID:",
        req.params.id
      );

      console.log(
        "Officer ID:",
        officerId
      );

      /* =====================================
         VALIDATE IDS
      ===================================== */

      if (
        !req.params.id ||
        !officerId
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Complaint ID or Officer ID missing",
        });
      }

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
         CHECK OFFICER BUSY
      ===================================== */

      if (
        officer.currentStatus ===
        "Busy"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Officer already assigned to another complaint",
        });
      }

      /* =====================================
         NORMALIZED DEPARTMENTS
      ===================================== */

      const complaintDepartment =

        normalizeDepartment(
          complaint.department
        );

      const officerDepartment =

        normalizeDepartment(
          officer.department
        );

      console.log(
        "Complaint Department:",
        complaint.department
      );

      console.log(
        "Officer Department:",
        officer.department
      );

      console.log(
        "Normalized Complaint:",
        complaintDepartment
      );

      console.log(
        "Normalized Officer:",
        officerDepartment
      );

      /* =====================================
         SAME DEPARTMENT VALIDATION
      ===================================== */

      if (
        complaintDepartment !==
        officerDepartment
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Only same department complaints can be assigned",

          complaintDepartment,

          officerDepartment,
        });
      }

      /* =====================================
         UPDATE COMPLAINT
      ===================================== */

      complaint.assignedOfficerId =
        officer._id;

      complaint.assignedOfficerName =
        officer.fullName;

      complaint.assignedOfficerEmail =
        officer.email;

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
          `Complaint assigned to ${officer.fullName}`,

        updatedBy:
          "Admin",

        updatedAt:
          new Date(),
      });

      await complaint.save();

      /* =====================================
         UPDATE OFFICER
      ===================================== */

      officer.assignedComplaintId =
        complaint._id;

      officer.assignedComplaint =
        complaint.complaintId;

      officer.currentStatus =
        "Busy";

      officer.totalAssigned += 1;

      await officer.save();

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

      res.json({

        success: true,

        message:
          "Complaint assigned successfully",

        complaint,
      });

    } catch (err) {

      console.log(
        "ASSIGN ERROR:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          err.message ||
          "Server Error",
      });
    }
  }
);

/* ==================================================
   OFFICER UPDATE COMPLAINT
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

      /* =====================================
         UPDATE STATUS
      ===================================== */

      complaint.status =
        req.body.status ||
        "Resolved";

      complaint.officerRemark =
        req.body.remark ||
        "";

      /* =====================================
         IMAGE
      ===================================== */

      if (req.file) {

        complaint.officerUpdatedImage =
          req.file.filename;
      }

      complaint.updatedAt =
        new Date();

      if (
        complaint.status ===
        "Resolved"
      ) {

        complaint.resolvedAt =
          new Date();
      }

      /* =====================================
         HISTORY
      ===================================== */

      if (!complaint.history) {

        complaint.history = [];
      }

      complaint.history.push({

        status:
          complaint.status,

        message:
          req.body.remark ||
          "Officer updated complaint",

        updatedBy:
          complaint.assignedOfficerName,

        updatedAt:
          new Date(),
      });

      await complaint.save();

      /* =====================================
         FREE OFFICER
      ===================================== */

      if (

        complaint.status ===
          "Resolved" ||

        complaint.status ===
          "Rejected"
      ) {

        const officer =
          await Officer.findById(

            complaint.assignedOfficerId
          );

        if (officer) {

          officer.assignedComplaintId =
            null;

          officer.assignedComplaint =
            "";

          officer.currentStatus =
            "Available";

          officer.totalResolved += 1;

          await officer.save();

          console.log(
            "Officer is now available"
          );
        }
      }

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

      res.json({

        success: true,

        message:
          "Complaint Updated Successfully",

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



















// import express from "express";
// import multer from "multer";
// import nodemailer from "nodemailer";
// import fs from "fs";

// import Complaint from "../models/Complaint.js";
// import Officer from "../models/Officer.js";

// const router = express.Router();

// /* ==================================================
//    CREATE UPLOADS FOLDER
// ================================================== */

// if (!fs.existsSync("uploads")) {

//   fs.mkdirSync("uploads");
// }

// /* ==================================================
//    EMAIL CONFIG
// ================================================== */

// const transporter =
//   nodemailer.createTransport({

//     service: "gmail",

//     auth: {

//       user:
//         process.env.EMAIL_USER,

//       pass:
//         process.env.EMAIL_PASS,
//     },
//   });

// /* ==================================================
//    MULTER STORAGE
// ================================================== */

// const storage =
//   multer.diskStorage({

//     destination:
//       (req, file, cb) => {

//         cb(
//           null,
//           "uploads/"
//         );
//       },

//     filename:
//       (req, file, cb) => {

//         cb(

//           null,

//           Date.now() +
//             "-" +
//             file.originalname
//         );
//       },
//   });

// const upload =
//   multer({
//     storage,
//   });

// /* ==================================================
//    REGISTER OFFICER
// ================================================== */

// router.post(
//   "/register",

//   async (req, res) => {

//     try {

//       const {

//         department,
//         empId,
//         fullName,
//         gender,
//         dob,
//         phone,
//         email,
//         designation,
//         role,
//         joiningDate,
//         address,
//       } = req.body;

//       /* =====================================
//          CHECK EXISTING
//       ===================================== */

//       const existingOfficer =
//         await Officer.findOne({
//           empId,
//         });

//       if (existingOfficer) {

//         return res.status(400).json({

//           success: false,

//           message:
//             "Officer already exists",
//         });
//       }

//       /* =====================================
//          CREATE OFFICER
//       ===================================== */

//       const officer =
//         await Officer.create({

//           department:
//             department
//               ?.toLowerCase()
//               ?.trim(),

//           empId,

//           fullName,

//           gender,

//           dob,

//           phone,

//           email,

//           designation,

//           role,

//           joiningDate,

//           address,

//           status:
//             "Active",
//         });

//       res.json({

//         success: true,

//         message:
//           "Officer registered successfully",

//         officer,
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",
//       });
//     }
//   }
// );

// /* ==================================================
//    GET ALL OFFICERS
// ================================================== */

// router.get(
//   "/all",

//   async (req, res) => {

//     try {

//       const officers =
//         await Officer.find()
//           .sort({

//             createdAt: -1,
//           });

//       res.json({

//         success: true,

//         officers,
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,
//       });
//     }
//   }
// );

// /* ==================================================
//    DELETE OFFICER
// ================================================== */

// router.delete(
//   "/delete/:id",

//   async (req, res) => {

//     try {

//       const officer =
//         await Officer.findById(
//           req.params.id
//         );

//       if (!officer) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Officer not found",
//         });
//       }

//       /* =====================================
//          RESET COMPLAINTS
//       ===================================== */

//       await Complaint.updateMany(

//         {
//           assignedOfficerId:
//             officer._id.toString(),
//         },

//         {
//           $set: {

//             assignedOfficerId:
//               "",

//             assignedOfficerName:
//               "",

//             assignedOfficerEmail:
//               "",

//             status:
//               "Pending",
//           },
//         }
//       );

//       /* =====================================
//          DELETE OFFICER
//       ===================================== */

//       await Officer.findByIdAndDelete(
//         req.params.id
//       );

//       res.json({

//         success: true,

//         message:
//           "Officer deleted successfully",
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",
//       });
//     }
//   }
// );

// /* ==================================================
//    ASSIGN COMPLAINT
// ================================================== */
// /* ==================================================
//    ASSIGN COMPLAINT
// ================================================== */

// router.put(
//   "/assign/:id",

//   async (req, res) => {

//     try {

//       const {
//         officerId,
//       } = req.body;

//       /* =====================================
//          FIND COMPLAINT
//       ===================================== */

//       const complaint =
//         await Complaint.findById(
//           req.params.id
//         );

//       if (!complaint) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Complaint not found",
//         });
//       }

//       /* =====================================
//          FIND OFFICER
//       ===================================== */

//       const officer =
//         await Officer.findById(
//           officerId
//         );

//       if (!officer) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Officer not found",
//         });
//       }

//       /* =====================================
//          SAME DEPARTMENT CHECK
//       ===================================== */

//       /* =====================================
//    NORMALIZE DEPARTMENT
// ===================================== */

// const complaintDepartment =

//   complaint.department
//     ?.toLowerCase()
//     ?.trim();

// const officerDepartment =

//   officer.department
//     ?.toLowerCase()
//     ?.trim();

// /* =====================================
//    MATCH LOGIC
// ===================================== */

// const isSameDepartment =

//   officerDepartment.includes(
//     complaintDepartment
//   );

// /* =====================================
//    VALIDATION
// ===================================== */

// if (!isSameDepartment) {

//   return res.status(400).json({

//     success: false,

//     message:
//       "Only same department complaints can be assigned",

//     complaintDepartment,

//     officerDepartment,
//   });
// }

//       /* =====================================
//          UPDATE COMPLAINT
//       ===================================== */

//       complaint.assignedOfficerId =
//         officer._id;

//       complaint.assignedOfficerName =
//         officer.fullName;

//       complaint.assignedOfficerEmail =
//         officer.email;

//       complaint.status =
//         "In Progress";

//       complaint.updatedAt =
//         new Date();

//       /* =====================================
//          HISTORY
//       ===================================== */

//       if (!complaint.history) {

//         complaint.history = [];
//       }

//       complaint.history.push({

//         status:
//           "Assigned",

//         message:
//           `Complaint assigned to ${officer.fullName}`,

//         updatedBy:
//           "Admin",

//         updatedAt:
//           new Date(),
//       });

//       await complaint.save();

//       /* =====================================
//          MAP LINK
//       ===================================== */

//       const mapLink =

//         `https://www.google.com/maps?q=${
//           complaint.latitude ||
//           complaint.lat ||
//           ""
//         },${
//           complaint.longitude ||
//           complaint.lon ||
//           ""
//         }`;

//       /* =====================================
//          OFFICER UPDATE LINK
//       ===================================== */

//       const updateLink =

//         `http://localhost:3000/officer-update/${complaint._id}`;

//       /* =====================================
//          COMPLAINT IMAGE
//       ===================================== */

//       const complaintImage =

//         complaint.images &&
//         complaint.images.length > 0

//           ? `
//             <img
//               src="http://localhost:5000/uploads/${complaint.images[0]}"

//               style="
//                 width:100%;
//                 max-width:450px;
//                 border-radius:16px;
//                 margin-top:15px;
//                 border:3px solid #e2e8f0;
//               "
//             />
//           `

//           : "";

//       /* =====================================
//    SEND EMAIL TO OFFICER
// ===================================== */

// /*

// =========================================================
//  REAL EMAIL SYSTEM (COMMENTED FOR DEMO PURPOSE)
// =========================================================

// if (officer.email) {

//   await transporter.sendMail({

//     from:
//       process.env.EMAIL_USER,

//     to:
//       officer.email,

//     subject:
//       `🚨 Complaint Assigned - ${complaint.complaintId}`,

//     html: `

//       <div style="
//         background:#f1f5f9;
//         padding:40px;
//         font-family:Arial,sans-serif;
//       ">

//         <div style="
//           max-width:750px;
//           margin:auto;
//           background:white;
//           border-radius:24px;
//           overflow:hidden;
//           box-shadow:0 15px 35px rgba(0,0,0,0.1);
//         ">

//           <!-- HEADER -->

//           <div style="
//             background:linear-gradient(135deg,#0284c7,#0ea5e9);
//             padding:35px;
//             color:white;
//             text-align:center;
//           ">

//             <h1 style="
//               margin:0;
//               font-size:32px;
//             ">
//               Complaint Assigned
//             </h1>

//             <p style="
//               margin-top:10px;
//               font-size:15px;
//             ">
//               Smart Complaint Management System
//             </p>

//           </div>

//           <!-- BODY -->

//           <div style="
//             padding:35px;
//           ">

//             <h2 style="
//               color:#0f172a;
//             ">
//               Hello ${officer.fullName},
//             </h2>

//             <p style="
//               color:#475569;
//               font-size:15px;
//               line-height:1.7;
//             ">

//               A new complaint has been assigned to you.
//               Please review the complaint details below
//               and update the work status after completion.

//             </p>

//             <hr style="
//               margin:25px 0;
//               border:none;
//               border-top:1px solid #e2e8f0;
//             "/>

//             <!-- DETAILS -->

//             <div style="
//               background:#f8fafc;
//               padding:25px;
//               border-radius:18px;
//             ">

//               <h3 style="
//                 margin-top:0;
//                 color:#0284c7;
//               ">
//                 Complaint Details
//               </h3>

//               <p>
//                 <b>Complaint ID:</b>
//                 ${complaint.complaintId}
//               </p>

//               <p>
//                 <b>Department:</b>
//                 ${complaint.department}
//               </p>

//               <p>
//                 <b>Issue:</b>
//                 ${complaint.issue}
//               </p>

//               <p>
//                 <b>Description:</b>
//                 ${
//                   complaint.description ||
//                   "N/A"
//                 }
//               </p>

//               <p>
//                 <b>Citizen Name:</b>
//                 ${complaint.name}
//               </p>

//               <p>
//                 <b>Citizen Phone:</b>
//                 ${complaint.phone}
//               </p>

//               <p>
//                 <b>Address:</b>
//                 ${complaint.address}
//               </p>

//               <p>
//                 <b>Status:</b>
//                 ${complaint.status}
//               </p>

//               <p>
//                 <b>Priority:</b>
//                 ${
//                   complaint.priority ||
//                   "Normal"
//                 }
//               </p>

//               ${complaintImage}

//             </div>

//             <!-- BUTTONS -->

//             <div style="
//               margin-top:30px;
//               text-align:center;
//             ">

//               <a
//                 href="${mapLink}"

//                 style="
//                   background:#16a34a;
//                   color:white;
//                   padding:15px 24px;
//                   border-radius:12px;
//                   text-decoration:none;
//                   display:inline-block;
//                   margin-right:12px;
//                   font-weight:bold;
//                   font-size:15px;
//                 "
//               >
//                 📍 Open Location
//               </a>

//               <a
//                 href="${updateLink}"

//                 style="
//                   background:#2563eb;
//                   color:white;
//                   padding:15px 24px;
//                   border-radius:12px;
//                   text-decoration:none;
//                   display:inline-block;
//                   font-weight:bold;
//                   font-size:15px;
//                 "
//               >
//                 📤 Upload Work Update
//               </a>

//             </div>

//           </div>

//           <!-- FOOTER -->

//           <div style="
//             background:#e2e8f0;
//             padding:18px;
//             text-align:center;
//             color:#475569;
//             font-size:13px;
//           ">

//             Kolhapur Municipal Corporation
//             <br/>
//             Smart Complaint Tracking System

//           </div>

//         </div>

//       </div>
//     `,
//   });

//   console.log(
//     "✅ Real Email Sent Successfully"
//   );
// }

// =========================================================
//  END REAL EMAIL SYSTEM
// =========================================================

// */

// /* =====================================
//    DEMO EMAIL NOTIFICATION
// ===================================== */

// console.log(
//   "📧 Demo Email Notification Sent"
// );

// console.log(

//   `Complaint ${complaint.complaintId}
//    assigned successfully`
// );

// console.log(

//   `Assigned Officer:
//    ${officer.fullName}`
// );

// console.log(
//   `Department:
//    ${complaint.department}`
// );

// console.log(
//   `Priority:
//    ${complaint.priority}`
// );

// console.log(
//   `Status:
//    ${complaint.status}`
// );
//       /* =====================================
//          RESPONSE
//       ===================================== */

//       res.json({

//         success: true,

//         message:
//           "Complaint assigned successfully and email sent to officer",

//         complaint,
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",
//       });
//     }
//   }
// );

// /* ==================================================
//    OFFICER UPDATE
// ================================================== */

// router.put(

//   "/update/:id",

//   upload.single("image"),

//   async (req, res) => {

//     try {

//       const complaint =
//         await Complaint.findById(
//           req.params.id
//         );

//       if (!complaint) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Complaint not found",
//         });
//       }

//       /* =====================================
//          UPDATE STATUS
//       ===================================== */

//       complaint.status =
//         req.body.status ||
//         "Resolved";

//       /* =====================================
//          OFFICER REMARK
//       ===================================== */

//       complaint.officerRemark =
//         req.body.remark ||
//         "";

//       /* =====================================
//          IMAGE
//       ===================================== */

//       if (req.file) {

//         complaint.officerUpdatedImage =
//           req.file.filename;
//       }

//       /* =====================================
//          TIME
//       ===================================== */

//       complaint.resolvedAt =
//         new Date();

//       complaint.updatedAt =
//         new Date();

//       /* =====================================
//          HISTORY
//       ===================================== */

//       if (!complaint.history) {

//         complaint.history = [];
//       }

//       complaint.history.push({

//         status:
//           complaint.status,

//         message:
//           req.body.remark ||
//           "Officer updated complaint",

//         updatedBy:
//           complaint.assignedOfficerName,

//         updatedAt:
//           new Date(),
//       });

//       await complaint.save();

//       /* =====================================
//          SOCKET UPDATE
//       ===================================== */

//       const io =
//         req.app.get("io");

//       if (io) {

//         io.emit(

//           "complaintUpdated",

//           complaint
//         );
//       }

//       /* =====================================
//          RESPONSE
//       ===================================== */

//       res.json({

//         success: true,

//         message:
//           "Complaint updated successfully",

//         complaint,
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",
//       });
//     }
//   }
// );

// /* ==================================================
//    GET SINGLE COMPLAINT
// ================================================== */

// router.get(
//   "/complaint/:id",

//   async (req, res) => {

//     try {

//       const complaint =
//         await Complaint.findById(
//           req.params.id
//         );

//       if (!complaint) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Complaint not found",
//         });
//       }

//       res.json({

//         success: true,

//         complaint,
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,
//       });
//     }
//   }
// );
// /* ==================================================
//    ASSIGN COMPLAINT
// ================================================== */

// router.put(
//   "/assign/:id",

//   async (req, res) => {

//     try {

//       const {
//         officerId,
//       } = req.body;

//       console.log(
//         "Complaint ID:",
//         req.params.id
//       );

//       console.log(
//         "Officer ID:",
//         officerId
//       );

//       /* =====================================
//          VALIDATE IDS
//       ===================================== */

//       if (
//         !req.params.id ||
//         !officerId
//       ) {

//         return res.status(400).json({

//           success: false,

//           message:
//             "Complaint ID or Officer ID missing",
//         });
//       }

//       /* =====================================
//          FIND COMPLAINT
//       ===================================== */

//       const complaint =
//         await Complaint.findById(
//           req.params.id
//         );

//       if (!complaint) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Complaint not found",
//         });
//       }

//       /* =====================================
//          FIND OFFICER
//       ===================================== */

//       const officer =
//         await Officer.findById(
//           officerId
//         );

//       if (!officer) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Officer not found",
//         });
//       }

//       /* =====================================
//          NORMALIZE DEPARTMENT
//       ===================================== */

//       const normalizeDepartment =
//         (dept = "") => {

//           return dept
//             .toLowerCase()
//             .replace(
//               " department",
//               ""
//             )
//             .replace(
//               " supply",
//               ""
//             )
//             .trim();
//         };

//       const complaintDepartment =

//         normalizeDepartment(
//           complaint.department
//         );

//       const officerDepartment =

//         normalizeDepartment(
//           officer.department
//         );

//       console.log({
//         complaintDepartment,
//         officerDepartment,
//       });

//       /* =====================================
//          SAME DEPARTMENT VALIDATION
//       ===================================== */

//       if (
//         complaintDepartment !==
//         officerDepartment
//       ) {

//         return res.status(400).json({

//           success: false,

//           message:
//             "Only same department complaints can be assigned",

//           complaintDepartment,

//           officerDepartment,
//         });
//       }

//       /* =====================================
//          UPDATE COMPLAINT
//       ===================================== */

//       complaint.assignedOfficerId =
//         officer._id;

//       complaint.assignedOfficerName =
//         officer.fullName;

//       complaint.assignedOfficerEmail =
//         officer.email;

//       complaint.status =
//         "In Progress";

//       complaint.updatedAt =
//         new Date();

//       /* =====================================
//          HISTORY
//       ===================================== */

//       if (!complaint.history) {

//         complaint.history = [];
//       }

//       complaint.history.push({

//         status:
//           "Assigned",

//         message:
//           `Complaint assigned to ${officer.fullName}`,

//         updatedBy:
//           "Admin",

//         updatedAt:
//           new Date(),
//       });

//       await complaint.save();

//       /* =====================================
//          UPDATE OFFICER
//       ===================================== */

//       officer.assignedComplaintId =
//         complaint._id;

//       officer.assignedComplaint =
//         complaint.complaintId;

//       await officer.save();

//       /* =====================================
//          SOCKET UPDATE
//       ===================================== */

//       const io =
//         req.app.get("io");

//       if (io) {

//         io.emit(
//           "complaintUpdated",
//           complaint
//         );
//       }

//       /* =====================================
//          SUCCESS RESPONSE
//       ===================================== */

//       res.json({

//         success: true,

//         message:
//           "Complaint assigned successfully",

//         complaint,
//       });

//     } catch (err) {

//       console.log(
//         "ASSIGN ERROR:",
//         err
//       );

//       res.status(500).json({

//         success: false,

//         message:
//           err.message ||
//           "Server Error",
//       });
//     }
//   }
// );
// export default router;