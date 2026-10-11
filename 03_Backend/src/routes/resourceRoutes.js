const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/roleMiddleware");

const {
    createResource,
    getAllResources,
    getResourceMonitoring
} = require("../controllers/resourceController");


// =========================================================
// CREATE RESOURCE
// ADMIN ONLY
// =========================================================

router.post(
    "/",
    verifyToken,
    checkAdmin,
    createResource
);


// =========================================================
// GET RESOURCES
// ADMIN → ALL RESOURCES
// CLOUD USER → OWN RESOURCES
// =========================================================

router.get(
    "/",
    verifyToken,
    getAllResources
);


// =========================================================
// GET LATEST MONITORING
// ADMIN → ANY RESOURCE
// CLOUD USER → OWN RESOURCE ONLY
// =========================================================

router.get(
    "/:id/monitoring",
    verifyToken,
    getResourceMonitoring
);


module.exports = router;