const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/profileController");


// Get profile
router.get(
    "/",
    verifyToken,
    getProfile
);


// Update profile
router.put(
    "/",
    verifyToken,
    updateProfile
);


// Change password
router.put(
    "/password",
    verifyToken,
    changePassword
);


module.exports = router;