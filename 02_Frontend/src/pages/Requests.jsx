import "../style/requests.css";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Plus,
    Clock3,
    CheckCircle2,
    XCircle,
    FileText,
    Eye,
    X,
    Check,
    Ban,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const Requests = () => {
    /* =====================================================
       STATE
    ===================================================== */

    const [requests, setRequests] = useState([]);

    const [resourceNames, setResourceNames] = useState([]);
    const [resourceTypes, setResourceTypes] = useState([]);
    const [providers, setProviders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingResourceNames, setLoadingResourceNames] = useState(true);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [loadingProviders, setLoadingProviders] = useState(true);

    const [error, setError] = useState("");
    const [resourceNameError, setResourceNameError] = useState("");
    const [typeError, setTypeError] = useState("");
    const [providerError, setProviderError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [activeFilter, setActiveFilter] = useState("ALL");

    const [formData, setFormData] = useState({
        resource_name: "",
        resource_type_id: "",
        provider: "",
        cpu_cores: "",
        memory_gb: "",
        storage_gb: "",
        justification: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [processingRequest, setProcessingRequest] = useState(false);
    const [actionError, setActionError] = useState("");

    const [searchParams] = useSearchParams();

    const token = localStorage.getItem("token");

    /* =====================================================
       GET USER ROLE
    ===================================================== */

    const getUserRole = () => {
        try {
            if (!token) return null;

            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            return payload.role_id;
        } catch (err) {
            console.error("Unable to read user role:", err);
            return null;
        }
    };

    const isAdmin = getUserRole() === 1;

    /* =====================================================
       LOAD REQUESTS
    ===================================================== */

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const roleId = getUserRole();

            const apiUrl =
                roleId === 1
                    ? `${API_BASE}/admin/requests`
                    : `${API_BASE}/requests/my`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load requests"
                );
            }

            setRequests(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error("Requests loading error:", err);

            setError(
                err.message ||
                "Unable to load requests."
            );

            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       LOAD RESOURCE NAMES
    ===================================================== */

    const fetchResourceNames = async () => {
        try {
            setLoadingResourceNames(true);
            setResourceNameError("");

            const response = await fetch(
                `${API_BASE}/resource-names`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load resource names"
                );
            }

            if (
                !data.success ||
                !Array.isArray(data.resourceNames)
            ) {
                throw new Error(
                    "Invalid resource names response"
                );
            }

            setResourceNames(data.resourceNames);
        } catch (err) {
            console.error(
                "Resource names error:",
                err
            );

            setResourceNames([]);
            setResourceNameError(
                "Unable to load resource names."
            );
        } finally {
            setLoadingResourceNames(false);
        }
    };

    /* =====================================================
       LOAD RESOURCE TYPES
    ===================================================== */

    const fetchResourceTypes = async () => {
        try {
            setLoadingTypes(true);
            setTypeError("");

            const response = await fetch(
                `${API_BASE}/resource-types`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load resource types"
                );
            }

            if (!Array.isArray(data)) {
                throw new Error(
                    "Invalid resource types response"
                );
            }

            setResourceTypes(data);
        } catch (err) {
            console.error(
                "Resource types error:",
                err
            );

            setResourceTypes([]);
            setTypeError(
                "Unable to load resource types."
            );
        } finally {
            setLoadingTypes(false);
        }
    };

    /* =====================================================
       LOAD PROVIDERS
    ===================================================== */

    const fetchProviders = async () => {
        try {
            setLoadingProviders(true);
            setProviderError("");

            const response = await fetch(
                `${API_BASE}/providers`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load providers"
                );
            }

            if (!Array.isArray(data)) {
                throw new Error(
                    "Invalid providers response"
                );
            }

            setProviders(data);
        } catch (err) {
            console.error(
                "Providers error:",
                err
            );

            setProviders([]);
            setProviderError(
                "Unable to load providers."
            );
        } finally {
            setLoadingProviders(false);
        }
    };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        if (!token) {
            setError(
                "Authentication token not found. Please login again."
            );

            setLoading(false);
            setLoadingResourceNames(false);
            setLoadingTypes(false);
            setLoadingProviders(false);

            return;
        }

        fetchRequests();
        fetchResourceNames();
        fetchResourceTypes();
        fetchProviders();
    }, []);

    /* =====================================================
       DASHBOARD FILTER
    ===================================================== */

    useEffect(() => {
        const status = searchParams.get("status");

        if (!status) {
            setActiveFilter("ALL");
            return;
        }

        const upperStatus = status.toUpperCase();

        if (
            upperStatus === "PENDING" ||
            upperStatus === "APPROVED" ||
            upperStatus === "REJECTED"
        ) {
            setActiveFilter(upperStatus);
        } else {
            setActiveFilter("ALL");
        }
    }, [searchParams]);

    /* =====================================================
       COUNTS
    ===================================================== */

    const totalRequests = requests.length;

    const pendingRequests = requests.filter(
        (request) =>
            request.status?.toUpperCase() === "PENDING"
    ).length;

    const approvedRequests = requests.filter(
        (request) =>
            request.status?.toUpperCase() === "APPROVED"
    ).length;

    const rejectedRequests = requests.filter(
        (request) =>
            request.status?.toUpperCase() === "REJECTED"
    ).length;

    /* =====================================================
       FILTERED REQUESTS
    ===================================================== */

    const filteredRequests = requests.filter(
        (request) => {
            const status =
                request.status?.toUpperCase();

            if (activeFilter === "ALL") {
                return true;
            }

            return status === activeFilter;
        }
    );

    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /* =====================================================
       SUBMIT REQUEST
    ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");

            if (!formData.resource_name.trim()) {
                throw new Error(
                    "Please select a resource name."
                );
            }

            if (!formData.resource_type_id) {
                throw new Error(
                    "Please select a resource type."
                );
            }

            if (!formData.provider) {
                throw new Error(
                    "Please select a provider."
                );
            }

            if (!formData.cpu_cores) {
                throw new Error(
                    "Please enter CPU cores."
                );
            }

            if (!formData.memory_gb) {
                throw new Error(
                    "Please enter memory."
                );
            }

            if (!formData.storage_gb) {
                throw new Error(
                    "Please enter storage."
                );
            }

            if (!formData.justification.trim()) {
                throw new Error(
                    "Please provide justification."
                );
            }

            const response = await fetch(
                `${API_BASE}/requests`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        resource_name:
                            formData.resource_name.trim(),

                        type_id:
                            Number(
                                formData.resource_type_id
                            ),

                        provider_id:
                            Number(
                                formData.provider
                            ),

                        cpu_cores:
                            Number(
                                formData.cpu_cores
                            ),

                        memory_gb:
                            Number(
                                formData.memory_gb
                            ),

                        storage_gb:
                            Number(
                                formData.storage_gb
                            ),

                        justification:
                            formData.justification.trim(),
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to submit request"
                );
            }

            setFormData({
                resource_name: "",
                resource_type_id: "",
                provider: "",
                cpu_cores: "",
                memory_gb: "",
                storage_gb: "",
                justification: "",
            });

            setShowForm(false);

            await fetchRequests();
        } catch (err) {
            console.error(
                "Submit request error:",
                err
            );

            setError(
                err.message ||
                "Failed to submit request."
            );
        } finally {
            setSubmitting(false);
        }
    };

    /* =====================================================
       ADMIN APPROVE / REJECT
       IMPORTANT: This is outside handleSubmit
    ===================================================== */
