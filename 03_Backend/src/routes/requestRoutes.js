const express = require("express");

const router = express.Router();

const verifyToken =
    require("../middleware/authMiddleware");

const {
    createResourceRequest,
    getMyResourceRequests,
    getResourceNames
} = require("../controllers/requestController");


// =========================================================
// CREATE RESOURCE REQUEST
// CLOUD USER
// =========================================================

router.post(
    "/",
    verifyToken,
    createResourceRequest
);


// =========================================================
// GET LOGGED-IN USER'S REQUESTS
// =========================================================

router.get(
    "/my",
    verifyToken,
    getMyResourceRequests
);


// =========================================================
// GET RESOURCE NAMES
// LOGIN REQUIRED
// =========================================================

router.get(
    "/resource-names",
    verifyToken,
    getResourceNames
);


module.exports = router;