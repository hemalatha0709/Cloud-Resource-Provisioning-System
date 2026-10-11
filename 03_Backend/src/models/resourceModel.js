const pool = require("../config/database");


// =========================================================
// CREATE RESOURCE
// =========================================================
// =========================================================
// CREATE RESOURCE
// ADMIN ONLY
// =========================================================

const createResource = async (
    requestId,
    providerId,
    cloudIdentifier,
    resourceStatus,
    allocationDate,
    expiryDate
) => {

    // -----------------------------------------------------
    // 1. Check request exists and get its provider
    // -----------------------------------------------------

    const requestResult = await pool.query(
        `
        SELECT
            request_id,
            status,
            provider_id
        FROM resource_requests
        WHERE request_id = $1
        `,
        [requestId]
    );

    if (requestResult.rows.length === 0) {
        throw new Error("Resource request not found");
    }

    const request = requestResult.rows[0];

    // -----------------------------------------------------
    // 2. Request must be APPROVED
    // -----------------------------------------------------

    if (request.status !== "APPROVED") {
        throw new Error(
            "Resource can only be allocated for an approved request"
        );
    }

    // -----------------------------------------------------
    // 3. Verify provider matches the request
    // -----------------------------------------------------

    if (Number(request.provider_id) !== Number(providerId)) {
        throw new Error(
            "Selected provider does not match the resource request"
        );
    }

    // -----------------------------------------------------
    // 4. Create the resource
    // -----------------------------------------------------

    const result = await pool.query(
        `
        INSERT INTO resources
        (
            request_id,
            provider_id,
            cloud_identifier,
            resource_status,
            allocation_date,
            expiry_date
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `,
        [
            requestId,
            providerId,
            cloudIdentifier,
            resourceStatus,
            allocationDate,
            expiryDate
        ]
    );

    return result.rows[0];
};

// =========================================================
// GET ALL RESOURCES
// ADMIN ONLY
// =========================================================

const getAllResources = async () => {

    const result = await pool.query(
        `
        SELECT
            r.resource_id,
            r.request_id,
            r.provider_id,
            r.cloud_identifier,
            r.resource_status,
            r.allocation_date,
            r.expiry_date,

            rr.resource_name,
            rr.cpu_cores,
            rr.memory_gb,
            rr.storage_gb,
            rr.justification,
            rr.status AS request_status,
            rr.requested_at,
            rr.reviewed_by,
            rr.reviewed_at,

            u.user_id,
            u.username,
            u.full_name,
            u.email,

            rt.type_id,
            rt.type_name,
            rt.description AS resource_type_description,

            cp.provider_id AS cloud_provider_id,
            cp.provider_name,
            cp.region,
            cp.description AS provider_description

        FROM resources r

        INNER JOIN resource_requests rr
            ON r.request_id = rr.request_id

        INNER JOIN users u
            ON rr.user_id = u.user_id

        INNER JOIN resource_types rt
            ON rr.type_id = rt.type_id

        INNER JOIN cloud_providers cp
            ON r.provider_id = cp.provider_id

        ORDER BY r.resource_id DESC;
        `
    );

    return result.rows;
};


// =========================================================
// GET RESOURCES BY USER
// CLOUD USER ONLY
// =========================================================

const getResourcesByUser = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            r.resource_id,
            r.request_id,
            r.provider_id,
            r.cloud_identifier,
            r.resource_status,
            r.allocation_date,
            r.expiry_date,

            rr.resource_name,
            rr.cpu_cores,
            rr.memory_gb,
            rr.storage_gb,
            rr.justification,
            rr.status AS request_status,
            rr.requested_at,
            rr.reviewed_by,
            rr.reviewed_at,

            u.user_id,
            u.username,
            u.full_name,
            u.email,

            rt.type_id,
            rt.type_name,
            rt.description AS resource_type_description,

            cp.provider_id AS cloud_provider_id,
            cp.provider_name,
            cp.region,
            cp.description AS provider_description

        FROM resources r

        INNER JOIN resource_requests rr
            ON r.request_id = rr.request_id

        INNER JOIN users u
            ON rr.user_id = u.user_id

        INNER JOIN resource_types rt
            ON rr.type_id = rt.type_id

        INNER JOIN cloud_providers cp
            ON r.provider_id = cp.provider_id

        WHERE rr.user_id = $1

        ORDER BY r.resource_id DESC;
        `,
        [userId]
    );

    return result.rows;
};

// =========================================================
// GET LATEST MONITORING DATA FOR A RESOURCE
// ADMIN → ANY RESOURCE
// CLOUD USER → OWN RESOURCE ONLY
// =========================================================

const getLatestMonitoring = async (
    resourceId,
    userId,
    roleId
) => {

    let query;
    let params;

    // -----------------------------------------------------
    // ADMIN
    // -----------------------------------------------------

    if (Number(roleId) === 1) {

        query = `
            SELECT
                um.monitoring_id,
                um.resource_id,
                um.cpu_percent,
                um.memory_percent,
                um.storage_percent,
                um.network_usage,
                um.health_status,
                um.recorded_at
            FROM usage_monitoring um
            WHERE um.resource_id = $1
            ORDER BY um.recorded_at DESC
            LIMIT 1;
        `;

        params = [resourceId];

    }

    // -----------------------------------------------------
    // CLOUD USER
    // -----------------------------------------------------

    else {

        query = `
            SELECT
                um.monitoring_id,
                um.resource_id,
                um.cpu_percent,
                um.memory_percent,
                um.storage_percent,
                um.network_usage,
                um.health_status,
                um.recorded_at
            FROM usage_monitoring um

            INNER JOIN resources r
                ON um.resource_id = r.resource_id

            INNER JOIN resource_requests rr
                ON r.request_id = rr.request_id

            WHERE um.resource_id = $1
              AND rr.user_id = $2

            ORDER BY um.recorded_at DESC
            LIMIT 1;
        `;

        params = [
            resourceId,
            userId
        ];
    }

    const result = await pool.query(
        query,
        params
    );

    return result.rows[0] || null;
};

module.exports = {
    createResource,
    getAllResources,
    getResourcesByUser,
    getLatestMonitoring
};