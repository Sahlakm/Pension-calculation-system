const express = require("express");
const router = express.Router();
const user = require("../models/user");
const { createHmac, randomBytes } = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require('fs'); // Import fs





// User signup route
router.post("/signup", async (req, res) => {
  const { username, email, password, confirmPassword,userType } = req.body;
  console.log("Received Data:", req.body);


  if (!email || !username || !password || !confirmPassword || !userType) {
    return res.status(400).json({ message: "All fields, including image, are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
 const salt = randomBytes(16).toString("hex");
  const hashedPassword = createHmac("sha256", salt).update(password).digest("hex");

  try {
    // Check if the user already exists
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = await user.create({
      username,
      email,
      password: hashedPassword,
      userType,
      salt,
          });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "An error occurred during signup" });
  }
});

// User signin route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await user.matchpasswordandreturntoken(email, password);
    res.cookie("uid", token);
    return res.redirect("/");
  } catch (error) {
    console.error("Error during signin:", error);
    return res.status(400).render("signin", {
      error: "Incorrect email or password",
    });
  }
});

// User logout route
router.get("/logout", (req, res) => {
  req.user = null;
  res.clearCookie("uid");
  res.status(200).json({ message: "Logged out successfully" });
});

// Render signin page
router.get("/signin", (req, res) => {
  res.render("signin");
});

// Render signup page
router.get("/signup", (req, res) => {
  res.render("signup");
});

module.exports = router;
