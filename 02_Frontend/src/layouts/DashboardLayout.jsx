import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    LayoutDashboard,
    ClipboardList,
    Cloud,
    Activity,
    FileText,
    LogOut,
    Bell,
    ChevronDown,
    User,
    Check,
    X
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import api from "../services/api";

import "../style/dashboardLayout.css";


const DashboardLayout = ({ children }) => {

    const { user, logout } = useAuth();

    const navigate = useNavigate();


    const [notifications, setNotifications] = useState([]);

    const [unreadCount, setUnreadCount] = useState(0);

    const [notificationOpen, setNotificationOpen] =
        useState(false);

    const [profileOpen, setProfileOpen] =
        useState(false);


    const notificationRef = useRef(null);

    const profileRef = useRef(null);


    // =========================================================
    // INITIAL
    // =========================================================

    const getInitial = () => {

        const name =
            user?.full_name ||
            user?.username ||
            "U";

        return name
            .charAt(0)
            .toUpperCase();
    };


    // =========================================================
    // ROLE
    // =========================================================

    const isAdmin =
        Number(user?.role_id) === 1;


    const roleName =
        isAdmin
            ? "System Administrator"
            : "Cloud User";


    // =========================================================
    // LOAD NOTIFICATIONS
    // =========================================================

    const loadNotifications = async () => {

        try {

            const response =
                await api.get("/notifications");

            setNotifications(
                response.data.notifications || []
            );

            setUnreadCount(
                response.data.unreadCount || 0
            );

        } catch (error) {

            console.error(
                "Failed to load notifications:",
                error
            );
        }
    };


    // =========================================================
    // LOAD WHEN USER CHANGES
    // =========================================================

    useEffect(() => {

        if (user) {
            loadNotifications();
        }

    }, [user]);


    // =========================================================
    // CLICK OUTSIDE
    // =========================================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {

                setNotificationOpen(false);
            }


            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {

                setProfileOpen(false);
            }
        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);


    // =========================================================
    // MARK NOTIFICATION AS READ
    // =========================================================

    const markAsRead = async (notificationId) => {

        try {

            await api.put(
                `/notifications/${notificationId}/read`
            );

            setNotifications(
                notifications.map(notification =>
                    notification.notification_id ===
                    notificationId
                        ? {
                            ...notification,
                            is_read: true
                        }
                        : notification
                )
            );

            setUnreadCount(
                Math.max(0, unreadCount - 1)
            );

        } catch (error) {

            console.error(
                "Failed to mark notification:",
                error
            );
        }
    };


    // =========================================================
    // MARK ALL AS READ
    // =========================================================

    const markAllAsRead = async () => {

        try {

            await api.put(
                "/notifications/read-all"
            );

            setNotifications(
                notifications.map(notification => ({
                    ...notification,
                    is_read: true
                }))
            );

            setUnreadCount(0);

        } catch (error) {

            console.error(
                "Failed to mark notifications:",
                error
            );
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        logout();

        navigate("/login");
    };


    return (

        <div className="dashboard-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">

                <div className="sidebar-logo">

                    <div className="sidebar-logo-icon">

                        <Cloud
                            size={21}
                            strokeWidth={2.2}
                        />

                    </div>

                    <div className="sidebar-logo-text">

                        <strong>
                            CloudCore
                        </strong>

                        <span>
                            Cloud Management
                        </span>

                    </div>

                </div>


                <div className="sidebar-section-title">
                    MAIN MENU
                </div>

                
<nav className="sidebar-nav">

    {/* =========================
        DASHBOARD
    ========================= */}

    <NavLink
        to="/dashboard"
        className={({ isActive }) =>
            isActive
                ? "nav-link active"
                : "nav-link"
        }
    >
        <LayoutDashboard
            className="nav-icon"
            size={18}
        />

        <span className="nav-text">
            Dashboard
        </span>
    </NavLink>


    {/* =========================
        REQUESTS
    ========================= */}

    <NavLink
        to="/requests"
        className={({ isActive }) =>
            isActive
                ? "nav-link active"
                : "nav-link"
        }
    >
        <ClipboardList
            className="nav-icon"
            size={18}
        />

        <span className="nav-text">
            Requests
        </span>
    </NavLink>


    {/* =========================
        RESOURCES
    ========================= */}

    <NavLink
        to="/resources"
        className={({ isActive }) =>
            isActive
                ? "nav-link active"
                : "nav-link"
        }
    >
        <Cloud
            className="nav-icon"
            size={18}
        />

        <span className="nav-text">
            Resources
        </span>
    </NavLink>


    {/* =========================
        MONITORING
    ========================= */}

    <NavLink
        to="/monitoring"
        className={({ isActive }) =>
            isActive
                ? "nav-link active"
                : "nav-link"
        }
    >
        <Activity
            className="nav-icon"
            size={18}
        />

        <span className="nav-text">
            Monitoring
        </span>
    </NavLink>


    {/* =========================
        REPORTS
        ADMIN → Reports
        USER  → My Reports
    ========================= */}

    {isAdmin ? (

        <NavLink
            to="/reports"
            className={({ isActive }) =>
                isActive
                    ? "nav-link active"
                    : "nav-link"
            }
        >
            <FileText
                className="nav-icon"
                size={18}
            />

            <span className="nav-text">
                Reports
            </span>
        </NavLink>

    ) : (

        <NavLink
            to="/my-reports"
            className={({ isActive }) =>
                isActive
                    ? "nav-link active"
                    : "nav-link"
            }
        >
            <FileText
                className="nav-icon"
                size={18}
            />

            <span className="nav-text">
                My Reports
            </span>
        </NavLink>

    )}

</nav>


                

                {/* =================================================
                    SIDEBAR BOTTOM
                ================================================= */}

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="sidebar-avatar">
                            {getInitial()}
                        </div>

                        <div className="sidebar-user-details">

                            <strong>
                                {
                                    user?.full_name ||
                                    user?.username ||
                                    "User"
                                }
                            </strong>

                            <span>
                                {roleName}
                            </span>

                        </div>

                    </div>


                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <LogOut size={17} />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div className="main-area">


                {/* =================================================
                    TOPBAR
                ================================================= */}

                <header className="topbar">

                    <div className="topbar-title">

                        <div className="topbar-breadcrumb">

                            CloudCore

                            <span>
                                /
                            </span>

                            Infrastructure

                        </div>

                        <h2>
                            Cloud Resource Management
                        </h2>

                    </div>


                    <div className="topbar-actions">


                        {/* =================================================
                            NOTIFICATION
                        ================================================= */}

                        <div
                            className="notification-wrapper"
                            ref={notificationRef}
                        >

                            <button
                                className="notification-button"
                                aria-label="Notifications"
                                onClick={() =>
                                    setNotificationOpen(
                                        !notificationOpen
                                    )
                                }
                            >

                                <Bell size={19} />


                                {unreadCount > 0 && (

                                    <span className="notification-count">

                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount}

                                    </span>

                                )}

                            </button>


                            {/* =================================================
                                NOTIFICATION DROPDOWN
                            ================================================= */}

                            {notificationOpen && (

                                <div className="notification-dropdown">


                                    <div className="notification-header">

                                        <div>

                                            <strong>
                                                Notifications
                                            </strong>

                                            <span>
                                                {unreadCount} unread
                                            </span>

                                        </div>


                                        {unreadCount > 0 && (

                                            <button
                                                onClick={
                                                    markAllAsRead
                                                }
                                            >
                                                Mark all read
                                            </button>

                                        )}

                                    </div>


                                    <div className="notification-list">

                                        {notifications.length === 0 ? (

                                            <div className="empty-notifications">

                                                <Bell
                                                    size={25}
                                                />

                                                <strong>
                                                    No notifications
                                                </strong>

                                                <span>
                                                    You're all caught up.
                                                </span>

                                            </div>

                                        ) : (

                                            notifications
                                                .slice(0, 8)
                                                .map(notification => (

                                                    <div
                                                        key={
                                                            notification.notification_id
                                                        }
                                                        className={
                                                            notification.is_read
                                                                ? "notification-item read"
                                                                : "notification-item unread"
                                                        }
                                                    >

                                                        <div className="notification-icon">

                                                            <Bell
                                                                size={15}
                                                            />

                                                        </div>


                                                        <div className="notification-content">

                                                            <strong>
                                                                {
                                                                    notification.title
                                                                }
                                                            </strong>

                                                            <p>
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>

                                                            <span>
                                                                {
                                                                    new Date(
                                                                        notification.created_at
                                                                    ).toLocaleString()
                                                                }
                                                            </span>

                                                        </div>


                                                        {!notification.is_read && (

                                                            <button
                                                                className="notification-read-button"
                                                                title="Mark as read"
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification.notification_id
                                                                    )
                                                                }
                                                            >

                                                                <Check
                                                                    size={14}
                                                                />

                                                            </button>

                                                        )}

                                                    </div>

                                                ))

                                        )}

                                    </div>


                                    {notifications.length > 8 && (

                                        <div className="notification-footer">

                                            Showing latest 8 notifications

                                        </div>

                                    )}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            PROFILE
                        ================================================= */}

                        <div
                            className="topbar-user-wrapper"
                            ref={profileRef}
                        >

                            <button
                                className="topbar-user"
                                onClick={() =>
                                    setProfileOpen(
                                        !profileOpen
                                    )
                                }
                            >

                                <div className="topbar-avatar">
                                    {getInitial()}
                                </div>


                                <div className="topbar-user-details">

                                    <strong>
                                        {
                                            user?.full_name ||
                                            user?.username ||
                                            "User"
                                        }
                                    </strong>

                                    <span>
                                        {roleName}
                                    </span>

                                </div>


                                <ChevronDown
                                    className="topbar-chevron"
                                    size={16}
                                />

                            </button>


                            {/* =================================================
                                PROFILE DROPDOWN
                            ================================================= */}

                            {profileOpen && (

                                <div className="profile-dropdown">

                                    <button
                                        onClick={() => {

                                            setProfileOpen(false);

                                            navigate("/profile");

                                        }}
                                    >

                                        <User size={16} />

                                        <span>
                                            My Profile
                                        </span>

                                    </button>


                                    <button
                                        onClick={handleLogout}
                                    >

                                        <LogOut size={16} />

                                        <span>
                                            Logout
                                        </span>

                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                </header>


                <main className="content">

                    {children}

                </main>

            </div>

        </div>
    );
};


export default DashboardLayout;