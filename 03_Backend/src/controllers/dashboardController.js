const reportModel = require("../models/reportModel");

// =========================================================
// Get dashboard statistics for Admin and Cloud User
// =========================================================
const getDashboardStatistics = async (req, res) => {

    try {

        const userId = req.user.user_id;
        const roleId = req.user.role_id;

        const statistics =
            await reportModel.getDashboardStatistics(
                userId,
                roleId
            );

        res.status(200).json({
            message: "Dashboard statistics retrieved successfully",
            statistics
        });

    } catch (error) {

        console.error("Dashboard statistics error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getDashboardStatistics
};