const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/roleMiddleware");

const {
    createMonitoring,
    getMonitoringByResource,
    getLatestMonitoring
} = require("../controllers/monitoringController");


// =========================================================
// CREATE MONITORING RECORD
// ADMIN ONLY
// =========================================================

router.post(
    "/",
    verifyToken,
    checkAdmin,
    createMonitoring
);


// =========================================================
// GET MONITORING HISTORY
//
// ADMIN       → Any resource
// CLOUD USER  → Own resource only
// =========================================================

router.get(
    "/resource/:id",
    verifyToken,
    getMonitoringByResource
);


// =========================================================
// GET LATEST MONITORING
//
// ADMIN       → Any resource
// CLOUD USER  → Own resource only
// =========================================================

router.get(
    "/resource/:id/latest",
    verifyToken,
    getLatestMonitoring
);


module.exports = router;