const handleRequestAction = async (action) => {
    if (!selectedRequest) {
        return;
    }

    const requestId = selectedRequest.request_id;

    const currentStatus =
        selectedRequest.status?.toUpperCase();

    if (currentStatus !== "PENDING") {
        return;
    }

    const actionName =
        action === "approve"
            ? "approve"
            : "reject";

    let expiryDate = "";

    // Ask for expiry date only when approving
    if (action === "approve") {
    expiryDate = window.prompt(
        "Enter expiry date (YYYY-MM-DD):",
        "2026-12-30"
    );

    if (!expiryDate) {
        return;
    }

    // Validate date format
    const expiry = new Date(`${expiryDate}T00:00:00`);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate) ||
        Number.isNaN(expiry.getTime())
    ) {
        window.alert(
            "Please enter a valid date in YYYY-MM-DD format."
        );
        return;
    }

    // Expiry date must be after today
    if (expiry <= today) {
        window.alert(
            "Expiry date must be a future date."
        );
        return;
    }
}
    const confirmationMessage =
        action === "approve"
            ? `Are you sure you want to approve this request?\n\nExpiry Date: ${expiryDate}`
            : "Are you sure you want to reject this request?";

    if (!window.confirm(confirmationMessage)) {
        return;
    }

    try {
        setProcessingRequest(true);
        setActionError("");

        const response = await fetch(
            `${API_BASE}/admin/request/${requestId}/${actionName}`,
            {
                method: "PUT",

                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },

                body:
                    action === "approve"
                        ? JSON.stringify({
                            expiry_date: expiryDate
                        })
                        : JSON.stringify({})
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                `Failed to ${actionName} request`
            );
        }

        setSelectedRequest(null);

        await fetchRequests();

    } catch (err) {
        console.error(
            `Request ${actionName} error:`,
            err
        );

        setActionError(
            err.message ||
            `Failed to ${actionName} request.`
        );

    } finally {
        setProcessingRequest(false);
    }
};
    
    /* =====================================================
       STATUS CLASS
    ===================================================== */

    const getStatusClass = (status) => {
        switch (
            status?.toUpperCase()
        ) {
            case "APPROVED":
                return "status-approved";

            case "REJECTED":
                return "status-rejected";

            case "PENDING":
                return "status-pending";

            default:
                return "status-default";
        }
    };

    /* =====================================================
       STATUS ICON
    ===================================================== */

    const getStatusIcon = (status) => {
        switch (
            status?.toUpperCase()
        ) {
            case "APPROVED":
                return (
                    <CheckCircle2 size={15} />
                );

            case "REJECTED":
                return (
                    <XCircle size={15} />
                );

            case "PENDING":
                return (
                    <Clock3 size={15} />
                );

            default:
                return (
                    <Clock3 size={15} />
                );
        }
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

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    /* =====================================================
       RESOURCE NAME
    ===================================================== */

    const getResourceName = (request) => {
        return (
            request.resource_name ||
            request.resource_type_name ||
            request.resource_type ||
            request.type ||
            "—"
        );
    };

/*--------------
requested by user
-----------------*/
const getRequester = (request) => {
    const name =
        request.requester_name ||
        request.full_name ||
        "—";

    const username =
        request.requester_username ||
        request.username ||
        "";

    return {
        name,
        username
    };
};

    /* =====================================================
       REVIEWER
    ===================================================== */

    const getReviewer = (request) => {
        return (
            request.reviewed_by_name ||
            request.reviewer_name ||
            request.reviewed_by ||
            "—"
        );
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="requests-page">

            {/* =================================================
               PAGE HEADER
            ================================================= */}

            <div className="requests-header">

                <div>
                    <h1>
                        {isAdmin
                            ? "Resource Requests"
                            : "My Resource Requests"}
                    </h1>

                    <p>
                        {isAdmin
                            ? "Review and manage cloud resource requests."
                            : "Create and track your cloud resource requests."}
                    </p>
                </div>

                {!isAdmin && (
                    <button
                        className="new-request-btn"
                        onClick={() =>
                            setShowForm(true)
                        }
                    >
                        <Plus size={18} />
                        New Request
                    </button>
                )}

            </div>

            {/* =================================================
               ERROR
            ================================================= */}

            {error && (
                <div className="request-error">
                    {error}
                </div>
            )}

            {/* =================================================
               STATISTICS
            ================================================= */}

            <div className="modern-stats-grid">

                {/* TOTAL */}

                <button
                    type="button"
                    className={`modern-stat-card ${
                        activeFilter === "ALL"
                            ? "stat-card-active"
                            : ""
                    }`}
                    onClick={() =>
                        setActiveFilter("ALL")
                    }
                >
                    <div className="stat-card-icon total-icon">
                        <FileText size={22} />
                    </div>

                    <div className="stat-card-content">
                        <span>Total Requests</span>

                        <strong>
                            {totalRequests}
                        </strong>
                    </div>
                </button>

                {/* PENDING */}

                <button
                    type="button"
                    className={`modern-stat-card ${
                        activeFilter === "PENDING"
                            ? "stat-card-active"
                            : ""
                    }`}
                    onClick={() =>
                        setActiveFilter("PENDING")
                    }
                >
                    <div className="stat-card-icon pending-icon">
                        <Clock3 size={22} />
                    </div>

                    <div className="stat-card-content">
                        <span>Pending</span>

                        <strong>
                            {pendingRequests}
                        </strong>
                    </div>
                </button>

                {/* APPROVED */}

                <button
                    type="button"
                    className={`modern-stat-card ${
                        activeFilter === "APPROVED"
                            ? "stat-card-active"
                            : ""
                    }`}
                    onClick={() =>
                        setActiveFilter("APPROVED")
                    }
                >
                    <div className="stat-card-icon approved-icon">
                        <CheckCircle2 size={22} />
                    </div>

                    <div className="stat-card-content">
                        <span>Approved</span>

                        <strong>
                            {approvedRequests}
                        </strong>
                    </div>
                </button>

                {/* REJECTED */}

                <button
                    type="button"
                    className={`modern-stat-card ${
                        activeFilter === "REJECTED"
                            ? "stat-card-active"
                            : ""
                    }`}
                    onClick={() =>
                        setActiveFilter("REJECTED")
                    }
                >
                    <div className="stat-card-icon rejected-icon">
                        <XCircle size={22} />
                    </div>

                    <div className="stat-card-content">
                        <span>Rejected</span>

                        <strong>
                            {rejectedRequests}
                        </strong>
                    </div>
                </button>

            </div>

            {/* =================================================
               REQUEST TABLE
            ================================================= */}

            <div className="requests-table-card">

                <div className="requests-table-header">

                    <div>
                        <h2>
                            {isAdmin
                                ? "All Requests"
                                : "My Requests"}
                        </h2>

                        <p>
                            {isAdmin
                                ? "Review and manage submitted resource requests."
                                : "View and track your resource requests."}
                        </p>
                    </div>

                    <span className="request-count-badge">
                        {filteredRequests.length}
                    </span>

                </div>

                {/* LOADING */}

                {loading && (
                    <div className="requests-empty-state">
                        <div className="loading-spinner"></div>

                        <h3>
                            Loading requests...
                        </h3>
                    </div>
                )}

                {/* EMPTY */}

                {!loading &&
                    !error &&
                    filteredRequests.length === 0 && (
                        <div className="requests-empty-state">

                            <FileText size={42} />

                            <h3>
                                {activeFilter === "ALL"
                                    ? "No resource requests yet"
                                    : `No ${activeFilter.toLowerCase()} requests`}
                            </h3>

                            <p>
                                {activeFilter === "ALL"
                                    ? "There are no cloud resource requests to display."
                                    : `There are no ${activeFilter.toLowerCase()} requests to display.`}
                            </p>

                        </div>
                    )}

                {/* TABLE */}

                {!loading &&
                    !error &&
                    filteredRequests.length > 0 && (

                        <div className="requests-table-wrapper">

                            <table className="requests-table">

                                <thead>
                                    <tr>
                                        <th>Request ID</th>
                                        <th>Requested By</th>
                                        <th>Resource</th>
                                        <th>Type</th>
                                        <th>Provider</th>
                                        <th>CPU</th>
                                        <th>Memory</th>
                                        <th>Storage</th>
                                        <th>Status</th>
                                        <th>Requested At</th>
                                        <th>Reviewed By</th>
                                        <th>Reviewed At</th>
                                        <th>Action</th>
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

                                             <td>
    <strong>
        #{request.request_id}
    </strong>
</td>

<td>
    <div className="requester-info">
        <strong>
            {getRequester(request).name}
        </strong>

        {getRequester(request).username && (
            <span>
                @{getRequester(request).username}
            </span>
        )}
    </div>
</td>

<td>
    {getResourceName(request)}
</td>   

                                                <td>
                                                    {
                                                        request.type_name ||
                                                        request.resource_type ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        request.provider_name ||
                                                        request.provider ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        request.cpu_cores ??
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        request.memory_gb !=
                                                        null
                                                            ? `${request.memory_gb} GB`
                                                            : "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        request.storage_gb !=
                                                        null
                                                            ? `${request.storage_gb} GB`
                                                            : "—"
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={`request-status ${getStatusClass(
                                                            request.status
                                                        )}`}
                                                    >
                                                        {
                                                            getStatusIcon(
                                                                request.status
                                                            )
                                                        }

                                                        {
                                                            request.status ||
                                                            "PENDING"
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            request.requested_at
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        getReviewer(
                                                            request
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            request.reviewed_at
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="view-request-btn"
                                                        onClick={() => {
                                                            setActionError("");
                                                            setSelectedRequest(
                                                                request
                                                            );
                                                        }}
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

            {/* =================================================
               NEW REQUEST MODAL
            ================================================= */}

            {showForm && (
                <div
                    className="request-modal-overlay"
                    onClick={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setShowForm(false);
                        }
                    }}
                >

                    <div className="request-modal">

                        <div className="request-modal-header">

                            <div>
                                <h2>
                                    New Resource Request
                                </h2>

                                <p>
                                    Submit a request for cloud resources.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="request-form"
                            onSubmit={handleSubmit}
                        >

                            {/* RESOURCE NAME */}

                            <div className="form-group">

                                <label>
                                    Resource Name
                                </label>

                                <select
                                    name="resource_name"
                                    value={
                                        formData.resource_name
                                    }
                                    onChange={handleChange}
                                    required
                                    disabled={
                                        loadingResourceNames ||
                                        resourceNames.length === 0
                                    }
                                >

                                    <option value="">
                                        {loadingResourceNames
                                            ? "Loading resource names..."
                                            : resourceNames.length === 0
                                                ? "No resource names available"
                                                : "Select resource name"}
                                    </option>

                                    {resourceNames.map(
                                        (resource, index) => (
                                            <option
                                                key={index}
                                                value={
                                                    resource.resource_name
                                                }
                                            >
                                                {
                                                    resource.resource_name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                                {resourceNameError && (
                                    <small className="form-error-text">
                                        {resourceNameError}
                                    </small>
                                )}

                            </div>

                            {/* RESOURCE TYPE */}

                            <div className="form-group">

                                <label>
                                    Resource Type
                                </label>

                                <select
                                    name="resource_type_id"
                                    value={
                                        formData.resource_type_id
                                    }
                                    onChange={handleChange}
                                    required
                                    disabled={
                                        loadingTypes ||
                                        resourceTypes.length === 0
                                    }
                                >

                                    <option value="">
                                        {loadingTypes
                                            ? "Loading resource types..."
                                            : resourceTypes.length === 0
                                                ? "No resource type available"
                                                : "Select resource type"}
                                    </option>

                                    {resourceTypes.map(
                                        (resource) => (
                                            <option
                                                key={
                                                    resource.type_id
                                                }
                                                value={
                                                    resource.type_id
                                                }
                                            >
                                                {
                                                    resource.type_name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                                {typeError && (
                                    <small className="form-error-text">
                                        {typeError}
                                    </small>
                                )}

                            </div>

                            {/* PROVIDER */}

                            <div className="form-group">

                                <label>
                                    Provider
                                </label>

                                <select
                                    name="provider"
                                    value={
                                        formData.provider
                                    }
                                    onChange={handleChange}
                                    required
                                    disabled={
                                        loadingProviders ||
                                        providers.length === 0
                                    }
                                >

                                    <option value="">
                                        {loadingProviders
                                            ? "Loading providers..."
                                            : providers.length === 0
                                                ? "No provider available"
                                                : "Select provider"}
                                    </option>

                                    {providers.map(
                                        (provider) => (
                                            <option
                                                key={
                                                    provider.provider_id
                                                }
                                                value={
                                                    provider.provider_id
                                                }
                                            >
                                                {
                                                    provider.provider_name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                                {providerError && (
                                    <small className="form-error-text">
                                        {providerError}
                                    </small>
                                )}

                            </div>

                            {/* CPU */}

                            <div className="form-group">
                                <label>
                                    CPU Cores
                                </label>

                                <input
                                    type="number"
                                    name="cpu_cores"
                                    value={
                                        formData.cpu_cores
                                    }
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Example: 2"
                                    required
                                />
                            </div>

                            {/* MEMORY */}

                            <div className="form-group">
                                <label>
                                    Memory (GB)
                                </label>

                                <input
                                    type="number"
                                    name="memory_gb"
                                    value={
                                        formData.memory_gb
                                    }
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Example: 4"
                                    required
                                />
                            </div>

                            {/* STORAGE */}

                            <div className="form-group">
                                <label>
                                    Storage (GB)
                                </label>

                                <input
                                    type="number"
                                    name="storage_gb"
                                    value={
                                        formData.storage_gb
                                    }
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Example: 50"
                                    required
                                />
                            </div>

                            {/* JUSTIFICATION */}

                            <div className="form-group">
                                <label>
                                    Justification
                                </label>

                                <textarea
                                    name="justification"
                                    value={
                                        formData.justification
                                    }
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Explain why you need this resource..."
                                    required
                                />
                            </div>

                            {/* ACTIONS */}

                            <div className="request-form-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="submit-request-btn"
                                    disabled={
                                        submitting ||
                                        loadingResourceNames ||
                                        loadingTypes ||
                                        loadingProviders ||
                                        resourceNames.length === 0 ||
                                        resourceTypes.length === 0 ||
                                        providers.length === 0
                                    }
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Request"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
               REQUEST DETAILS MODAL
            ================================================= */}

            {selectedRequest && (
                <div
                    className="request-modal-overlay"
                    onClick={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setSelectedRequest(null);
                        }
                    }}
                >

                    <div className="request-modal request-details-modal">

                        <div className="request-modal-header">

                            <div>
                                <h2>
                                    Request #
                                    {
                                        selectedRequest.request_id
                                    }
                                </h2>

                                <p>
                                    Resource request details
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={() =>
                                    setSelectedRequest(null)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="request-details-content">

                            <div className="detail-row">
                                <span>
                                    Resource Name
                                </span>

                                <strong>
                                    {
                                        getResourceName(
                                            selectedRequest
                                        )
                                    }
                                </strong>
                            </div>

                            <div className="detail-row">
                                <span>
                                    Resource Type
                                </span>

                                <strong>
                                    {
                                        selectedRequest.type_name ||
                                        selectedRequest.resource_type ||
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div className="detail-row">
                                <span>
                                    Provider
                                </span>

                                <strong>
                                    {
                                        selectedRequest.provider_name ||
                                        selectedRequest.provider ||
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div className="detail-row">
                                <span>
                                    CPU Cores
                                </span>

                                <strong>
                                    {
                                        selectedRequest.cpu_cores ??
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div className="detail-row">
                                <span>
                                    Memory
                                </span>

                                <strong>
                                    {
                                        selectedRequest.memory_gb !=
                                        null
                                            ? `${selectedRequest.memory_gb} GB`
                                            : "—"
                                    }
                                </strong>
                            </div>

                            <div className="detail-row">
                                <span>
                                    Storage
                                </span>

                                <strong>
                                    {
                                        selectedRequest.storage_gb !=
                                        null
                                            ? `${selectedRequest.storage_gb} GB`
                                            : "—"
                                    }
                                </strong>
                            </div>

                            <div className="detail-row">
                                <span>
                                    Status
                                </span>

                                <span
                                    className={`request-status ${getStatusClass(
                                        selectedRequest.status
                                    )}`}
                                >
                                    {
                                        getStatusIcon(
                                            selectedRequest.status
                                        )
                                    }

                                    {
                                        selectedRequest.status ||
                                        "PENDING"
                                    }
                                </span>
                            </div>

                            <div className="detail-row">
                                <span>
                                    Requested At
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            selectedRequest.requested_at
                                        )
                                    }
                                </strong>
                            </div>

                            <div className="detail-row">
                                <span>
                                    Reviewed By
                                </span>

                                <strong>
                                    {
                                        getReviewer(
                                            selectedRequest
                                        )
                                    }
                                </strong>
                            </div>

                            <div className="detail-row">
                                <span>
                                    Reviewed At
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            selectedRequest.reviewed_at
                                        )
                                    }
                                </strong>
                            </div>

                            <div className="detail-justification">
                                <span>
                                    Justification
                                </span>

                                <p>
                                    {
                                        selectedRequest.justification ||
                                        "No justification provided."
                                    }
                                </p>
                            </div>

                            {/* ADMIN ACTIONS */}

                            {isAdmin &&
                                selectedRequest.status?.toUpperCase() ===
                                    "PENDING" && (

                                    <div className="admin-action-section">

                                        {actionError && (
                                            <div className="admin-action-error">
                                                {actionError}
                                            </div>
                                        )}

                                        <div className="admin-request-actions">

                                            <button
                                                type="button"
                                                className="admin-reject-btn"
                                                onClick={() =>
                                                    handleRequestAction(
                                                        "reject"
                                                    )
                                                }
                                                disabled={
                                                    processingRequest
                                                }
                                            >
                                                <Ban size={17} />

                                                {processingRequest
                                                    ? "Processing..."
                                                    : "Reject Request"}
                                            </button>

                                            <button
                                                type="button"
                                                className="admin-approve-btn"
                                                onClick={() =>
                                                    handleRequestAction(
                                                        "approve"
                                                    )
                                                }
                                                disabled={
                                                    processingRequest
                                                }
                                            >
                                                <Check size={17} />

                                                {processingRequest
                                                    ? "Processing..."
                                                    : "Approve Request"}
                                            </button>

                                        </div>

                                    </div>
                                )}

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default Requests;