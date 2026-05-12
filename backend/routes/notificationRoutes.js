const express = require("express");

const Notification =
  require("../models/Notification");

const auth =
  require("../middleware/authMiddleware");

const router =
  express.Router();

/* ==================================================
   GET MY NOTIFICATIONS
================================================== */

router.get(

  "/",

  auth,

  async (req, res) => {

    try {

      const user =
        req.user;

      let query = {};

      /* =====================================
         SYSTEM MANAGER
      ===================================== */

      if (

        user.role ===
        "System Manager"

      ) {

        query = {};

      }

      /* =====================================
         DEPARTMENT MANAGER
      ===================================== */

      else if (

        user.role ===
        "Department Manager"

      ) {

        query = {

          $or: [

            {
              department:
                user.department,
            },

            {
              recipientId:
                user._id,
            },

            {
              isSystemManager:
                false,
            },
          ],
        };
      }

      /* =====================================
         OFFICER / EMPLOYEE
      ===================================== */

      else {

        query = {

          recipientId:
            user._id,
        };
      }

      /* =====================================
         FETCH NOTIFICATIONS
      ===================================== */

      const notifications =

        await Notification.find(
          query
        )

          .populate(
            "complaintId"
          )

          .sort({
            createdAt: -1,
          })

          .limit(50);

      /* =====================================
         UNREAD COUNT
      ===================================== */

      const unreadCount =

        notifications.filter(

          (n) =>
            !n.isRead
        ).length;

      /* =====================================
         RESPONSE
      ===================================== */

      res.json({

        success: true,

        count:
          notifications.length,

        unreadCount,

        notifications,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          err.message,
      });
    }
  }
);

/* ==================================================
   MARK SINGLE NOTIFICATION AS READ
================================================== */

router.put(

  "/:id/read",

  auth,

  async (req, res) => {

    try {

      const notification =

        await Notification.findByIdAndUpdate(

          req.params.id,

          {
            isRead: true,
          },

          {
            new: true,
          }
        );

      /* =====================================
         NOT FOUND
      ===================================== */

      if (!notification) {

        return res.status(404).json({

          success: false,

          message:
            "Notification not found",
        });
      }

      /* =====================================
         RESPONSE
      ===================================== */

      res.json({

        success: true,

        message:
          "Notification marked as read",

        notification,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          err.message,
      });
    }
  }
);

/* ==================================================
   MARK ALL AS READ
================================================== */

router.put(

  "/read/all",

  auth,

  async (req, res) => {

    try {

      const user =
        req.user;

      let query = {};

      /* =====================================
         SYSTEM MANAGER
      ===================================== */

      if (

        user.role ===
        "System Manager"

      ) {

        query = {};

      }

      /* =====================================
         DEPARTMENT MANAGER
      ===================================== */

      else if (

        user.role ===
        "Department Manager"

      ) {

        query = {

          $or: [

            {
              department:
                user.department,
            },

            {
              recipientId:
                user._id,
            },
          ],
        };
      }

      /* =====================================
         OFFICER
      ===================================== */

      else {

        query = {

          recipientId:
            user._id,
        };
      }

      /* =====================================
         UPDATE
      ===================================== */

      await Notification.updateMany(

        query,

        {
          isRead: true,
        }
      );

      res.json({

        success: true,

        message:
          "All notifications marked as read",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          err.message,
      });
    }
  }
);

/* ==================================================
   DELETE SINGLE NOTIFICATION
================================================== */

router.delete(

  "/:id",

  auth,

  async (req, res) => {

    try {

      const notification =

        await Notification.findByIdAndDelete(

          req.params.id
        );

      if (!notification) {

        return res.status(404).json({

          success: false,

          message:
            "Notification not found",
        });
      }

      res.json({

        success: true,

        message:
          "Notification deleted successfully",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          err.message,
      });
    }
  }
);

/* ==================================================
   CLEAR ALL NOTIFICATIONS
================================================== */

router.delete(

  "/clear/all",

  auth,

  async (req, res) => {

    try {

      const user =
        req.user;

      let query = {};

      /* =====================================
         SYSTEM MANAGER
      ===================================== */

      if (

        user.role ===
        "System Manager"

      ) {

        query = {};

      }

      /* =====================================
         DEPARTMENT MANAGER
      ===================================== */

      else if (

        user.role ===
        "Department Manager"

      ) {

        query = {

          $or: [

            {
              department:
                user.department,
            },

            {
              recipientId:
                user._id,
            },
          ],
        };
      }

      /* =====================================
         OFFICER
      ===================================== */

      else {

        query = {

          recipientId:
            user._id,
        };
      }

      /* =====================================
         DELETE
      ===================================== */

      await Notification.deleteMany(
        query
      );

      res.json({

        success: true,

        message:
          "All notifications cleared",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          err.message,
      });
    }
  }
);

/* ==================================================
   CREATE NOTIFICATION
================================================== */

router.post(

  "/create",

  auth,

  async (req, res) => {

    try {

      const {

        title,

        message,

        type,

        recipientId,

        department,

        complaintId,

        priority,

        actionLink,
      } = req.body;

      /* =====================================
         CREATE
      ===================================== */

      const notification =

        await Notification.create({

          title,

          message,

          type,

          recipientId,

          department,

          complaintId,

          priority,

          actionLink,
        });

      /* =====================================
         SOCKET.IO REALTIME
      ===================================== */

      const io =
        req.app.get("io");

      if (io) {

        io.emit(

          "newNotification",

          notification
        );
      }

      /* =====================================
         RESPONSE
      ===================================== */

      res.status(201).json({

        success: true,

        message:
          "Notification created successfully",

        notification,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false,

        message:
          err.message,
      });
    }
  }
);

module.exports =
  router;