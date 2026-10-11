const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getDashboardStatistics
} = require("../controllers/dashboardController");

// Dashboard is available to authenticated Admin and Cloud Users
router.get(
    "/",
    verifyToken,
    getDashboardStatistics
);

module.exports = router;
