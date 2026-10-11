const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
    getNotifications,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");


// Get notifications
router.get(
    "/",
    verifyToken,
    getNotifications
);


// Mark all as read
router.put(
    "/read-all",
    verifyToken,
    markAllAsRead
);


// Mark one as read
router.put(
    "/:id/read",
    verifyToken,
    markAsRead
);


module.exports = router;