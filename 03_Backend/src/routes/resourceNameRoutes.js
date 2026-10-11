const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getResourceNames
} = require("../controllers/requestController");

// =========================================================
// GET RESOURCE NAMES
// LOGIN REQUIRED
// =========================================================

router.get(
    "/",
    verifyToken,
    getResourceNames
);

module.exports = router;