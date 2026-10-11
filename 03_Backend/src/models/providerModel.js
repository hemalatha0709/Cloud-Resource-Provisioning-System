const pool = require("../config/database");

// Get all cloud providers
const getAllProviders = async () => {

    const result = await pool.query(
        `
        SELECT
            provider_id,
            provider_name
        FROM cloud_providers
        ORDER BY provider_id ASC;
        `
    );

    return result.rows;
};

module.exports = {
    getAllProviders
};