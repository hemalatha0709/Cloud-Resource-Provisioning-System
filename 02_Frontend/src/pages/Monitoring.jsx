import "../style/monitoring.css";
import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    CircleAlert,
    Cpu,
    HardDrive,
    MemoryStick,
    RefreshCw,
    Search,
    Server,
} from "lucide-react";

const Monitoring = () => {

    /* =========================================================
       RESOURCES
       Real data comes from:
       GET /api/resources

       Monitoring data comes from:
       GET /api/resources/:id/monitoring
    ========================================================= */

    const [resources, setResources] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    /* =========================================================
       FILTER STATE
    ========================================================= */

    const [searchTerm, setSearchTerm] = useState("");
    const [providerFilter, setProviderFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [refreshing, setRefreshing] = useState(false);

    /* =========================================================
       FETCH RESOURCES + MONITORING DATA
    ========================================================= */

    const fetchMonitoringData = async () => {

        try {

            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Authentication token not found"
                );
            }

            /* =================================================
               STEP 1
               GET ALL RESOURCES
            ================================================= */

            const resourceResponse = await fetch(
                "http://localhost:5000/api/resources",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!resourceResponse.ok) {

                throw new Error(
                    "Failed to fetch resources"
                );
            }

            const resourceData =
                await resourceResponse.json();

            /* =================================================
               STEP 2
               ONLY ACTIVE RESOURCES
            ================================================= */

            const activeResources =
                resourceData.filter(
                    (resource) =>
                        resource.resource_status ===
                        "ACTIVE"
                );

            /* =================================================
               STEP 3
               GET LATEST MONITORING DATA
               FOR EACH ACTIVE RESOURCE
            ================================================= */

            const resourcesWithMonitoring =
                await Promise.all(

                    activeResources.map(
                        async (resource) => {

                            try {

                                const monitoringResponse =
                                    await fetch(
                                        `http://localhost:5000/api/resources/${resource.resource_id}/monitoring`,
                                        {
                                            method: "GET",
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );

                                /* ---------------------------------
                                   Resource has no monitoring data
                                   --------------------------------- */

                                if (
                                    !monitoringResponse.ok
                                ) {

                                    return {
                                        ...resource,

                                        cpu_usage: null,
                                        memory_usage: null,
                                        storage_usage: null,

                                        monitoring_status:
                                            "NOT_MONITORED",

                                        last_monitored:
                                            null,
                                    };
                                }

                                const monitoring =
                                    await monitoringResponse.json();

                                /* ---------------------------------
                                   Combine resource + monitoring
                                   --------------------------------- */

                                return {

                                    ...resource,

                                    cpu_usage:
                                        Number(
                                            monitoring.cpu_percent
                                        ),

                                    memory_usage:
                                        Number(
                                            monitoring.memory_percent
                                        ),

                                    storage_usage:
                                        Number(
                                            monitoring.storage_percent
                                        ),

                                    network_usage:
                                        Number(
                                            monitoring.network_usage
                                        ),

                                    monitoring_status:
                                        monitoring.health_status,

                                    last_monitored:
                                        monitoring.recorded_at,
                                };
                            }

                            catch (monitoringError) {

                                console.error(
                                    `Monitoring error for resource ${resource.resource_id}:`,
                                    monitoringError
                                );

                                return {

                                    ...resource,

                                    cpu_usage: null,
                                    memory_usage: null,
                                    storage_usage: null,

                                    monitoring_status:
                                        "NOT_MONITORED",

                                    last_monitored:
                                        null,
                                };
                            }
                        }
                    )
                );

            setResources(
                resourcesWithMonitoring
            );

        }

        catch (err) {

            console.error(
                "Monitoring fetch error:",
                err
            );

            setError(
                err.message ||
                "Failed to load monitoring data"
            );
        }

        finally {

            setLoading(false);
        }
    };

    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {

        fetchMonitoringData();

    }, []);

    /* =========================================================
       REFRESH
    ========================================================= */

    const handleRefresh = async () => {

        setRefreshing(true);

        await fetchMonitoringData();

        setRefreshing(false);
    };

    /* =========================================================
       FORMAT LAST MONITORED TIME
    ========================================================= */

    const formatLastMonitored = (date) => {

        if (!date) {
            return "Not monitored";
        }

        const monitoredDate =
            new Date(date);

        const now = new Date();

        const difference =
            Math.floor(
                (
                    now.getTime() -
                    monitoredDate.getTime()
                ) / 1000
            );

        if (difference < 60) {
            return "Just now";
        }

        const minutes =
            Math.floor(
                difference / 60
            );

        if (minutes < 60) {

            return `${minutes} min ago`;
        }

        const hours =
            Math.floor(
                minutes / 60
            );

        if (hours < 24) {

            return `${hours} hr ago`;
        }

        const days =
            Math.floor(
                hours / 24
            );

        return `${days} day${
            days > 1 ? "s" : ""
        } ago`;
    };

    /* =========================================================
       STATISTICS
    ========================================================= */

    const totalResources =
        resources.length;

    const healthyResources =
        resources.filter(
            (resource) =>
                resource.monitoring_status ===
                "HEALTHY"
        ).length;

    const warningResources =
        resources.filter(
            (resource) =>
                resource.monitoring_status ===
                "WARNING"
        ).length;

    const criticalResources =
        resources.filter(
            (resource) =>
                resource.monitoring_status ===
                "CRITICAL"
        ).length;

    /* =========================================================
       FILTER RESOURCES
    ========================================================= */

    const filteredResources = useMemo(() => {

        return resources.filter(
            (resource) => {

                const resourceName =
                    String(
                        resource.resource_name ||
                        ""
                    );

                const resourceId =
                    String(
                        resource.resource_id ||
                        ""
                    );

                const provider =
                    String(
                        resource.provider_name ||
                        ""
                    );

                const status =
                    String(
                        resource.monitoring_status ||
                        ""
                    );

                const search =
                    String(
                        searchTerm || ""
                    ).toLowerCase();

                const selectedProvider =
                    String(
                        providerFilter || ""
                    ).toLowerCase();

                const selectedStatus =
                    String(
                        statusFilter || ""
                    ).toLowerCase();

                const matchesSearch =
                    resourceName
                        .toLowerCase()
                        .includes(search) ||

                    resourceId
                        .includes(search);

                const matchesProvider =
                    providerFilter === "ALL" ||

                    provider
                        .toLowerCase() ===
                    selectedProvider;

                const matchesStatus =
                    statusFilter === "ALL" ||

                    status
                        .toLowerCase() ===
                    selectedStatus;

                return (
                    matchesSearch &&
                    matchesProvider &&
                    matchesStatus
                );
            }
        );

    }, [
        resources,
        searchTerm,
        providerFilter,
        statusFilter,
    ]);

    /* =========================================================
       STATUS ICON
    ========================================================= */

    const getStatusIcon = (status) => {

        switch (status) {

            case "HEALTHY":

                return (
                    <CheckCircle2
                        size={14}
                    />
                );

            case "WARNING":

                return (
                    <AlertTriangle
                        size={14}
                    />
                );

            case "CRITICAL":

                return (
                    <CircleAlert
                        size={14}
                    />
                );

            default:

                return (
                    <Activity
                        size={14}
                    />
                );
        }
    };

    /* =========================================================
       UTILIZATION CLASS
    ========================================================= */

    const getUtilizationClass = (
        value
    ) => {

        if (
            value === null ||
            value === undefined ||
            Number.isNaN(Number(value))
        ) {
            return "";
        }

        if (Number(value) >= 85) {

            return "utilization-critical";
        }

        if (Number(value) >= 70) {

            return "utilization-warning";
        }

        return "utilization-normal";
    };

    /* =========================================================
       PROVIDER
    ========================================================= */

    const getProviderShortName =
        (provider) => {

            return provider || "Unknown";
        };

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <div className="monitoring-page">

                <div
                    className="monitoring-loading"
                >

                    <RefreshCw
                        size={28}
                        className="refresh-spinning"
                    />

                    <p>
                        Loading monitoring data...
                    </p>

                </div>

            </div>
        );
    }

    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="monitoring-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="monitoring-header">

                <div className="monitoring-title-row">

                    <div className="monitoring-title-icon">

                        <Activity size={20} />

                    </div>

                    <div>

                        <h1>
                            Monitoring
                        </h1>

                        <p>
                            Monitor cloud resource
                            health and utilization
                        </p>

                    </div>

                </div>

                <button
                    className="monitoring-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={15}
                        className={
                            refreshing
                                ? "refresh-spinning"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

                <div className="monitoring-error">

                    <AlertTriangle
                        size={16}
                    />

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* =====================================================
                STATISTICS
            ===================================================== */}

            <div className="monitoring-stat-grid">

                {/* TOTAL */}

                <button
                    className={`monitoring-stat-card ${
                        statusFilter === "ALL"
                            ? "monitoring-stat-active"
                            : ""
                    }`}
                    onClick={() =>
                        setStatusFilter("ALL")
                    }
                >

                    <div className="monitoring-stat-icon total">

                        <Server size={18} />

                    </div>

                    <div className="monitoring-stat-content">

                        <span>
                            Total Resources
                        </span>

                        <strong>
                            {totalResources}
                        </strong>

                    </div>

                </button>


                {/* HEALTHY */}

                <button
                    className={`monitoring-stat-card ${
                        statusFilter === "HEALTHY"
                            ? "monitoring-stat-active"
                            : ""
                    }`}
                    onClick={() =>
                        setStatusFilter("HEALTHY")
                    }
                >

                    <div className="monitoring-stat-icon healthy">

                        <CheckCircle2
                            size={18}
                        />

                    </div>

                    <div className="monitoring-stat-content">

                        <span>
                            Healthy
                        </span>

                        <strong>
                            {healthyResources}
                        </strong>

                    </div>

                </button>


                {/* WARNING */}

                <button
                    className={`monitoring-stat-card ${
                        statusFilter === "WARNING"
                            ? "monitoring-stat-active"
                            : ""
                    }`}
                    onClick={() =>
                        setStatusFilter("WARNING")
                    }
                >

                    <div className="monitoring-stat-icon warning">

                        <AlertTriangle
                            size={18}
                        />

                    </div>

                    <div className="monitoring-stat-content">

                        <span>
                            Warning
                        </span>

                        <strong>
                            {warningResources}
                        </strong>

                    </div>

                </button>


                {/* CRITICAL */}

                <button
                    className={`monitoring-stat-card ${
                        statusFilter === "CRITICAL"
                            ? "monitoring-stat-active"
                            : ""
                    }`}
                    onClick={() =>
                        setStatusFilter("CRITICAL")
                    }
                >

                    <div className="monitoring-stat-icon critical">

                        <CircleAlert
                            size={18}
                        />

                    </div>

                    <div className="monitoring-stat-content">

                        <span>
                            Critical
                        </span>

                        <strong>
                            {criticalResources}
                        </strong>

                    </div>

                </button>

            </div>


            {/* =====================================================
                MONITORING SECTION
            ===================================================== */}

            <div className="monitoring-section">

                {/* SECTION HEADER */}

                <div className="monitoring-section-header">

                    <div>

                        <h2>
                            Resource Monitoring
                        </h2>

                        <p>
                            View current utilization and
                            health status of allocated
                            cloud resources.
                        </p>

                    </div>

                    <div className="monitoring-result-count">

                        {filteredResources.length} resources

                    </div>

                </div>


                {/* =================================================
                    FILTERS
                ================================================= */}

                <div className="monitoring-filters">

                    {/* SEARCH */}

                    <div className="monitoring-search">

                        <Search size={16} />

                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* PROVIDER */}

                    <select
                        value={providerFilter}
                        onChange={(event) =>
                            setProviderFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Providers
                        </option>

                        <option value="AWS">
                            AWS
                        </option>

                        <option value="Microsoft Azure">
                            Microsoft Azure
                        </option>

                        <option value="Google Cloud">
                            Google Cloud
                        </option>

                    </select>


                    {/* STATUS */}

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        <option value="HEALTHY">
                            Healthy
                        </option>

                        <option value="WARNING">
                            Warning
                        </option>

                        <option value="CRITICAL">
                            Critical
                        </option>

                        <option value="NOT_MONITORED">
                            Not Monitored
                        </option>

                    </select>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="monitoring-table-wrapper">

                    <table className="monitoring-table">

                        <thead>

                            <tr>

                                <th>
                                    Resource
                                </th>

                                <th>
                                    Provider
                                </th>

                                <th>
                                    Type
                                </th>

                                <th>
                                    CPU Usage
                                </th>

                                <th>
                                    Memory
                                </th>

                                <th>
                                    Storage
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Last Monitored
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredResources.length > 0 ? (

                                filteredResources.map(
                                    (resource) => (

                                        <tr
                                            key={
                                                resource.resource_id
                                            }
                                        >

                                            {/* RESOURCE */}

                                            <td>

                                                <div className="monitoring-resource-cell">

                                                    <div className="monitoring-resource-icon">

                                                        <Server
                                                            size={16}
                                                        />

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                resource.resource_name
                                                            }
                                                        </strong>

                                                        <span>
                                                            Resource ID #
                                                            {
                                                                resource.resource_id
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* PROVIDER */}

                                            <td>

                                                <span className="monitoring-provider">

                                                    {
                                                        getProviderShortName(
                                                            resource.provider_name
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            {/* TYPE */}

                                            <td>

                                                <span className="monitoring-type">

                                                    {
                                                        resource.type_name
                                                    }

                                                </span>

                                            </td>


                                            {/* CPU */}

                                            <td>

                                                {resource.cpu_usage !==
                                                null ? (

                                                    <div className="utilization-cell">

                                                        <div className="utilization-value">

                                                            <Cpu
                                                                size={13}
                                                            />

                                                            <span
                                                                className={getUtilizationClass(
                                                                    resource.cpu_usage
                                                                )}
                                                            >

                                                                {
                                                                    resource.cpu_usage
                                                                }%

                                                            </span>

                                                        </div>

                                                        <div className="utilization-bar">

                                                            <div
                                                                className={`utilization-fill ${getUtilizationClass(
                                                                    resource.cpu_usage
                                                                )}`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        Number(
                                                                            resource.cpu_usage
                                                                        ),
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            />

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <span className="not-monitored-value">
                                                        —
                                                    </span>

                                                )}

                                            </td>


                                            {/* MEMORY */}

                                            <td>

                                                {resource.memory_usage !==
                                                null ? (

                                                    <div className="utilization-cell">

                                                        <div className="utilization-value">

                                                            <MemoryStick
                                                                size={13}
                                                            />

                                                            <span
                                                                className={getUtilizationClass(
                                                                    resource.memory_usage
                                                                )}
                                                            >

                                                                {
                                                                    resource.memory_usage
                                                                }%

                                                            </span>

                                                        </div>

                                                        <div className="utilization-bar">

                                                            <div
                                                                className={`utilization-fill ${getUtilizationClass(
                                                                    resource.memory_usage
                                                                )}`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        Number(
                                                                            resource.memory_usage
                                                                        ),
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            />

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <span className="not-monitored-value">
                                                        —
                                                    </span>

                                                )}

                                            </td>


                                            {/* STORAGE */}

                                            <td>

                                                {resource.storage_usage !==
                                                null ? (

                                                    <div className="utilization-cell">

                                                        <div className="utilization-value">

                                                            <HardDrive
                                                                size={13}
                                                            />

                                                            <span
                                                                className={getUtilizationClass(
                                                                    resource.storage_usage
                                                                )}
                                                            >

                                                                {
                                                                    resource.storage_usage
                                                                }%

                                                            </span>

                                                        </div>

                                                        <div className="utilization-bar">

                                                            <div
                                                                className={`utilization-fill ${getUtilizationClass(
                                                                    resource.storage_usage
                                                                )}`}
                                                                style={{
                                                                    width: `${Math.min(
                                                                        Number(
                                                                            resource.storage_usage
                                                                        ),
                                                                        100
                                                                    )}%`,
                                                                }}
                                                            />

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <span className="not-monitored-value">
                                                        —
                                                    </span>

                                                )}

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`monitoring-status monitoring-status-${String(
                                                        resource.monitoring_status ||
                                                        ""
                                                    ).toLowerCase()}`}
                                                >

                                                    {
                                                        getStatusIcon(
                                                            resource.monitoring_status
                                                        )
                                                    }

                                                    {resource.monitoring_status ===
                                                    "NOT_MONITORED"
                                                        ? "Not Monitored"
                                                        : resource.monitoring_status}

                                                </span>

                                            </td>


                                            {/* LAST MONITORED */}

                                            <td>

                                                <span className="monitoring-last-monitored">

                                                    {
                                                        formatLastMonitored(
                                                            resource.last_monitored
                                                        )
                                                    }

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="monitoring-empty"
                                    >

                                        <div>

                                            <Search
                                                size={28}
                                            />

                                            <strong>
                                                No resources found
                                            </strong>

                                            <span>
                                                Try changing
                                                your search
                                                or filter.
                                            </span>

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default Monitoring;