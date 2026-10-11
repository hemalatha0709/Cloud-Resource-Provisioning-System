const reportModel = require("../models/reportModel");

// =========================================================
// Get resource request statistics
// =========================================================
const getRequestStatistics = async (req, res) => {

    try {

        const userId = req.user.user_id;
        const roleId = req.user.role_id;

        const statistics =
            await reportModel.getRequestStatistics(
                userId,
                roleId
            );

        res.status(200).json({
            message: "Request statistics retrieved successfully",
            statistics
        });

    } catch (error) {

        console.error("Request statistics error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =========================================================
// Get resource statistics
// =========================================================
const getResourceStatistics = async (req, res) => {

    try {

        const userId = req.user.user_id;
        const roleId = req.user.role_id;

        const statistics =
            await reportModel.getResourceStatistics(
                userId,
                roleId
            );

        res.status(200).json({
            message: "Resource statistics retrieved successfully",
            statistics
        });

    } catch (error) {

        console.error("Resource statistics error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =========================================================
// Get monitoring statistics
// =========================================================
const getMonitoringStatistics = async (req, res) => {

    try {

        const userId = req.user.user_id;
        const roleId = req.user.role_id;

        const statistics =
            await reportModel.getMonitoringStatistics(
                userId,
                roleId
            );

        res.status(200).json({
            message: "Monitoring statistics retrieved successfully",
            statistics
        });

    } catch (error) {

        console.error("Monitoring statistics error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =========================================================
// Get complete dashboard statistics
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


// =========================================================
// Get detailed resource requests
// =========================================================
const getRequestDetails = async (req, res) => {

    try {

        const userId = req.user.user_id;
        const roleId = req.user.role_id;

        const requests =
            await reportModel.getRequestDetails(
                userId,
                roleId
            );

        res.status(200).json({
            message: "Request details retrieved successfully",
            requests
        });

    } catch (error) {

        console.error("Request details error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    getRequestStatistics,
    getResourceStatistics,
    getMonitoringStatistics,
    getDashboardStatistics,
    getRequestDetails
};