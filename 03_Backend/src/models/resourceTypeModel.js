const pool = require("../config/database");

// Get all resource types
const getAllResourceTypes = async () => {

    const result = await pool.query(
        `
        SELECT
            type_id,
            type_name
        FROM resource_types
        ORDER BY type_id ASC;
        `
    );

    return result.rows;
};

module.exports = {
    getAllResourceTypes
};