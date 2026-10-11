const monitoringModel = require("../models/monitoringModel");


// =========================================================
// CREATE MONITORING
// ADMIN ONLY
// =========================================================

const createMonitoring = async (req, res) => {

    try {

        const {
            resource_id,
            cpu_percent,
            memory_percent,
            storage_percent,
            network_usage,
            health_status
        } = req.body;


        // -----------------------------------------------------
        // Required field validation
        // -----------------------------------------------------

        if (
            resource_id === undefined ||
            cpu_percent === undefined ||
            memory_percent === undefined ||
            storage_percent === undefined ||
            network_usage === undefined ||
            health_status === undefined
        ) {
            return res.status(400).json({
                message: "All monitoring fields are required"
            });
        }


        // -----------------------------------------------------
        // Convert numeric values
        // -----------------------------------------------------

        const resourceId = Number(resource_id);
        const cpuPercent = Number(cpu_percent);
        const memoryPercent = Number(memory_percent);
        const storagePercent = Number(storage_percent);
        const networkUsage = Number(network_usage);


        // -----------------------------------------------------
        // Numeric validation
        // -----------------------------------------------------

        if (
            !Number.isInteger(resourceId) ||
            resourceId <= 0
        ) {
            return res.status(400).json({
                message: "Resource ID must be a valid positive integer"
            });
        }


        if (
            !Number.isFinite(cpuPercent) ||
            !Number.isFinite(memoryPercent) ||
            !Number.isFinite(storagePercent)
        ) {
            return res.status(400).json({
                message:
                    "CPU, memory and storage values must be valid numbers"
            });
        }


        // -----------------------------------------------------
        // Percentage validation
        // -----------------------------------------------------

        if (
            cpuPercent < 0 ||
            cpuPercent > 100 ||
            memoryPercent < 0 ||
            memoryPercent > 100 ||
            storagePercent < 0 ||
            storagePercent > 100
        ) {
            return res.status(400).json({
                message:
                    "CPU, memory and storage percentages must be between 0 and 100"
            });
        }


        // -----------------------------------------------------
        // Network validation
        // -----------------------------------------------------

        if (
            !Number.isFinite(networkUsage) ||
            networkUsage < 0
        ) {
            return res.status(400).json({
                message: "Network usage must be a valid non-negative number"
            });
        }


        // -----------------------------------------------------
        // Health status validation
        // -----------------------------------------------------

        const validHealthStatuses = [
            "HEALTHY",
            "WARNING",
            "CRITICAL"
        ];

        if (!validHealthStatuses.includes(health_status)) {

            return res.status(400).json({
                message:
                    "Health status must be HEALTHY, WARNING or CRITICAL"
            });
        }


        // -----------------------------------------------------
        // Create monitoring record
        // -----------------------------------------------------

        const monitoring =
            await monitoringModel.createMonitoring(
                resourceId,
                cpuPercent,
                memoryPercent,
                storagePercent,
                networkUsage,
                health_status
            );


        res.status(201).json({
            message: "Monitoring record created successfully",
            monitoring
        });

    } catch (error) {

        console.error(error);

        // Resource does not exist / foreign key violation
        if (error.code === "23503") {
            return res.status(404).json({
                message: "Resource not found"
            });
        }

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =========================================================
// GET MONITORING HISTORY
// =========================================================

const getMonitoringByResource = async (req, res) => {

    try {

        const { id } = req.params;

        const userId = req.user.user_id;
        const roleId = Number(req.user.role_id);


        const monitoring =
            await monitoringModel.getMonitoringByResource(
                id,
                userId,
                roleId
            );


        res.status(200).json(monitoring);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// =========================================================
// GET LATEST MONITORING
// =========================================================

const getLatestMonitoring = async (req, res) => {

    try {

        const { id } = req.params;

        const userId = req.user.user_id;
        const roleId = Number(req.user.role_id);


        const monitoring =
            await monitoringModel.getLatestMonitoring(
                id,
                userId,
                roleId
            );


        if (!monitoring) {

            return res.status(404).json({
                message: "No monitoring data found for this resource"
            });
        }


        res.status(200).json(monitoring);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createMonitoring,
    getMonitoringByResource,
    getLatestMonitoring
};