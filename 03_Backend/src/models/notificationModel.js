const pool = require("../config/database");

// Get notifications for logged-in user
const getNotifications = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            notification_id,
            title,
            message,
            type,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};


// Get unread notification count
const getUnreadCount = async (userId) => {

    const result = await pool.query(
        `
        SELECT COUNT(*) AS unread_count
        FROM notifications
        WHERE user_id = $1
        AND is_read = FALSE
        `,
        [userId]
    );

    return Number(result.rows[0].unread_count);
};


// Mark one notification as read
const markAsRead = async (notificationId, userId) => {

    const result = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = $1
        AND user_id = $2
        RETURNING *
        `,
        [notificationId, userId]
    );

    return result.rows[0];
};


// Mark all notifications as read
const markAllAsRead = async (userId) => {

    await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
        AND is_read = FALSE
        `,
        [userId]
    );
};


module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};