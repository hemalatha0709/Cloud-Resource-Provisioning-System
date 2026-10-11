const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getAllResourceTypes
} = require("../controllers/resourceTypeController");


// Get all resource types
router.get(
    "/",
    verifyToken,
    getAllResourceTypes
);


module.exports = router;