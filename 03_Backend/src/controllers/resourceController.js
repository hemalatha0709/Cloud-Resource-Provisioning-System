const resourceModel = require("../models/resourceModel");

// Create Resource

const createResource = async (req, res) => {

    try {

        const {
            request_id,
            provider_id,
            cloud_identifier,
            resource_status,
            allocation_date,
            expiry_date
        } = req.body;


        const resource = await resourceModel.createResource(
            request_id,
            provider_id,
            cloud_identifier,
            resource_status,
            allocation_date,
            expiry_date
        );


        res.status(201).json({
            message: "Resource created successfully",
            resource
        });


    } catch (error) {

        console.error(error);


        // Request does not exist

        if (error.message === "Resource request not found") {

            return res.status(404).json({
                message: error.message
            });

        }


        // Request is not approved

        if (
            error.message ===
            "Resource can only be allocated for an approved request"
        ) {

            return res.status(400).json({
                message: error.message
            });

        }


        // Other server errors

        res.status(500).json({
            message: "Server error"
        });

    }

};
// Get resources based on logged-in user's role

const getAllResources = async (req, res) => {

    try {

        const userId = req.user.user_id;
        const roleId = req.user.role_id;

        let resources;

        // System Administrator → see all resources
        if (Number(roleId) === 1) {

            resources =
                await resourceModel.getAllResources();

        }

        // Cloud User → see only their own resources
        else {

            resources =
                await resourceModel.getResourcesByUser(
                    userId
                );

        }

        res.status(200).json(resources);

    } catch (error) {

        console.error(
            "Get resources error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};

// =========================================================
// GET LATEST MONITORING DATA
// =========================================================

const getResourceMonitoring = async (req, res) => {

    try {

        const resourceId = req.params.id;

        const userId = req.user.user_id;

        const roleId = req.user.role_id;


        const monitoring =
            await resourceModel.getLatestMonitoring(
                resourceId,
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

        console.error(
            "Get resource monitoring error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

};

module.exports = {
    createResource,
    getAllResources,
    getResourceMonitoring
};