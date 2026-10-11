const pool = require("../config/database");

// =========================================================
// Get resource request statistics
// =========================================================
const getRequestStatistics = async (userId, roleId) => {

    const result = await pool.query(
        `
        SELECT
            COUNT(*) AS total_requests,

            COUNT(*) FILTER (
                WHERE status = 'PENDING'
            ) AS pending_requests,

            COUNT(*) FILTER (
                WHERE status = 'APPROVED'
            ) AS approved_requests,

            COUNT(*) FILTER (
                WHERE status = 'REJECTED'
            ) AS rejected_requests

        FROM resource_requests rr

        WHERE
            $1 = 1
            OR rr.user_id = $2;
        `,
        [roleId, userId]
    );

    return result.rows[0];
};


// =========================================================
// Get resource statistics
// =========================================================
const getResourceStatistics = async (userId, roleId) => {

    const result = await pool.query(
        `
        SELECT
            COUNT(*) AS total_resources,

            COUNT(*) FILTER (
                WHERE resource_status = 'ACTIVE'
            ) AS active_resources,

            COUNT(*) FILTER (
                WHERE expiry_date < CURRENT_TIMESTAMP
                AND resource_status = 'ACTIVE'
            ) AS expired_resources

        FROM resources r

        WHERE
            $1 = 1
            OR r.request_id IN (
                SELECT rr.request_id
                FROM resource_requests rr
                WHERE rr.user_id = $2
            );
        `,
        [roleId, userId]
    );

    return result.rows[0];
};


// =========================================================
// Get current monitoring statistics
// =========================================================
const getMonitoringStatistics = async (userId, roleId) => {

    const result = await pool.query(
        `
        WITH latest_monitoring AS (
            SELECT DISTINCT ON (resource_id)
                resource_id,
                health_status,
                recorded_at
            FROM usage_monitoring
            ORDER BY resource_id, recorded_at DESC
        )

        SELECT
            COUNT(lm.resource_id) AS total_monitored_resources,

            COUNT(lm.resource_id) FILTER (
                WHERE lm.health_status = 'HEALTHY'
            ) AS healthy_resources,

            COUNT(lm.resource_id) FILTER (
                WHERE lm.health_status = 'WARNING'
            ) AS warning_resources,

            COUNT(lm.resource_id) FILTER (
                WHERE lm.health_status = 'CRITICAL'
            ) AS critical_resources

        FROM resources r

        LEFT JOIN latest_monitoring lm
            ON r.resource_id = lm.resource_id

        WHERE
            r.resource_status = 'ACTIVE'

            AND (
                $1 = 1
                OR r.request_id IN (
                    SELECT rr.request_id
                    FROM resource_requests rr
                    WHERE rr.user_id = $2
                )
            );
        `,
        [roleId, userId]
    );

    return result.rows[0];
};


// =========================================================
// Get complete dashboard statistics
// =========================================================
const getDashboardStatistics = async (userId, roleId) => {

    const requestStatistics =
        await getRequestStatistics(userId, roleId);

    const resourceStatistics =
        await getResourceStatistics(userId, roleId);

    const monitoringStatistics =
        await getMonitoringStatistics(userId, roleId);

    return {
        requests: requestStatistics,
        resources: resourceStatistics,
        monitoring: monitoringStatistics
    };
};


// =========================================================
// Get detailed resource requests for Reports page
// =========================================================
const getRequestDetails = async (userId, roleId) => {

    const result = await pool.query(
        `
        SELECT
            rr.request_id,
            rr.resource_name,
            rt.type_name AS resource_type,
            cp.provider_name AS provider,
            rr.cpu_cores,
            rr.memory_gb,
            rr.storage_gb,
            rr.status,
            rr.requested_at,
            rr.reviewed_by,
            rr.reviewed_at,

            reviewer.full_name AS reviewed_by_name,
            reviewer.username AS reviewed_by_username

        FROM resource_requests rr

        LEFT JOIN resource_types rt
            ON rr.type_id = rt.type_id

        LEFT JOIN cloud_providers cp
            ON rr.provider_id = cp.provider_id

        LEFT JOIN users reviewer
            ON rr.reviewed_by = reviewer.user_id

        WHERE
            $1 = 1
            OR rr.user_id = $2

        ORDER BY rr.requested_at DESC;
        `,
        [roleId, userId]
    );

    return result.rows;
};

module.exports = {
    getRequestStatistics,
    getResourceStatistics,
    getMonitoringStatistics,
    getDashboardStatistics,
    getRequestDetails
};