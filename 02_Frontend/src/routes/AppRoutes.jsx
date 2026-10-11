import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Requests from "../pages/Requests";
import Resources from "../pages/Resources";
import Monitoring from "../pages/Monitoring";
import Reports from "../pages/Reports";
import UserReports from "../pages/UserReports";
import AdminProfile from "../pages/AdminProfile";

import DashboardLayout from "../layouts/DashboardLayout";


/* =================================================
   ADMIN ROUTE PROTECTION
================================================= */

const AdminRoute = ({ children }) => {

    const { user } = useAuth();

    const roleId = Number(user?.role_id);

    if (roleId !== 1) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
};


const AppRoutes = () => {

    return (

        <BrowserRouter>

            <Routes>

                {/* =================================================
                    LOGIN
                ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =================================================
                    REGISTER
                ================================================= */}

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =================================================
                    ADMIN PROFILE
                ================================================= */}

                <Route
                    path="/profile"
                    element={
                        <DashboardLayout>
                            <AdminProfile />
                        </DashboardLayout>
                    }
                />


                {/* =================================================
                    DASHBOARD
                ================================================= */}

                <Route
                    path="/dashboard"
                    element={
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    }
                />


                {/* =================================================
                    REQUESTS
                ================================================= */}

                <Route
                    path="/requests"
                    element={
                        <DashboardLayout>
                            <Requests />
                        </DashboardLayout>
                    }
                />


                {/* =================================================
                    RESOURCES
                ================================================= */}

                <Route
                    path="/resources"
                    element={
                        <DashboardLayout>
                            <Resources />
                        </DashboardLayout>
                    }
                />


                {/* =================================================
                    MONITORING
                ================================================= */}

                <Route
                    path="/monitoring"
                    element={
                        <DashboardLayout>
                            <Monitoring />
                        </DashboardLayout>
                    }
                />


                {/* =================================================
                    REPORTS — ADMIN ONLY
                ================================================= */}

                <Route
                    path="/reports"
                    element={
                        <AdminRoute>
                            <DashboardLayout>
                                <Reports />
                            </DashboardLayout>
                        </AdminRoute>
                    }
                />
                {/* =================================================
    MY REPORTS — CLOUD USER
================================================= */}

<Route
    path="/my-reports"
    element={
        <DashboardLayout>
            <UserReports />
        </DashboardLayout>
    }
/>

                {/* =================================================
                    DEFAULT
                ================================================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
};

export default AppRoutes;

