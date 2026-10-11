const pool = require("../config/database");


// =========================================================
// CREATE MONITORING RECORD
// ADMIN ONLY
// =========================================================

const createMonitoring = async (
    resourceId,
    cpuPercent,
    memoryPercent,
    storagePercent,
    networkUsage,
    healthStatus
) => {

    const result = await pool.query(
        `
        INSERT INTO usage_monitoring
        (
            resource_id,
            cpu_percent,
            memory_percent,
            storage_percent,
            network_usage,
            health_status,
            recorded_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *;
        `,
        [
            resourceId,
            cpuPercent,
            memoryPercent,
            storagePercent,
            networkUsage,
            healthStatus
        ]
    );

    return result.rows[0];
};


// =========================================================
// GET MONITORING RECORDS FOR A RESOURCE
//
// ADMIN       → Can view any resource
// CLOUD USER  → Can view only their own resource
// =========================================================

const getMonitoringByResource = async (
    resourceId,
    userId,
    roleId
) => {

    const isAdmin = Number(roleId) === 1;

    let query;
    let params;

    // -----------------------------------------------------
    // ADMIN
    // -----------------------------------------------------

    if (isAdmin) {

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
            WHERE um.resource_id = $1
            ORDER BY um.recorded_at DESC;
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
            ORDER BY um.recorded_at DESC;
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

    return result.rows;
};


// =========================================================
// GET LATEST MONITORING RECORD
//
// ADMIN       → Can view any resource
// CLOUD USER  → Can view only their own resource
// =========================================================

const getLatestMonitoring = async (
    resourceId,
    userId,
    roleId
) => {

    const isAdmin = Number(roleId) === 1;

    let query;
    let params;

    // -----------------------------------------------------
    // ADMIN
    // -----------------------------------------------------

    if (isAdmin) {

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
    createMonitoring,
    getMonitoringByResource,
    getLatestMonitoring
};