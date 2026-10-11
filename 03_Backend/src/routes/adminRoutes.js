const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/roleMiddleware");

const {
    getAllResourceRequests,
    approveRequest,
    rejectRequest
} = require("../controllers/adminController");


// =========================================================
// VIEW ALL RESOURCE REQUESTS
// ADMIN ONLY
// =========================================================

router.get(
    "/requests",
    verifyToken,
    checkAdmin,
    getAllResourceRequests
);


// =========================================================
// APPROVE RESOURCE REQUEST
// ADMIN ONLY
// =========================================================

router.put(
    "/request/:id/approve",
    verifyToken,
    checkAdmin,
    approveRequest
);


// =========================================================
// REJECT RESOURCE REQUEST
// ADMIN ONLY
// =========================================================

router.put(
    "/request/:id/reject",
    verifyToken,
    checkAdmin,
    rejectRequest
);


module.exports = router;