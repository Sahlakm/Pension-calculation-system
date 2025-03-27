const express = require("express");
const router = express.Router();
const Pensioner = require("../models/pensioner");
const { PensionDetails } = require("../models/pension");
console.log(PensionDetails);

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
    console.log("response", req.body);
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






module.exports = router;
