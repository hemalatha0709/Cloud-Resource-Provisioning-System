const pool = require("../config/database");


// =========================================================
// GET ALL RESOURCE REQUESTS
// =========================================================

const getAllRequests = async () => {

    const result = await pool.query(
        `
        SELECT
            rr.request_id,
            u.username,
            u.full_name,
            rr.resource_name,
            rt.type_name,
            cp.provider_name,
            rr.cpu_cores,
            rr.memory_gb,
            rr.storage_gb,
            rr.status,
            rr.requested_at,
            rr.reviewed_by,
            rr.reviewed_at
        FROM resource_requests rr
        JOIN users u
            ON rr.user_id = u.user_id
        JOIN resource_types rt
            ON rr.type_id = rt.type_id
        JOIN cloud_providers cp
            ON rr.provider_id = cp.provider_id
        ORDER BY rr.requested_at DESC
        `
    );

    return result.rows;
};


// =========================================================
// APPROVE RESOURCE REQUEST
// ONLY PENDING REQUESTS CAN BE APPROVED
// =========================================================

const approveRequest = async (
    id,
    adminId,
    expiryDate
) => {

    console.log("EXPIRY DATE RECEIVED BY MODEL:", expiryDate);

// -------------------------------------------------
// Validate expiry date
// -------------------------------------------------

if (!expiryDate) {
    throw new Error("Expiry date is required.");
}

const expiry = new Date(`${expiryDate}T00:00:00`);
const today = new Date();

today.setHours(0, 0, 0, 0);

if (
    !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate) ||
    Number.isNaN(expiry.getTime())
) {
    throw new Error(
        "Invalid expiry date. Use YYYY-MM-DD format."
    );
}

if (expiry <= today) {
    throw new Error(
        "Expiry date must be a future date."
    );
}

