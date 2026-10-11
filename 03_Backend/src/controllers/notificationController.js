const notificationModel = require("../models/notificationModel");


// =========================================================
// GET NOTIFICATIONS
// =========================================================

const getNotifications = async (req, res) => {

    try {

        const userId = req.user.user_id;

        const notifications =
            await notificationModel.getNotifications(userId);

        const unreadCount =
            await notificationModel.getUnreadCount(userId);

        res.json({
            notifications,
            unreadCount
        });

    } catch (error) {

        console.error("Get notifications error:", error);

        res.status(500).json({
            message: "Failed to fetch notifications"
        });
    }
};


// =========================================================
// MARK ONE AS READ
// =========================================================

const markAsRead = async (req, res) => {

    try {

        const userId = req.user.user_id;
        const notificationId = req.params.id;

        const notification =
            await notificationModel.markAsRead(
                notificationId,
                userId
            );

        if (!notification) {

            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification marked as read"
        });

    } catch (error) {

        console.error("Mark notification error:", error);

        res.status(500).json({
            message: "Failed to update notification"
        });
    }
};


// =========================================================
// MARK ALL AS READ
// =========================================================

const markAllAsRead = async (req, res) => {

    try {

        const userId = req.user.user_id;

        await notificationModel.markAllAsRead(userId);

        res.json({
            message: "All notifications marked as read"
        });

    } catch (error) {

        console.error("Mark all notifications error:", error);

        res.status(500).json({
            message: "Failed to update notifications"
        });
    }
};


module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};