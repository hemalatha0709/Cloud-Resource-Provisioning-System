const express = require("express");

const router = express.Router();

const {
    getRequestStatistics,
    getResourceStatistics,
    getMonitoringStatistics,
    getDashboardStatistics,
    getRequestDetails
} = require("../controllers/reportController");

const verifyToken = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/roleMiddleware");

// Get request statistics
router.get(
    "/requests",
    verifyToken,
    checkAdmin,
    getRequestStatistics
);

// Get detailed request records
router.get(
    "/requests/details",
    verifyToken,
    checkAdmin,
    getRequestDetails
);

// Get resource statistics
router.get(
    "/resources",
    verifyToken,
    checkAdmin,
    getResourceStatistics
);

// Get monitoring statistics
router.get(
    "/monitoring",
    verifyToken,
    checkAdmin,
    getMonitoringStatistics
);

// Get complete dashboard statistics
router.get(
    "/dashboard",
    verifyToken,
    checkAdmin,
    getDashboardStatistics
);

module.exports = router;