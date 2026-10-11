const providerModel = require("../models/providerModel");

// Get all cloud providers
const getAllProviders = async (req, res) => {

    try {

        const providers =
            await providerModel.getAllProviders();

        res.status(200).json(providers);

    } catch (error) {

        console.error(
            "Providers error:",
            error
        );

        res.status(500).json({
            message: "Failed to retrieve providers"
        });

    }
};

module.exports = {
    getAllProviders
};