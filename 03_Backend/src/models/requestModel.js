const pool = require("../config/database");

// Create Resource Request
const createRequest = async (data) => {

    const {
        user_id,
        type_id,
        provider_id,
        resource_name,
        cpu_cores,
        memory_gb,
        storage_gb,
        justification
    } = data;


    const result = await pool.query(
        `
        INSERT INTO resource_requests
        (
            user_id,
            type_id,
            provider_id,
            resource_name,
            cpu_cores,
            memory_gb,
            storage_gb,
            justification
        )

        VALUES($1,$2,$3,$4,$5,$6,$7,$8)

        RETURNING *
        `,
        [
            user_id,
            type_id,
            provider_id,
            resource_name,
            cpu_cores,
            memory_gb,
            storage_gb,
            justification
        ]
    );


    return result.rows[0];

};

// Get requests of logged-in user
const getMyRequests = async (user_id) => {

    const result = await pool.query(
        `
        SELECT

            rr.request_id,
            rr.resource_name,
            rr.cpu_cores,
            rr.memory_gb,
            rr.storage_gb,
            rr.status,
            rr.requested_at,
            rr.reviewed_at,
            rr.reviewed_by,
            rr.justification,

            rt.type_name,

            cp.provider_name,

            u.full_name AS requester_name,
            u.username AS requester_username,

            reviewer.full_name AS reviewed_by_name,
            reviewer.username AS reviewed_by_username

        FROM resource_requests rr

        JOIN resource_types rt
            ON rr.type_id = rt.type_id

        JOIN cloud_providers cp
            ON rr.provider_id = cp.provider_id

        JOIN users u
            ON rr.user_id = u.user_id

        LEFT JOIN users reviewer
            ON rr.reviewed_by = reviewer.user_id

        WHERE rr.user_id = $1

        ORDER BY rr.requested_at DESC
        `,
        [user_id]
    );

    return result.rows;
};


// Get available resource names
const getResourceNames = async () => {

    const result = await pool.query(`
        SELECT DISTINCT resource_name
        FROM resource_requests
        WHERE resource_name IS NOT NULL
          AND TRIM(resource_name) <> ''
        ORDER BY resource_name
    `);

    return result.rows;
};

module.exports = {
    createRequest,
    getMyRequests,
    getResourceNames
};

