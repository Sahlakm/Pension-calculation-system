const express = require("express");
const router = express.Router();
const Pensioner = require("../models/pensioner");
const { PensionDetails } = require("../models/pension");
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

router.delete('/employees/:PPoNo', async (req, res) => {
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

router.delete('/pension/:PPoNo', async (req, res) => {
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


router.put('/employees/:PPoNo', async (req, res) => {
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


router.put('/pension/:PPoNo', async (req, res) => {
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

    res.json({ message: "Pension details updated successfully", updatedPension });
  } catch (error) {
    console.error("Error updating pension details:", error);
    res.status(500).json({ message: "Server error" });
  }
});





// Route to add a new pensioner with pension details
router.post("/add-employee", async (req, res) => {
    try {
      console.log("response", req.body);
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
    const {
      PPoNo,
      basic,
      dp_a,
      medi_allowance,
      other_allowance,
      other_deduction,
      income_tax,
      dr,
      total,
      reduced_pension,
      total_pension,
      net_pay,
    } = req.body;

    // Check if PPoNo already exists
    PensionDetails.findOne({ PPoNo }).then((existingPension) => {
        console.log(existingPension);
        if (existingPension) {
            return res.status(400).json({ message: "Pension record already exists" });
        }
        // Create new Pension entry
        const newPension = new PensionDetails({
            PPoNo,
            basic,
            dp_a,
            medi_allowance,
            other_allowance,
            other_deduction,
            income_tax,
            dr,
            total,
            reduced_pension,
            total_pension,
            net_pay,
        });
    
        // Save to database
        newPension.save().then(() => {
            res.status(201).json({ message: "Pension details saved successfully!" });
        });
    })
    
    
  } catch (error) {
    console.error("Error saving pension details:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;

router.get('/:ppoNumber', async (req, res) => {
  try {
    const employee = await Employee.findOne({ 'employee.PPoNo': req.params.ppoNumber });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

