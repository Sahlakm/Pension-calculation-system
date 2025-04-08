const express = require("express");
const router = express.Router();
const Pensioner = require("../models/pensioner");
const PensionDetails = require("../models/pension");
const auth = require("../middleware/authenticate");
const User = require("../models/user");

// console.log(PensionDetails);

// Fetch employee details by PPoNo
router.get("/employees/:PPoNo", async (req, res) => {
  try {
    const { PPoNo } = req.params;
    const employee = await Pensioner.findOne({ PPoNo });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/pension/:PPoNo", async (req, res) => {
  try {
    const { PPoNo } = req.params;
    const pension = await PensionDetails.findOne({ PPoNo });

    if (!pension) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(pension);
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/employees/:PPoNo", async (req, res) => {
  try {
    const { ppoNo } = req.params;

    const deletedEmployee = await Pensioner.findOneAndDelete({ ppoNo });

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/pension/:PPoNo", async (req, res) => {
  try {
    const { ppoNo } = req.params;

    const deletedPension = await PensionDetails.findOneAndDelete({ ppoNo });

    if (!deletedPension) {
      return res.status(404).json({ message: "Pension details not found" });
    }

    res.json({ message: "Pension details deleted successfully" });
  } catch (error) {
    console.error("Error deleting pension details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/employees/:PPoNo", async (req, res) => {
  try {
    const { PPoNo } = req.params;
    const updateData = req.body; // Updated fields sent from frontend

    const updatedEmployee = await Pensioner.findOneAndUpdate(
      { PPoNo },
      updateData,
      { new: true } // Return updated document
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully", updatedEmployee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/pension/:PPoNo", async (req, res) => {
  try {
    const { PPoNo } = req.params;
    const updateData = req.body;

    const updatedPension = await PensionDetails.findOneAndUpdate(
      { PPoNo },
      updateData,
      { new: true } // Return updated document
    );

    if (!updatedPension) {
      return res.status(404).json({ message: "Pension details not found" });
    }

    res.json({
      message: "Pension details updated successfully",
      updatedPension,
    });
  } catch (error) {
    console.error("Error updating pension details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to add a new pensioner with pension details
router.post("/add-employee", async (req, res) => {
  try {
    // console.log("response", req.body);
    const {
      PPoNo,
      name,
      pension_rule,
      pension_status,
      email,
      phone_number,
      adhaar_number,
      address,
      date_of_birth,
      date_of_joining,
      date_of_retirement,
      bank, // Add bank details here
    } = req.body;

    // Create new pensioner with bank details
    const newPensioner = new Pensioner({
      PPoNo,
      name,
      pension_rule,
      pension_status,
      email,
      phone_number,
      adhaar_number,
      address,
      date_of_birth,
      date_of_joining,
      date_of_retirement,
      bank, // Include bank details in the new pensioner object
    });

    // Save the new pensioner to the database
    const savedPensioner = await newPensioner.save();

    // Send success response
    res.status(201).json({
      message: "Employee details added successfully!",
      data: savedPensioner,
    });
  } catch (error) {
    console.error("Error adding employee details:", error.message);
    res.status(500).json({
      message: "Failed to add employee details.",
      error: error.message,
    });
  }
});

// POST route to add pension details
router.post("/add-pension-details", async (req, res) => {
  try {
    // console.log(req.body);
    const {
      PPoNo,
      medi_allowance,
      other_allowance,
      other_deduction,
      income_tax,
      reduced_pension
    } = req.body;

    // Check if PPoNo already exists
    const existingPension = await PensionDetails.findOne({ PPoNo });
    
    if (existingPension) {
      return res.status(400).json({ message: "Pension record already exists" });
    }

    // Create new Pension entry with only the fields in the schema
    const newPension = new PensionDetails({
      PPoNo,
      medi_allowance: medi_allowance || 0,
      other_allowance: other_allowance || 0,
      other_deduction: other_deduction || 0,
      income_tax: income_tax || 0,
      reduced_pension: reduced_pension || 0
    });
    // console.log("newPension", newPension);

    // Save to database
    await newPension.save();
    res.status(201).json({ message: "Pension details saved successfully!" });

  } catch (error) {
    console.error("Error saving pension details:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 👤 Route for logged-in user to fetch their own pension details
router.get("/user-pension", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user and their corresponding PPoNo
    const user = await User.findById(userId);
    if (!user || !user.PPoNo) {
      return res.status(404).json({ message: "User or PPoNo not found" });
    }

    const pensionData = await PensionDetails.find({ PPoNo: user.PPoNo });
    if (!pensionData || pensionData.length === 0) {
      return res.status(404).json({ message: "Pension details not found" });
    }

    res.status(200).json(pensionData);
  } catch (err) {
    console.error("Error fetching user pension data:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// routes/pensioner.js
router.get("/all", async (req, res) => {
  console.log("📥 Received request to /all with query:", req.query);
  const { month, employmentType } = req.query;

  if (!month || !employmentType) {
    return res
      .status(400)
      .json({ message: "Month and employmentType required" });
  }

  try {
    const data = await PensionDetails.find({ month, employmentType });
    // console.log("data ", data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:ppoNumber", async (req, res) => {
  try {
    const employee = await Employee.findOne({
      "employee.PPoNo": req.params.ppoNumber,
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
