const resourceTypeModel = require("../models/resourceTypeModel");

// Get all resource types
const getAllResourceTypes = async (req, res) => {

    try {

        const resourceTypes =
            await resourceTypeModel.getAllResourceTypes();

        res.status(200).json(resourceTypes);

    } catch (error) {

        console.error(
            "Resource types error:",
            error
        );

        res.status(500).json({
            message: "Failed to retrieve resource types"
        });

    }
};

module.exports = {
    getAllResourceTypes
};