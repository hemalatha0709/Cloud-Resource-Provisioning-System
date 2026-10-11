const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getAllProviders
} = require("../controllers/providerController");


// Get all cloud providers
router.get(
    "/",
    verifyToken,
    getAllProviders
);


module.exports = router;