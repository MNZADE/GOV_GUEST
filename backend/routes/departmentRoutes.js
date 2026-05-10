import express from "express";
import mongoose from "mongoose";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import auth from "../middleware/adminAuth.js";

const router = express.Router();


/* =========================================
   GET ALL USERS (Manager Dropdown)
========================================= */
router.get("/users", auth, async (req, res) => {
  try {

    const users = await User.find()
      .select("_id name email");

    res.json(users);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });

  }
});



/* =========================================
   ADD DEPARTMENT
========================================= */
router.post("/add", auth, async (req, res) => {

  try {

    const { name, manager, managerId } = req.body;

    const selectedManager = manager || managerId;

    console.log("Incoming manager:", selectedManager);


    /* Validate Name */
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required"
      });
    }


    /* Check Duplicate */
    const existingDepartment = await Department.findOne({
      name: name.trim()
    });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: "Department already exists"
      });
    }


    /* Validate ObjectId */
    if (
      selectedManager &&
      !mongoose.Types.ObjectId.isValid(selectedManager)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid manager ID"
      });
    }


    /* Create Department */
    const department = await Department.create({
      name: name.trim(),
      manager: selectedManager || null
    });


    const populatedDepartment =
      await Department.findById(department._id)
        .populate("manager", "_id name email");


    res.status(201).json({
      success: true,
      message: "Department added successfully",
      department: populatedDepartment
    });

  }

  catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

});



/* =========================================
   CREATE DEPARTMENT (Alternative Route)
========================================= */
router.post("/", auth, async (req, res) => {

  try {

    const { name, managerId } = req.body;

    if (!name || !managerId) {
      return res.status(400).json({
        success: false,
        message: "Name and Manager required"
      });
    }

    const exists = await Department.findOne({
      name: name.trim()
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Department already exists"
      });
    }

    const department = await Department.create({
      name: name.trim(),
      manager: managerId
    });

    const populated =
      await Department.findById(department._id)
        .populate("manager", "_id name email");

    res.status(201).json({
      success: true,
      department: populated
    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});



/* =========================================
   GET ALL DEPARTMENTS
========================================= */
router.get("/", auth, async (req, res) => {

  try {

    const departments =
      await Department.find()
        .populate("manager", "_id name email")
        .lean();

    const departmentIds =
      departments.map(d => d._id);

    const complaints =
      await Complaint.find({
        department: { $in: departmentIds }
      }).lean();

    const complaintMap = {};

    complaints.forEach((c) => {

      const deptId = c.department.toString();

      if (!complaintMap[deptId]) {
        complaintMap[deptId] = [];
      }

      complaintMap[deptId].push(c);

    });


    const result = departments.map((dept) => {

      const deptId = dept._id.toString();

      const deptComplaints =
        complaintMap[deptId] || [];

      const solved =
        deptComplaints.filter(
          c => c.status === "Resolved"
        ).length;

      return {
        ...dept,
        complaints: deptComplaints,
        solved,
        pending: deptComplaints.length - solved
      };

    });

    res.json({
      success: true,
      departments: result
    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});



/* =========================================
   GET MY DEPARTMENT
========================================= */
router.get("/my-department", auth, async (req, res) => {

  try {

    const department =
      await Department.findOne({
        manager: req.user.id
      }).populate("manager", "_id name email");

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "No department assigned"
      });
    }

    const complaints =
      await Complaint.find({
        department: department._id
      });

    const solved =
      complaints.filter(
        c => c.status === "Resolved"
      ).length;

    res.json({
      success: true,
      department: {
        ...department._doc,
        complaints,
        solved,
        pending: complaints.length - solved
      }
    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});



/* =========================================
   GET SINGLE DEPARTMENT
========================================= */
router.get("/:id", auth, async (req, res) => {

  try {

    if (
      !mongoose.Types.ObjectId.isValid(req.params.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID"
      });
    }

    const department =
      await Department.findById(req.params.id)
        .populate("manager", "_id name email");

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    const complaints =
      await Complaint.find({
        department: req.params.id
      });

    const solved =
      complaints.filter(
        c => c.status === "Resolved"
      ).length;

    res.json({
      success: true,
      department: {
        ...department._doc,
        complaints,
        solved,
        pending: complaints.length - solved
      }
    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});



/* =========================================
   UPDATE DEPARTMENT
========================================= */
router.put("/:id", auth, async (req, res) => {

  try {

    const { name, managerId } = req.body;

    if (!name || !managerId) {
      return res.status(400).json({
        success: false,
        message: "Name and Manager required"
      });
    }

    const updated =
      await Department.findByIdAndUpdate(
        req.params.id,
        {
          name: name.trim(),
          manager: managerId
        },
        { new: true }
      ).populate("manager", "_id name email");


    res.json({
      success: true,
      department: updated
    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});



/* =========================================
   DELETE DEPARTMENT
========================================= */
router.delete("/:id", auth, async (req, res) => {

  try {

    await Department.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Department deleted"
    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});


export default router;