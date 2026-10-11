import "../style/resources.css";
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    Cloud,
    Server,
    HardDrive,
    Database,
    Box,
    Code2,
    Eye,
    X,
    Cpu,
    MemoryStick,
    CalendarDays,
    User,
    MapPin,
    Activity,
    FileText
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


const Resources = () => {

    const { user } = useAuth();

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [providerFilter, setProviderFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // NEW: statistic card filter
   const [activeCardFilter, setActiveCardFilter] = useState("ALL");

const [showProviderBreakdown, setShowProviderBreakdown] = useState(false);

const [selectedResource, setSelectedResource] = useState(null);


    /* =========================================================
       FETCH RESOURCES
    ========================================================= */

    const fetchResources = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

          const response = await api.get("/resources");

console.log(
    "RESOURCES API RESPONSE:",
    response.data
);

console.log(
    "LATEST RESOURCE EXPIRY:",
    response.data?.[0]?.expiry_date
);

setResources(
    Array.isArray(response.data)
        ? response.data
        : []
);  

        } catch (error) {

            console.error(
                "Resources error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load resources."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    useEffect(() => {

        fetchResources();

    }, []);


    /* =========================================================
       STATISTICS
    ========================================================= */

    const totalResources = resources.length;

    const activeResources =
        resources.filter(
            resource =>
                resource.resource_status === "ACTIVE"
        ).length;

    const expiredResources =
        resources.filter(
            resource =>
                resource.resource_status === "EXPIRED"
        ).length;

    const uniqueProviders = 3;

const providerCounts = {
    "AWS": resources.filter(
        resource => resource.provider_name === "AWS"
    ).length,

    "Microsoft Azure": resources.filter(
        resource => resource.provider_name === "Microsoft Azure"
    ).length,

    "Google Cloud": resources.filter(
        resource => resource.provider_name === "Google Cloud"
    ).length
};
    /* =========================================================
       FILTER OPTIONS
    ========================================================= */

    const resourceTypes = [
        "VM",
        "STORAGE",
        "DATABASE",
        "CONTAINER",
        "FUNCTION"
    ];

    const providers = [
        "AWS",
        "Microsoft Azure",
        "Google Cloud"
    ];

    const statuses = [
        "ACTIVE",
        "INACTIVE",
        "EXPIRED"
    ];


    /* =========================================================
       STATISTICS CARD FILTER
    ========================================================= */

    const handleCardFilter = (filter) => {

    setSearchTerm("");
    setTypeFilter("ALL");
    setProviderFilter("ALL");
    setStatusFilter("ALL");

    setActiveCardFilter(filter);

    if (filter === "ACTIVE") {
        setStatusFilter("ACTIVE");
        setShowProviderBreakdown(false);
    }

    if (filter === "EXPIRED") {
        setStatusFilter("EXPIRED");
        setShowProviderBreakdown(false);
    }

    if (filter === "ALL") {
        setShowProviderBreakdown(false);
    }

    if (filter === "PROVIDERS") {
        setShowProviderBreakdown(true);
    }
};

    /* =========================================================
       FILTER RESOURCES
    ========================================================= */

    const filteredResources = useMemo(() => {

        return resources.filter(resource => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                !search ||
                resource.cloud_identifier
                    ?.toLowerCase()
                    .includes(search) ||
                resource.resource_name
                    ?.toLowerCase()
                    .includes(search) ||
                resource.full_name
                    ?.toLowerCase()
                    .includes(search) ||
                resource.username
                    ?.toLowerCase()
                    .includes(search) ||
                String(resource.resource_id)
                    .includes(search);


            const matchesType =
                typeFilter === "ALL" ||
                resource.type_name === typeFilter;


            const matchesProvider =
                providerFilter === "ALL" ||
                resource.provider_name === providerFilter;


            const matchesStatus =
                statusFilter === "ALL" ||
                resource.resource_status === statusFilter;


            return (
                matchesSearch &&
                matchesType &&
                matchesProvider &&
                matchesStatus
            );

        });

    }, [
        resources,
        searchTerm,
        typeFilter,
        providerFilter,
        statusFilter
    ]);


    /* =========================================================
       FORMAT DATE
    ========================================================= */
     const formatDate = (date) => {

    if (!date) {
        return "—";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
};
    /* =========================================================
       RESOURCE TYPE ICON
    ========================================================= */

    const getResourceIcon = (type) => {

        switch (type) {

            case "VM":
                return <Server size={19} />;

            case "STORAGE":
                return <HardDrive size={19} />;

            case "DATABASE":
                return <Database size={19} />;

            case "CONTAINER":
                return <Box size={19} />;

            case "FUNCTION":
                return <Code2 size={19} />;

            default:
                return <Cloud size={19} />;

        }

    };


    /* =========================================================
       RESOURCE TYPE CLASS
    ========================================================= */

    const getResourceTypeClass = (type) => {

        switch (type) {

            case "VM":
                return "type-vm";

            case "STORAGE":
                return "type-storage";

            case "DATABASE":
                return "type-database";

            case "CONTAINER":
                return "type-container";

            case "FUNCTION":
                return "type-function";

            default:
                return "type-default";

        }

    };


    /* =========================================================
       STATUS CLASS
    ========================================================= */

    const getStatusClass = (status) => {

        switch (status) {

            case "ACTIVE":
                return "status-active";

            case "EXPIRED":
                return "status-expired";

            case "INACTIVE":
                return "status-inactive";

            default:
                return "status-default";

        }

    };


    /* =========================================================
       CLEAR FILTERS
    ========================================================= */

    const clearFilters = () => {

        setSearchTerm("");
        setTypeFilter("ALL");
        setProviderFilter("ALL");
        setStatusFilter("ALL");
        setActiveCardFilter("ALL");

    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="resources-page">


            {/* PAGE HEADER */}

            <div className="resources-header">

                <div>

                    <div className="resources-eyebrow">
                        CLOUD INFRASTRUCTURE
                    </div>

                    <h1>
                        Cloud Resources
                    </h1>

                    <p>
                        View and manage allocated cloud
                        infrastructure resources.
                    </p>

                </div>


                <button
                    className="resources-refresh-button"
                    onClick={() =>
                        fetchResources(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "refresh-spinning"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="resources-error">

                    <span>
                        ⚠
                    </span>

                    <div>

                        <strong>
                            Unable to load resources
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
               STATISTICS
            ================================================= */}

            <div className="resource-stats-grid">


                {/* TOTAL */}

                <div
                    className={`resource-stat-card ${
                        activeCardFilter === "ALL"
                            ? "stat-card-active"
                            : ""
                    }`}
                    onClick={() =>
                        handleCardFilter("ALL")
                    }
                >

                    <div className="resource-stat-icon blue">
                        <Cloud size={21} />
                    </div>

                    <div>

                        <span>
                            Total Resources
                        </span>

                        <strong>
                            {loading
                                ? "—"
                                : totalResources
                            }
                        </strong>

                        <small>
                            Allocated resources
                        </small>

                    </div>

                </div>


                {/* ACTIVE */}

                <div
                    className={`resource-stat-card ${
                        activeCardFilter === "ACTIVE"
                            ? "stat-card-active"
                            : ""
                    }`}
                    onClick={() =>
                        handleCardFilter("ACTIVE")
                    }
                >

                    <div className="resource-stat-icon green">
                        <Activity size={21} />
                    </div>

                    <div>

                        <span>
                            Active Resources
                        </span>

                        <strong>
                            {loading
                                ? "—"
                                : activeResources
                            }
                        </strong>

                        <small>
                            Currently active
                        </small>

                    </div>

                </div>


                {/* EXPIRED */}

                <div
                    className={`resource-stat-card ${
                        activeCardFilter === "EXPIRED"
                            ? "stat-card-active"
                            : ""
                    }`}
                    onClick={() =>
                        handleCardFilter("EXPIRED")
                    }
                >

                    <div className="resource-stat-icon orange">
                        <CalendarDays size={21} />
                    </div>

                    <div>

                        <span>
                            Expired Resources
                        </span>

                        <strong>
                            {loading
                                ? "—"
                                : expiredResources
                            }
                        </strong>

                        <small>
                            Past expiry date
                        </small>

                    </div>

                </div>

{/* PROVIDERS */}

<div
    className={`resource-stat-card ${
        activeCardFilter === "PROVIDERS"
            ? "stat-card-active"
            : ""
    }`}
    onClick={() => handleCardFilter("PROVIDERS")}
>
    <div className="resource-stat-icon purple">
        <Cloud size={21} />
    </div>

    <div className="resource-stat-content">
        <span>Cloud Providers</span>

        <strong>
            {loading ? "—" : uniqueProviders}
        </strong>

        <small>Supported providers</small>
    </div>
</div>
</div>
                



{/* PROVIDER BREAKDOWN */}

{showProviderBreakdown && (

    <div className="provider-breakdown">

        <div className="provider-breakdown-header">
            <div>
                <h3>Cloud Provider Distribution</h3>
                <p>
                    Select a provider to view its allocated resources.
                </p>
            </div>
        </div>

        <div className="provider-breakdown-grid">

            {providers.map(provider => (

                <button
                    key={provider}
                    className={`provider-breakdown-card ${
                        providerFilter === provider
                            ? "provider-breakdown-active"
                            : ""
                    }`}
                    onClick={() => {

                        setProviderFilter(provider);
                        setTypeFilter("ALL");
                        setStatusFilter("ALL");
                        setSearchTerm("");

                    }}
                >

                    <div className="provider-breakdown-icon">
                        <Cloud size={20} />
                    </div>

                    <div className="provider-breakdown-info">

                        <strong>
                            {provider}
                        </strong>

                        <span>
                            {providerCounts[provider]} resource
                            {providerCounts[provider] !== 1
                                ? "s"
                                : ""
                            }
                        </span>

                    </div>

                </button>

            ))}

        </div>

    </div>

)}



            {/* RESOURCE TABLE CARD */}

            <div className="resources-content-card">


                {/* TABLE HEADER */}

                <div className="resources-content-header">

                    <div>

                        <h2>
                            Allocated Resources
                        </h2>

                        <p>
                            {filteredResources.length}{" "}
                            resource
                            {filteredResources.length !== 1
                                ? "s"
                                : ""
                            }{" "}
                            displayed
                        </p>

                    </div>

                </div>


                {/* FILTER BAR */}

                <div className="resources-filter-bar">


                    {/* SEARCH */}

                    <div className="resource-search">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={searchTerm}
                            onChange={(event) => {

                                setSearchTerm(
                                    event.target.value
                                );

                                setActiveCardFilter("ALL");

                            }}
                        />

                    </div>


                    {/* TYPE */}

                    <select
                        value={typeFilter}
                        onChange={(event) => {

                            setTypeFilter(
                                event.target.value
                            );

                            setActiveCardFilter("ALL");

                        }}
                    >

                        <option value="ALL">
                            All Types
                        </option>

                        {resourceTypes.map(type => (

                            <option
                                key={type}
                                value={type}
                            >
                                {type}
                            </option>

                        ))}

                    </select>


                    {/* PROVIDER */}

                    <select
                        value={providerFilter}
                        onChange={(event) => {

                            setProviderFilter(
                                event.target.value
                            );

                            setActiveCardFilter("ALL");

                        }}
                    >

                        <option value="ALL">
                            All Providers
                        </option>

                        {providers.map(provider => (

                            <option
                                key={provider}
                                value={provider}
                            >
                                {provider}
                            </option>

                        ))}

                    </select>


                    {/* STATUS */}

                    <select
                        value={statusFilter}
                        onChange={(event) => {

                            setStatusFilter(
                                event.target.value
                            );

                            setActiveCardFilter("ALL");

                        }}
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        {statuses.map(status => (

                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>

                        ))}

                    </select>


                    {/* CLEAR */}

                    {(searchTerm ||
                        typeFilter !== "ALL" ||
                        providerFilter !== "ALL" ||
                        statusFilter !== "ALL") && (

                        <button
                            className="clear-resource-filters"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>

                    )}

                </div>


                {/* LOADING */}

                {loading && (

                    <div className="resources-loading">

                        <div className="resource-spinner"></div>

                        <p>
                            Loading cloud resources...
                        </p>

                    </div>

                )}


                {/* EMPTY */}

                {!loading &&
                    !error &&
                    filteredResources.length === 0 && (

                        <div className="resources-empty">

                            <div className="empty-resource-icon">
                                <Cloud size={30} />
                            </div>

                            <h3>
                                No resources found
                            </h3>

                            <p>
                                Try changing your search
                                or filter criteria.
                            </p>

                            <button
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>

                        </div>

                    )}


                {/* TABLE */}

                {!loading &&
                    filteredResources.length > 0 && (

                        <div className="resources-table-wrapper">

                            <table className="resources-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Resource
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Provider
                                        </th>

                                        <th>
                                            Requested By
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Allocation
                                        </th>

                                        <th>
                                            Expiry
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredResources.map(
                                        resource => (

                                            <tr
                                                key={
                                                    resource.resource_id
                                                }
                                            >

                                                <td>

                                                    <div className="resource-name-cell">

                                                        <div className="resource-main-icon">

                                                            {getResourceIcon(
                                                                resource.type_name
                                                            )}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {resource.resource_name}
                                                            </strong>

                                                            <span>
                                                                #
                                                                {resource.resource_id}
                                                                {" • "}
                                                                {resource.cloud_identifier}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`resource-type-badge ${getResourceTypeClass(
                                                            resource.type_name
                                                        )}`}
                                                    >

                                                        {getResourceIcon(
                                                            resource.type_name
                                                        )}

                                                        {resource.type_name}

                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="provider-cell">

                                                        <strong>
                                                            {resource.provider_name}
                                                        </strong>

                                                        <span>
                                                            <MapPin size={12} />
                                                            {resource.region}
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>

                                                    <div className="user-cell">

                                                        <div className="user-avatar">

                                                            {(resource.full_name ||
                                                                resource.username ||
                                                                "U")
                                                                .charAt(0)
                                                                .toUpperCase()}

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {resource.full_name ||
                                                                    resource.username}
                                                            </strong>

                                                            <span>
                                                                @{resource.username}
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`resource-status-badge ${getStatusClass(
                                                            resource.resource_status
                                                        )}`}
                                                    >

                                                        <span></span>

                                                        {resource.resource_status}

                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="date-cell">

                                                        {formatDate(
                                                            resource.allocation_date
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="date-cell">

                                                        {formatDate(
                                                            resource.expiry_date
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <button
                                                        className="resource-view-button"
                                                        onClick={() =>
                                                            setSelectedResource(
                                                                resource
                                                            )
                                                        }
                                                    >

                                                        <Eye size={16} />

                                                        View

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

            </div>


            {/* RESOURCE DETAILS MODAL */}

            {selectedResource && (

                <div
                    className="resource-modal-overlay"
                    onClick={() =>
                        setSelectedResource(null)
                    }
                >

                    <div
                        className="resource-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="resource-modal-header">

                            <div>

                                <span className="modal-eyebrow">
                                    RESOURCE DETAILS
                                </span>

                                <h2>
                                    {selectedResource.resource_name}
                                </h2>

                                <p>
                                    #{selectedResource.resource_id}
                                    {" • "}
                                    {selectedResource.cloud_identifier}
                                </p>

                            </div>


                            <button
                                className="modal-close-button"
                                onClick={() =>
                                    setSelectedResource(null)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <div className="modal-status-row">

                            <span
                                className={`resource-status-badge ${getStatusClass(
                                    selectedResource.resource_status
                                )}`}
                            >

                                <span></span>

                                {selectedResource.resource_status}

                            </span>

                            <span>
                                {selectedResource.provider_name}
                            </span>

                        </div>


                        <div className="modal-section">

                            <h3>
                                <Cloud size={17} />
                                Resource Information
                            </h3>


                            <div className="modal-info-grid">

                                <div>

                                    <span>
                                        Resource ID
                                    </span>

                                    <strong>
                                        #{selectedResource.resource_id}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Resource Type
                                    </span>

                                    <strong>
                                        {selectedResource.type_name}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Cloud Provider
                                    </span>

                                    <strong>
                                        {selectedResource.provider_name}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Region
                                    </span>

                                    <strong>
                                        {selectedResource.region}
                                    </strong>

                                </div>


                                <div className="modal-full-width">

                                    <span>
                                        Cloud Identifier
                                    </span>

                                    <strong className="identifier-text">
                                        {selectedResource.cloud_identifier}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="modal-section">

                            <h3>
                                <Activity size={17} />
                                Resource Capacity
                            </h3>


                            <div className="capacity-grid">

                                <div className="capacity-card">

                                    <Cpu size={19} />

                                    <span>
                                        CPU Cores
                                    </span>

                                    <strong>
                                        {selectedResource.cpu_cores}
                                    </strong>

                                </div>


                                <div className="capacity-card">

                                    <MemoryStick size={19} />

                                    <span>
                                        Memory
                                    </span>

                                    <strong>
                                        {selectedResource.memory_gb} GB
                                    </strong>

                                </div>


                                <div className="capacity-card">

                                    <HardDrive size={19} />

                                    <span>
                                        Storage
                                    </span>

                                    <strong>
                                        {selectedResource.storage_gb} GB
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="modal-section">

                            <h3>
                                <FileText size={17} />
                                Request Information
                            </h3>


                            <div className="modal-info-grid">

                                <div>

                                    <span>
                                        Request ID
                                    </span>

                                    <strong>
                                        #{selectedResource.request_id}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Request Status
                                    </span>

                                    <strong>
                                        {selectedResource.request_status}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Requested By
                                    </span>

                                    <strong>
                                        {selectedResource.full_name}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Requested On
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedResource.requested_at
                                        )}
                                    </strong>

                                </div>


                                <div className="modal-full-width">

                                    <span>
                                        Justification
                                    </span>

                                    <strong className="justification-text">
                                        {selectedResource.justification ||
                                            "No justification provided."}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="modal-section">

                            <h3>
                                <CalendarDays size={17} />
                                Allocation Information
                            </h3>


                            <div className="allocation-dates">

                                <div>

                                    <span>
                                        Allocation Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedResource.allocation_date
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Expiry Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedResource.expiry_date
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Reviewed On
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedResource.reviewed_at
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="modal-user">

                            <div className="modal-user-icon">
                                <User size={18} />
                            </div>

                            <div>

                                <span>
                                    Resource Owner
                                </span>

                                <strong>
                                    {selectedResource.full_name}
                                </strong>

                            </div>

                        </div>


                    </div>

                </div>

            )}

        </div>

    );

};


export default Resources;