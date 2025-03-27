
const express = require("express");
const authMiddleware = require("../middleware/authenticate");
const router = express.Router();

router.get("/user", authMiddleware, (req, res) => {
    if (req.user) {
        return res.json({ user: req.user }); 
    } else {
        return res.status(401).json({ message: "Unauthorized" });
    }
});

module.exports = router;
