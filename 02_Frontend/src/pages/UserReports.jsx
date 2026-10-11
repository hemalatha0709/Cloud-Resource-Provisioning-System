
import "../style/reports.css";
import { useEffect, useState } from "react";

import {
    BarChart3,
    CheckCircle2,
    Clock3,
    FileText,
    RefreshCw,
    Server,
    Activity,
    AlertTriangle,
    CircleAlert,
    XCircle,
    Database,
    Cloud,
    Search,
    Filter,
    CalendarDays,
} from "lucide-react";

import api from "../services/api";


const UserReports = () => {

    const [statistics, setStatistics] = useState(null);
    const [requestDetails, setRequestDetails] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(true);

    const [error, setError] = useState("");
    const [detailsError, setDetailsError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [providerFilter, setProviderFilter] = useState("ALL");


    /* =====================================================
       FETCH USER REPORT STATISTICS
       /dashboard is role-aware
       Cloud User gets ONLY their own statistics
    ===================================================== */

    const fetchReports = async () => {

        try {

            setError("");

            const response =
                await api.get("/dashboard");

            /*
             * Depending on your dashboard response,
             * statistics may be directly available or
             * inside response.data.statistics.
             */

            setStatistics(
                response.data.statistics ||
                response.data
            );

        } catch (err) {

            console.error(
                "My Reports error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load report statistics."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    /* =====================================================
       FETCH USER REQUEST DETAILS
       /requests/my returns ONLY logged-in user's requests
    ===================================================== */

    const fetchRequestDetails = async () => {

        try {

            setDetailsError("");
            setDetailsLoading(true);

            const response =
                await api.get("/requests/my");


            /*
             * IMPORTANT:
             *
             * /requests/my returns an ARRAY directly:
             *
             * [
             *   {
             *      request_id,
             *      resource_name,
             *      type_name,
             *      provider_name,
             *      ...
             *   }
             * ]
             */


            const requests =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.requests || [];


            /*
             * Normalize field names so that the
             * Admin Reports UI can be reused exactly.
             */

            const formattedRequests =
                requests.map((request) => ({

                    ...request,

                    resource_type:
                        request.resource_type ||
                        request.type_name ||
                        request.type ||
                        "—",

                    provider:
                        request.provider ||
                        request.provider_name ||
                        "—",

                    status:
                        request.status ||
                        "—",

                    reviewed_by:
                        request.reviewed_by ||
                        null,

                    reviewed_at:
                        request.reviewed_at ||
                        null

                }));


            console.log(
                "My Reports - Request Details:",
                formattedRequests
            );


            setRequestDetails(
                formattedRequests
            );

        } catch (err) {

            console.error(
                "My Request Details error:",
                err
            );

            setDetailsError(
                err.response?.data?.message ||
                "Unable to load request details."
            );

            setRequestDetails([]);

        } finally {

            setDetailsLoading(false);

        }
    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        fetchReports();
        fetchRequestDetails();

    }, []);


    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = async () => {

        setRefreshing(true);

        await Promise.all([
            fetchReports(),
            fetchRequestDetails()
        ]);

    };


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    /* =====================================================
       FORMAT DATE + TIME
    ===================================================== */

    const formatDateTime = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    /* =====================================================
       STATUS BADGE
    ===================================================== */

    const getStatusClass = (status) => {

        switch (status) {

            case "APPROVED":
                return "approved";

            case "PENDING":
                return "pending";

            case "REJECTED":
                return "rejected";

            default:
                return "";

        }

    };


    /* =====================================================
       FILTER REQUEST DETAILS
    ===================================================== */

    const filteredRequests =
        requestDetails.filter((request) => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();


            const matchesSearch =
                !search ||

                String(
                    request.request_id || ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    request.resource_name || ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    request.resource_type || ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    request.provider || ""
                )
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                statusFilter === "ALL" ||
                String(
                    request.status || ""
                ).toUpperCase() ===
                statusFilter;


            const matchesType =
                typeFilter === "ALL" ||
                request.resource_type ===
                typeFilter;


            const matchesProvider =
                providerFilter === "ALL" ||
                request.provider ===
                providerFilter;


            return (
                matchesSearch &&
                matchesStatus &&
                matchesType &&
                matchesProvider
            );

        });


    /* =====================================================
       FILTER OPTIONS
    ===================================================== */

    const resourceTypes = [
        ...new Set(
            requestDetails
                .map(
                    (item) =>
                        item.resource_type
                )
                .filter(
                    (value) =>
                        value &&
                        value !== "—"
                )
        )
    ];


    const providers = [
        ...new Set(
            requestDetails
                .map(
                    (item) =>
                        item.provider
                )
                .filter(
                    (value) =>
                        value &&
                        value !== "—"
                )
        )
    ];


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (

            <div className="reports-page">

                <div className="reports-loading">

                    <RefreshCw
                        size={24}
                        className="reports-loading-icon"
                    />

                    <span>
                        Loading reports...
                    </span>

                </div>

            </div>

        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error) {

        return (

            <div className="reports-page">

                <div className="reports-error">

                    <CircleAlert size={22} />

                    <div>

                        <strong>
                            Unable to load reports
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        onClick={fetchReports}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    /* =====================================================
       STATISTICS
    ===================================================== */

    const requests =
        statistics?.requests || {};

    const resources =
        statistics?.resources || {};

    const monitoring =
        statistics?.monitoring || {};


    const totalRequests =
        Number(
            requests.total_requests || 0
        );


    const approvedRequests =
        Number(
            requests.approved_requests || 0
        );


    const pendingRequests =
        Number(
            requests.pending_requests || 0
        );


    const rejectedRequests =
        Number(
            requests.rejected_requests || 0
        );


    const totalResources =
        Number(
            resources.total_resources || 0
        );


    const activeResources =
        Number(
            resources.active_resources || 0
        );


    const expiredResources =
        Number(
            resources.expired_resources || 0
        );


    const totalMonitoring =
        Number(
            monitoring.total_monitored_resources || 0
        );


    const healthyMonitoring =
        Number(
            monitoring.healthy_resources || 0
        );


    const warningMonitoring =
        Number(
            monitoring.warning_resources || 0
        );


    const criticalMonitoring =
        Number(
            monitoring.critical_resources || 0
        );


    /* =====================================================
       PERCENTAGE
    ===================================================== */

    const getPercentage = (
        value,
        total
    ) => {

        if (!total) {
            return 0;
        }

        return Math.round(
            (value / total) * 100
        );

    };


    /* =====================================================
       UI
    ===================================================== */

    return (

        <div className="reports-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="reports-header">

                <div className="reports-title-row">

                    <div className="reports-title-icon">

                        <BarChart3 size={20} />

                    </div>

                    <div>

                        <h1>
                            My Reports
                        </h1>

                        <p>
                            Overview of your cloud requests,
                            resources, and monitoring activity
                        </p>

                    </div>

                </div>


                <button
                    className="reports-refresh-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={15}
                        className={
                            refreshing
                                ? "reports-refresh-spinning"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* =================================================
                REQUEST OVERVIEW
            ================================================= */}

            <section className="reports-section">

                <div className="reports-section-heading">

                    <div>

                        <h2>
                            Request Overview
                        </h2>

                        <p>
                            Summary of your resource requests
                        </p>

                    </div>

                    <FileText size={20} />

                </div>


                <div className="reports-stat-grid">

                    {/* TOTAL */}

                    <div className="reports-stat-card">

                        <div className="reports-stat-icon total">

                            <FileText size={18} />

                        </div>

                        <div>

                            <span>
                                Total Requests
                            </span>

                            <strong>
                                {totalRequests}
                            </strong>

                        </div>

                    </div>


                    {/* APPROVED */}

                    <div className="reports-stat-card">

                        <div className="reports-stat-icon approved">

                            <CheckCircle2 size={18} />

                        </div>

                        <div>

                            <span>
                                Approved
                            </span>

                            <strong>
                                {approvedRequests}
                            </strong>

                            <small>
                                {getPercentage(
                                    approvedRequests,
                                    totalRequests
                                )}
                                % of requests
                            </small>

                        </div>

                    </div>


                    {/* PENDING */}

                    <div className="reports-stat-card">

                        <div className="reports-stat-icon pending">

                            <Clock3 size={18} />

                        </div>

                        <div>

                            <span>
                                Pending
                            </span>

                            <strong>
                                {pendingRequests}
                            </strong>

                            <small>
                                {getPercentage(
                                    pendingRequests,
                                    totalRequests
                                )}
                                % of requests
                            </small>

                        </div>

                    </div>


                    {/* REJECTED */}

                    <div className="reports-stat-card">

                        <div className="reports-stat-icon rejected">

                            <XCircle size={18} />

                        </div>

                        <div>

                            <span>
                                Rejected
                            </span>

                            <strong>
                                {rejectedRequests}
                            </strong>

                            <small>
                                {getPercentage(
                                    rejectedRequests,
                                    totalRequests
                                )}
                                % of requests
                            </small>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                REQUEST DISTRIBUTION
            ================================================= */}

            <section className="reports-section">

                <div className="reports-section-heading">

                    <div>

                        <h2>
                            Request Distribution
                        </h2>

                        <p>
                            Current request status breakdown
                        </p>

                    </div>

                    <BarChart3 size={20} />

                </div>


                <div className="reports-distribution-card">

                    {/* APPROVED */}

                    <div className="reports-distribution-row">

                        <div className="reports-distribution-label">

                            <span className="reports-dot approved-dot"></span>

                            <span>
                                Approved
                            </span>

                        </div>


                        <div className="reports-progress">

                            <div
                                className="reports-progress-fill approved-fill"
                                style={{
                                    width: `${getPercentage(
                                        approvedRequests,
                                        totalRequests
                                    )}%`
                                }}
                            />

                        </div>


                        <strong>
                            {approvedRequests}
                        </strong>

                    </div>


                    {/* PENDING */}

                    <div className="reports-distribution-row">

                        <div className="reports-distribution-label">

                            <span className="reports-dot pending-dot"></span>

                            <span>
                                Pending
                            </span>

                        </div>


                        <div className="reports-progress">

                            <div
                                className="reports-progress-fill pending-fill"
                                style={{
                                    width: `${getPercentage(
                                        pendingRequests,
                                        totalRequests
                                    )}%`
                                }}
                            />

                        </div>


                        <strong>
                            {pendingRequests}
                        </strong>

                    </div>


                    {/* REJECTED */}

                    <div className="reports-distribution-row">

                        <div className="reports-distribution-label">

                            <span className="reports-dot rejected-dot"></span>

                            <span>
                                Rejected
                            </span>

                        </div>


                        <div className="reports-progress">

                            <div
                                className="reports-progress-fill rejected-fill"
                                style={{
                                    width: `${getPercentage(
                                        rejectedRequests,
                                        totalRequests
                                    )}%`
                                }}
                            />

                        </div>


                        <strong>
                            {rejectedRequests}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                RESOURCE + MONITORING
            ================================================= */}

            <div className="reports-two-column">

                {/* =================================================
                    RESOURCE OVERVIEW
                ================================================= */}

                <section className="reports-section reports-half">

                    <div className="reports-section-heading">

                        <div>

                            <h2>
                                Resource Overview
                            </h2>

                            <p>
                                Current cloud resource status
                            </p>

                        </div>

                        <Server size={20} />

                    </div>


                    <div className="reports-resource-summary">

                        <div className="reports-resource-main">

                            <div className="reports-resource-icon">

                                <Cloud size={21} />

                            </div>

                            <div>

                                <span>
                                    Total Resources
                                </span>

                                <strong>
                                    {totalResources}
                                </strong>

                            </div>

                        </div>


                        <div className="reports-resource-items">

                            <div>

                                <span>

                                    <CheckCircle2 size={14} />

                                    Active

                                </span>

                                <strong>
                                    {activeResources}
                                </strong>

                            </div>


                            <div>

                                <span>

                                    <XCircle size={14} />

                                    Expired

                                </span>

                                <strong>
                                    {expiredResources}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    MONITORING OVERVIEW
                ================================================= */}

                <section className="reports-section reports-half">

                    <div className="reports-section-heading">

                        <div>

                            <h2>
                                Monitoring Overview
                            </h2>

                            <p>
                                Cloud resource health status
                            </p>

                        </div>

                        <Activity size={20} />

                    </div>


                    <div className="reports-monitoring-summary">

                        <div className="reports-monitoring-total">

                            <div className="reports-monitoring-icon">

                                <Database size={20} />

                            </div>

                            <div>

                                <span>
                                    Monitoring Records
                                </span>

                                <strong>
                                    {totalMonitoring}
                                </strong>

                            </div>

                        </div>


                        <div className="reports-health-grid">

                            <div className="reports-health-item healthy">

                                <CheckCircle2 size={15} />

                                <div>

                                    <span>
                                        Healthy
                                    </span>

                                    <strong>
                                        {healthyMonitoring}
                                    </strong>

                                </div>

                            </div>


                            <div className="reports-health-item warning">

                                <AlertTriangle size={15} />

                                <div>

                                    <span>
                                        Warning
                                    </span>

                                    <strong>
                                        {warningMonitoring}
                                    </strong>

                                </div>

                            </div>


                            <div className="reports-health-item critical">

                                <CircleAlert size={15} />

                                <div>

                                    <span>
                                        Critical
                                    </span>

                                    <strong>
                                        {criticalMonitoring}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>

            </div>


            {/* =================================================
                MY CLOUD SUMMARY
            ================================================= */}

            <section className="reports-summary-card">

                <div className="reports-summary-icon">

                    <BarChart3 size={21} />

                </div>


                <div className="reports-summary-content">

                    <h3>
                        My Cloud Summary
                    </h3>

                    <p>

                        You currently have{" "}

                        <strong>
                            {totalRequests}
                        </strong>{" "}

                        resource request
                        {totalRequests !== 1
                            ? "s"
                            : ""}{" "}

                        and{" "}

                        <strong>
                            {activeResources}
                        </strong>{" "}

                        active cloud resource
                        {activeResources !== 1
                            ? "s"
                            : ""}. Your monitoring records show{" "}

                        <strong>
                            {criticalMonitoring}
                        </strong>{" "}

                        critical condition
                        {criticalMonitoring !== 1
                            ? "s"
                            : ""}.

                    </p>

                </div>

            </section>


            {/* =================================================
                REQUEST DETAILS
            ================================================= */}

            <section className="reports-section reports-details-section">

                <div className="reports-section-heading">

                    <div>

                        <h2>
                            Request Details
                        </h2>

                        <p>
                            Detailed history of your resource requests
                        </p>

                    </div>

                    <FileText size={20} />

                </div>


                {/* =================================================
                    FILTER BAR
                ================================================= */}

                <div className="reports-details-toolbar">

                    {/* SEARCH */}

                    <div className="reports-search-box">

                        <Search size={16} />

                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* STATUS */}

                    <div className="reports-filter">

                        <Filter size={14} />

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="APPROVED">
                                Approved
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="REJECTED">
                                Rejected
                            </option>

                        </select>

                    </div>


                    {/* TYPE */}

                    <div className="reports-filter">

                        <Server size={14} />

                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Types
                            </option>

                            {resourceTypes.map(
                                (type) => (

                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* PROVIDER */}

                    <div className="reports-filter">

                        <Cloud size={14} />

                        <select
                            value={providerFilter}
                            onChange={(e) =>
                                setProviderFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Providers
                            </option>

                            {providers.map(
                                (provider) => (

                                    <option
                                        key={provider}
                                        value={provider}
                                    >
                                        {provider}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                </div>


                {/* =================================================
                    RESULT COUNT
                ================================================= */}

                <div className="reports-results-info">

                    <span>

                        Showing{" "}

                        <strong>
                            {filteredRequests.length}
                        </strong>{" "}

                        of{" "}

                        <strong>
                            {requestDetails.length}
                        </strong>{" "}

                        requests

                    </span>


                    {(searchTerm ||
                        statusFilter !== "ALL" ||
                        typeFilter !== "ALL" ||
                        providerFilter !== "ALL") && (

                        <button
                            className="reports-clear-filters"
                            onClick={() => {

                                setSearchTerm("");
                                setStatusFilter("ALL");
                                setTypeFilter("ALL");
                                setProviderFilter("ALL");

                            }}
                        >
                            Clear filters
                        </button>

                    )}

                </div>


                {/* =================================================
                    REQUEST TABLE
                ================================================= */}

                {detailsLoading ? (

                    <div className="reports-details-loading">

                        <RefreshCw
                            size={20}
                            className="reports-loading-icon"
                        />

                        <span>
                            Loading request details...
                        </span>

                    </div>

                ) : detailsError ? (

                    <div className="reports-details-error">

                        <CircleAlert size={19} />

                        <span>
                            {detailsError}
                        </span>

                        <button
                            onClick={
                                fetchRequestDetails
                            }
                        >
                            Retry
                        </button>

                    </div>

                ) : filteredRequests.length === 0 ? (

                    <div className="reports-details-empty">

                        <FileText size={30} />

                        <strong>
                            No requests found
                        </strong>

                        <span>
                            Try changing your search or filters.
                        </span>

                    </div>

                ) : (

                    <div className="reports-table-wrapper">

                        <table className="reports-details-table">

                            <thead>

                                <tr>

                                    <th>
                                        Request
                                    </th>

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
                                        CPU
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
                                        Requested
                                    </th>

                                    <th>
                                        Reviewed By
                                    </th>

                                    <th>
                                        Reviewed
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredRequests.map(
                                    (request) => (

                                        <tr
                                            key={
                                                request.request_id
                                            }
                                        >

                                            {/* REQUEST ID */}

                                            <td>

                                                <span className="reports-request-id">

                                                    #
                                                    {
                                                        request.request_id
                                                    }

                                                </span>

                                            </td>


                                            {/* RESOURCE */}

                                            <td>

                                                <div className="reports-resource-name">

                                                    <div className="reports-table-icon">

                                                        <Server size={15} />

                                                    </div>

                                                    <span>

                                                        {
                                                            request.resource_name ||
                                                            "Unnamed Resource"
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* TYPE */}

                                            <td>

                                                <span className="reports-type-badge">

                                                    {
                                                        request.resource_type ||
                                                        "—"
                                                    }

                                                </span>

                                            </td>


                                            {/* PROVIDER */}

                                            <td>

                                                <div className="reports-provider">

                                                    <Cloud size={14} />

                                                    <span>

                                                        {
                                                            request.provider ||
                                                            "—"
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* CPU */}

                                            <td>

                                                <strong>
                                                    {
                                                        request.cpu_cores ??
                                                        0
                                                    }
                                                </strong>

                                                <span className="reports-unit">
                                                    cores
                                                </span>

                                            </td>


                                            {/* MEMORY */}

                                            <td>

                                                <strong>
                                                    {
                                                        request.memory_gb ??
                                                        0
                                                    }
                                                </strong>

                                                <span className="reports-unit">
                                                    GB
                                                </span>

                                            </td>


                                            {/* STORAGE */}

                                            <td>

                                                <strong>
                                                    {
                                                        request.storage_gb ??
                                                        0
                                                    }
                                                </strong>

                                                <span className="reports-unit">
                                                    GB
                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`reports-status-badge ${getStatusClass(
                                                        request.status
                                                    )}`}
                                                >

                                                    {request.status ===
                                                        "APPROVED" && (
                                                        <CheckCircle2 size={12} />
                                                    )}

                                                    {request.status ===
                                                        "PENDING" && (
                                                        <Clock3 size={12} />
                                                    )}

                                                    {request.status ===
                                                        "REJECTED" && (
                                                        <XCircle size={12} />
                                                    )}

                                                    {
                                                        request.status
                                                    }

                                                </span>

                                            </td>


                                            {/* REQUESTED */}

                                            <td>

                                                <div className="reports-date-cell">

                                                    <CalendarDays
                                                        size={13}
                                                    />

                                                    <span>

                                                        {
                                                            formatDate(
                                                                request.requested_at
                                                            )
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* REVIEWED BY */}

                                            <td>

                                                {request.reviewed_by ? (

                                                    <span className="reports-reviewer">

                                                        Admin #
                                                        {
                                                            request.reviewed_by
                                                        }

                                                    </span>

                                                ) : (

                                                    <span className="reports-not-reviewed">

                                                        Not reviewed

                                                    </span>

                                                )}

                                            </td>


                                            {/* REVIEWED */}

                                            <td>

                                                <span className="reports-reviewed-date">

                                                    {
                                                        formatDateTime(
                                                            request.reviewed_at
                                                        )
                                                    }

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>

    );

};


export default UserReports;