const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // -------------------------------------------------
        // Update request ONLY if it is currently PENDING
        // -------------------------------------------------

        const requestResult = await client.query(
            `
            UPDATE resource_requests
            SET
                status = 'APPROVED',
                reviewed_by = $2,
                reviewed_at = NOW()
            WHERE request_id = $1
              AND status = 'PENDING'
            RETURNING *;
            `,
            [
                id,
                adminId
            ]
        );


        // -------------------------------------------------
        // Request does not exist OR is already reviewed
        // -------------------------------------------------

        if (requestResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return null;
        }


        const request = requestResult.rows[0];


        // -------------------------------------------------
        // Check whether resource already exists
        // -------------------------------------------------

        const existingResource =
            await client.query(
                `
                SELECT *
                FROM resources
                WHERE request_id = $1;
                `,
                [id]
            );


        let resource = null;


        // -------------------------------------------------
        // Create resource only if it doesn't exist
        // -------------------------------------------------

        if (existingResource.rows.length === 0) {

            // -------------------------------------------------
// Generate provider-specific cloud identifier
// -------------------------------------------------

const providerResult = await client.query(
    `
    SELECT provider_name
    FROM cloud_providers
    WHERE provider_id = $1;
    `,
    [request.provider_id]
);

if (providerResult.rows.length === 0) {
    throw new Error("Cloud provider not found.");
}

const providerName =
    providerResult.rows[0].provider_name;

let providerPrefix = "cloud";

if (providerName.toUpperCase() === "AWS") {
    providerPrefix = "aws";
} else if (
    providerName.toUpperCase() === "MICROSOFT AZURE" ||
    providerName.toUpperCase() === "AZURE"
) {
    providerPrefix = "azure";
} else if (
    providerName.toUpperCase() === "GOOGLE CLOUD" ||
    providerName.toUpperCase() === "GOOGLE CLOUD PLATFORM" ||
    providerName.toUpperCase() === "GCP"
) {
    providerPrefix = "gcp";
}

const cloudIdentifier =
    `${providerPrefix}-resource-${Date.now()}`;
    
            console.log("EXPIRY DATE BEFORE INSERT:", expiryDate);    

            const resourceResult =
                await client.query(
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
                    VALUES
                    (
                        $1,
                        $2,
                        $3,
                        'ACTIVE',
                        NOW(),
                        $4
                    )
                    RETURNING *;
                    `,
                    [
                        id,
                        request.provider_id,
                        cloudIdentifier,
                        expiryDate
                    ]
                );


            resource = resourceResult.rows[0];

        // =========================================================
// AUTOMATIC MONITORING RECORD
// RESOURCE-SPECIFIC SIMULATED MONITORING
// =========================================================

// The resource capacity comes from the approved request.
// Monitoring values represent CURRENT UTILIZATION
// percentages of that capacity.

// Example:
// CPU capacity = 57 cores
// CPU utilization = 45%
// This means approximately 45% of the CPU capacity
// is currently being used.

// ---------------------------------------------------------
// Generate utilization values from the resource itself
// ---------------------------------------------------------

const cpuCapacity = Number(request.cpu_cores || 0);
const memoryCapacity = Number(request.memory_gb || 0);
const storageCapacity = Number(request.storage_gb || 0);

// Generate deterministic but realistic utilization
// based on the resource's capacity.

// CPU
let cpuUsage;

if (cpuCapacity <= 4) {
    cpuUsage = 35;
} else if (cpuCapacity <= 16) {
    cpuUsage = 45;
} else if (cpuCapacity <= 32) {
    cpuUsage = 55;
} else {
    cpuUsage = 40;
}

// Memory
let memoryUsage;

if (memoryCapacity <= 8) {
    memoryUsage = 40;
} else if (memoryCapacity <= 32) {
    memoryUsage = 50;
} else if (memoryCapacity <= 64) {
    memoryUsage = 60;
} else {
    memoryUsage = 45;
}

// Storage
let storageUsage;

if (storageCapacity <= 50) {
    storageUsage = 40;
} else if (storageCapacity <= 100) {
    storageUsage = 50;
} else if (storageCapacity <= 250) {
    storageUsage = 60;
} else {
    storageUsage = 45;
}

// ---------------------------------------------------------
// Calculate health status
// ---------------------------------------------------------

const highestUsage = Math.max(
    cpuUsage,
    memoryUsage,
    storageUsage
);

let healthStatus;

if (highestUsage >= 85) {
    healthStatus = "CRITICAL";
} else if (highestUsage >= 70) {
    healthStatus = "WARNING";
} else {
    healthStatus = "HEALTHY";
}

// ---------------------------------------------------------
// Simulated network usage
// ---------------------------------------------------------

const networkUsage =
    Math.max(cpuCapacity * 10, 100);

// ---------------------------------------------------------
// Insert monitoring record
// ---------------------------------------------------------

const monitoringResult = await client.query(
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
    VALUES
    ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *;
    `,
    [
        resource.resource_id,
        cpuUsage,
        memoryUsage,
        storageUsage,
        networkUsage,
        healthStatus
    ]
);

console.log(
    "AUTOMATIC MONITORING CREATED:",
    monitoringResult.rows[0]
);    
        
          console.log(
    "POSTGRESQL EXPIRY DATE RETURNED:",
    resource.expiry_date
);    }  else {

            resource = existingResource.rows[0];

        }


        await client.query("COMMIT");


        return {
            request,
            resource
        };


    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
};


// =========================================================
// REJECT RESOURCE REQUEST
// ONLY PENDING REQUESTS CAN BE REJECTED
// =========================================================

const rejectRequest = async (
    id,
    adminId
) => {

    const result = await pool.query(
        `
        UPDATE resource_requests
        SET
            status = 'REJECTED',
            reviewed_by = $2,
            reviewed_at = NOW()
        WHERE request_id = $1
          AND status = 'PENDING'
        RETURNING *;
        `,
        [
            id,
            adminId
        ]
    );


    return result.rows[0];
};


module.exports = {
    getAllRequests,
    approveRequest,
    rejectRequest
};