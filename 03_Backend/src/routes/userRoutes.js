const express = require("express");

const router = express.Router();

const { getUsers } = require("../controllers/userController");

const verifyToken = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/roleMiddleware");

// =========================================================
// GET ALL USERS
// ADMIN ONLY
// =========================================================

router.get(
    "/",
    verifyToken,
    checkAdmin,
    getUsers
);

module.exports = router;