import "../style/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* =========================================================
       GET USER ROLE
       role_id = 1 → System Administrator
       role_id = 2 → Cloud User
    ========================================================= */

    const getUserRole = () => {
        try {
            // First try AuthContext user
            if (user?.role_id !== undefined && user?.role_id !== null) {
                return Number(user.role_id);
            }

            // Fallback: read role_id from JWT
            const token = localStorage.getItem("token");

            if (!token) {
                return null;
            }

            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            return payload.role_id
                ? Number(payload.role_id)
                : null;

        } catch (error) {
            console.error("Unable to read user role:", error);
            return null;
        }
    };

    const userRole = getUserRole();

    const isAdmin = userRole === 1;


    /* =========================================================
       FETCH DASHBOARD STATISTICS
    ========================================================= */

    useEffect(() => {
        const getDashboardStatistics = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await api.get("/dashboard");

                console.log(
                    "Dashboard statistics:",
                    response.data.statistics
                );

                setStatistics(
                    response.data.statistics
                );

            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard statistics."
                );

            } finally {

                setLoading(false);

            }
        };

        getDashboardStatistics();

    }, []);


    /* =========================================================
       SAFE STATISTICS
    ========================================================= */

    const requests =
        statistics?.requests || {};

    const resources =
        statistics?.resources || {};

    const monitoring =
        statistics?.monitoring || {};


    /* =========================================================
       NAVIGATION
    ========================================================= */

    const goToRequests = (status = "") => {

        if (status) {

            navigate(
                `/requests?status=${status}`
            );

        } else {

            navigate("/requests");

        }
    };


    const goToResources = () => {
        navigate("/resources");
    };


    const goToMonitoring = () => {
        navigate("/monitoring");
    };


    const goToReports = () => {
        navigate("/reports");
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="professional-dashboard">


            {/* =================================================
               PAGE HEADER
            ================================================= */}

            <div className="dashboard-hero">

                <div>

                    <div className="dashboard-eyebrow">
                        CLOUD INFRASTRUCTURE
                    </div>

                    <h1>
                         Hi, Welcome Back,{" "}
                        {user?.full_name ||
                            user?.username ||
                            "User"}{" "}
                        👋
                    </h1>

                    <p>
                        Monitor your cloud resources, requests and
                        infrastructure activity from one place.
                    </p>

                </div>


                {/* =================================================
                   HEADER ACTIONS
                   ADMIN → ONLY VIEW REQUESTS
                   USER → VIEW REQUESTS + NEW REQUEST
                ================================================= */}

                <div className="dashboard-header-actions">

                    <button
                        className="dashboard-secondary-button"
                        onClick={() =>
                            navigate("/requests")
                        }
                    >
                        View Requests
                    </button>


                    {/* NEW REQUEST ONLY FOR CLOUD USERS */}

                    {!isAdmin && (

                        <button
                            className="dashboard-primary-button"
                            onClick={() =>
                                navigate("/requests")
                            }
                        >
                            + New Request
                        </button>

                    )}

                </div>

            </div>


            {/* =================================================
               ERROR
            ================================================= */}

            {error && (

                <div className="dashboard-error">

                    <span>⚠</span>

                    {error}

                </div>

            )}


            {/* =================================================
               LOADING
            ================================================= */}

            {loading && (

                <div className="dashboard-loading">

                    <div className="dashboard-loading-spinner"></div>

                    <p>
                        Loading cloud infrastructure data...
                    </p>

                </div>

            )}


            {!loading && statistics && (

                <>


                    {/* =================================================
                       REQUEST KPI CARDS
                    ================================================= */}

                    <section className="dashboard-section">

                        <div className="dashboard-section-header">

                            <div>

                                <h2>
                                    Request Overview
                                </h2>

                                <p>
                                    Current status of your resource requests
                                </p>

                            </div>


                            <button
                                className="section-link"
                                onClick={() =>
                                    goToRequests()
                                }
                            >
                                View all →
                            </button>

                        </div>


                        <div className="dashboard-kpi-grid">


                            {/* TOTAL */}

                            <button
                                className="dashboard-kpi-card kpi-blue"
                                onClick={() =>
                                    goToRequests()
                                }
                            >

                                <div className="kpi-top">

                                    <div className="kpi-icon">
                                        📋
                                    </div>

                                    <span className="kpi-arrow">
                                        ↗
                                    </span>

                                </div>

                                <div className="kpi-label">
                                    Total Requests
                                </div>

                                <div className="kpi-value">
                                    {requests.total_requests ?? 0}
                                </div>

                                <div className="kpi-description">
                                    All submitted requests
                                </div>

                            </button>


                            {/* PENDING */}

                            <button
                                className="dashboard-kpi-card kpi-orange"
                                onClick={() =>
                                    goToRequests("PENDING")
                                }
                            >

                                <div className="kpi-top">

                                    <div className="kpi-icon">
                                        ⏳
                                    </div>

                                    <span className="kpi-arrow">
                                        ↗
                                    </span>

                                </div>

                                <div className="kpi-label">
                                    Pending Requests
                                </div>

                                <div className="kpi-value">
                                    {requests.pending_requests ?? 0}
                                </div>

                                <div className="kpi-description">
                                    Waiting for review
                                </div>

                            </button>


                            {/* APPROVED */}

                            <button
                                className="dashboard-kpi-card kpi-green"
                                onClick={() =>
                                    goToRequests("APPROVED")
                                }
                            >

                                <div className="kpi-top">

                                    <div className="kpi-icon">
                                        ✓
                                    </div>

                                    <span className="kpi-arrow">
                                        ↗
                                    </span>

                                </div>

                                <div className="kpi-label">
                                    Approved Requests
                                </div>

                                <div className="kpi-value">
                                    {requests.approved_requests ?? 0}
                                </div>

                                <div className="kpi-description">
                                    Successfully approved
                                </div>

                            </button>


                            {/* REJECTED */}

                            <button
                                className="dashboard-kpi-card kpi-red"
                                onClick={() =>
                                    goToRequests("REJECTED")
                                }
                            >

                                <div className="kpi-top">

                                    <div className="kpi-icon">
                                        ×
                                    </div>

                                    <span className="kpi-arrow">
                                        ↗
                                    </span>

                                </div>

                                <div className="kpi-label">
                                    Rejected Requests
                                </div>

                                <div className="kpi-value">
                                    {requests.rejected_requests ?? 0}
                                </div>

                                <div className="kpi-description">
                                    Requests not approved
                                </div>

                            </button>

                        </div>

                    </section>


                    {/* =================================================
                       INFRASTRUCTURE OVERVIEW
                    ================================================= */}

                    <section className="dashboard-section">

                        <div className="dashboard-section-header">

                            <div>

                                <h2>
                                    Infrastructure Overview
                                </h2>

                                <p>
                                    Current cloud resource allocation
                                </p>

                            </div>


                            <button
                                className="section-link"
                                onClick={goToResources}
                            >
                                Manage resources →
                            </button>

                        </div>


                        <div className="infrastructure-grid">


                            {/* =================================================
                               RESOURCES
                            ================================================= */}

                            <div className="infrastructure-card">

                                <div className="infrastructure-card-header">

                                    <div className="infrastructure-icon blue">
                                        ☁
                                    </div>

                                    <span className="infrastructure-status active">
                                        Active
                                    </span>

                                </div>


                                <h3>
                                    {resources.total_resources ?? 0}
                                </h3>

                                <p>
                                    Total Resources
                                </p>


                                <div className="infrastructure-details">

                                    <span>
                                        Active
                                    </span>

                                    <strong>
                                        {resources.active_resources ?? 0}
                                    </strong>

                                </div>


                                <div className="infrastructure-details">

                                    <span>
                                        Expired
                                    </span>

                                    <strong>
                                        {resources.expired_resources ?? 0}
                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                               HEALTH
                            ================================================= */}

                            <div className="infrastructure-card">

                                <div className="infrastructure-card-header">

                                    <div className="infrastructure-icon green">
                                        ♥
                                    </div>

                                    <span className="infrastructure-status healthy">
                                        Healthy
                                    </span>

                                </div>


                                <h3>
                                    {monitoring.healthy_resources ?? 0}
                                </h3>

                                <p>
                                    Healthy Records
                                </p>


                                <div className="health-bar">

                                    <div
                                        className="health-bar-fill"
                                        style={{
                                            width: `${
                                                monitoring.total_monitored_resources
                                                    ? Math.min(
                                                        100,
                                                        (
                                                            (monitoring.healthy_resources || 0) /
                                                            monitoring.total_monitored_resources
                                                        ) * 100
                                                    )
                                                    : 0
                                            }%`
                                        }}
                                    />

                                </div>


                                <small>
                                    Monitoring health status
                                </small>

                            </div>


                            {/* =================================================
                               MONITORING
                            ================================================= */}

                            <div className="infrastructure-card">

                                <div className="infrastructure-card-header">

                                    <div className="infrastructure-icon purple">
                                        ◉
                                    </div>

                                    <span className="infrastructure-status monitoring">
                                        Monitoring
                                    </span>

                                </div>


                                <h3>
                                    {monitoring.total_monitored_resources ?? 0}
                                </h3>

                                <p>
                                    Monitoring Records
                                </p>


                                <div className="monitoring-mini-grid">


                                    <div>

                                        <span className="health-dot green-dot"></span>

                                        Healthy

                                        <strong>
                                            {monitoring.healthy_resources ?? 0}
                                        </strong>

                                    </div>


                                    <div>

                                        <span className="health-dot orange-dot"></span>

                                        Warning

                                        <strong>
                                            {monitoring.warning_resources ?? 0}
                                        </strong>

                                    </div>


                                    <div>

                                        <span className="health-dot red-dot"></span>

                                        Critical

                                        <strong>
                                            {monitoring.critical_resources ?? 0}
                                        </strong>

                                    </div>


                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                       REQUEST DISTRIBUTION
                    ================================================= */}

                    <section className="dashboard-section">

                        <div className="dashboard-section-header">

                            <div>

                                <h2>
                                    Request Distribution
                                </h2>

                                <p>
                                    Overview of request processing
                                </p>

                            </div>

                        </div>


                        <div className="request-distribution-card">


                            <div className="distribution-item">

                                <div className="distribution-label">

                                    <span className="distribution-dot blue-dot"></span>

                                    <span>
                                        Total Requests
                                    </span>

                                </div>

                                <strong>
                                    {requests.total_requests ?? 0}
                                </strong>

                            </div>


                            <div className="distribution-item">

                                <div className="distribution-label">

                                    <span className="distribution-dot orange-dot"></span>

                                    <span>
                                        Pending
                                    </span>

                                </div>

                                <strong>
                                    {requests.pending_requests ?? 0}
                                </strong>

                            </div>


                            <div className="distribution-item">

                                <div className="distribution-label">

                                    <span className="distribution-dot green-dot"></span>

                                    <span>
                                        Approved
                                    </span>

                                </div>

                                <strong>
                                    {requests.approved_requests ?? 0}
                                </strong>

                            </div>


                            <div className="distribution-item">

                                <div className="distribution-label">

                                    <span className="distribution-dot red-dot"></span>

                                    <span>
                                        Rejected
                                    </span>

                                </div>

                                <strong>
                                    {requests.rejected_requests ?? 0}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                       QUICK ACTIONS
                    ================================================= */}

                    <section className="dashboard-section">

                        <div className="dashboard-section-header">

                            <div>

                                <h2>
                                    Quick Actions
                                </h2>

                                <p>
                                    Manage your cloud infrastructure
                                </p>

                            </div>

                        </div>


                        <div className="quick-actions-grid">


                            {/* =================================================
                               CREATE REQUEST
                               SHOW ONLY FOR CLOUD USERS
                            ================================================= */}

                            {!isAdmin && (

                                <button
                                    className="quick-action-card"
                                    onClick={() =>
                                        navigate("/requests")
                                    }
                                >

                                    <div className="quick-action-icon blue">
                                        +
                                    </div>

                                    <div>

                                        <strong>
                                            Create Request
                                        </strong>

                                        <span>
                                            Request a new cloud resource
                                        </span>

                                    </div>

                                    <span className="quick-action-arrow">
                                        →
                                    </span>

                                </button>

                            )}


                            {/* =================================================
                               VIEW RESOURCES
                            ================================================= */}

                            <button
                                className="quick-action-card"
                                onClick={goToResources}
                            >

                                <div className="quick-action-icon purple">
                                    ☁
                                </div>

                                <div>

                                    <strong>
                                        View Resources
                                    </strong>

                                    <span>
                                        Manage allocated resources
                                    </span>

                                </div>

                                <span className="quick-action-arrow">
                                    →
                                </span>

                            </button>


                            {/* =================================================
                               MONITOR USAGE
                            ================================================= */}

                            <button
                                className="quick-action-card"
                                onClick={goToMonitoring}
                            >

                                <div className="quick-action-icon green">
                                    ◉
                                </div>

                                <div>

                                    <strong>
                                        Monitor Usage
                                    </strong>

                                    <span>
                                        Check resource health and usage
                                    </span>

                                </div>

                                <span className="quick-action-arrow">
                                    →
                                </span>

                            </button>

{/* =================================================
   REPORTS
   SHOW ONLY FOR ADMIN
================================================= */}

{isAdmin && (
    <button 
        className="quick-action-card" 
        onClick={goToReports}
    > 

        <div className="quick-action-icon orange"> 
            ▣ 
        </div> 

        <div> 

            <strong> 
                View Reports 
            </strong> 

            <span> 
                Analyze cloud activity 
            </span> 

        </div> 

        <span className="quick-action-arrow"> 
            → 
        </span> 

    </button>
)}
                           

                        </div>

                    </section>

                </>

            )}

        </div>
    );
};

export default Dashboard;