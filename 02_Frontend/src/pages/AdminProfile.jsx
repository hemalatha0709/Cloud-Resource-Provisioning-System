import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Shield,
    Calendar,
    CheckCircle,
    Save,
    Lock,
    Eye,
    EyeOff
} from "lucide-react";

import api from "../services/api";

import "../style/adminProfile.css";


const AdminProfile = () => {

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    const [form, setForm] = useState({
        username: "",
        full_name: "",
        email: ""
    });


    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });


    // =========================================================
    // PASSWORD VISIBILITY
    // =========================================================

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // =========================================================
    // LOAD PROFILE
    // =========================================================

    const loadProfile = async () => {

        try {

            const response =
                await api.get("/profile");

            setProfile(response.data);

            setForm({
                username: response.data.username || "",
                full_name: response.data.full_name || "",
                email: response.data.email || ""
            });

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to load profile"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadProfile();

    }, []);


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };


    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    const handleProfileUpdate = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        try {

            const response =
                await api.put(
                    "/profile",
                    form
                );

            setProfile(response.data.user);

            // Update localStorage user
            const storedUser =
                JSON.parse(
                    localStorage.getItem("user") || "{}"
                );

            const updatedUser = {
                ...storedUser,
                ...response.data.user
            };

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setMessage(
                "Profile updated successfully"
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to update profile"
            );
        }
    };


    // =========================================================
    // PASSWORD CHANGE
    // =========================================================

    const handlePasswordChange = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        if (
            passwordForm.new_password !==
            passwordForm.confirm_password
        ) {

            setError(
                "New password and confirm password do not match"
            );

            return;
        }


        try {

            await api.put(
                "/profile/password",
                {
                    current_password:
                        passwordForm.current_password,

                    new_password:
                        passwordForm.new_password
                }
            );


            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });

            // Hide passwords again after successful change
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);


            setMessage(
                "Password changed successfully"
            );

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to change password"
            );
        }
    };


    if (loading) {

        return (
            <div className="profile-page">
                <div className="profile-loading">
                    Loading profile...
                </div>
            </div>
        );
    }


    return (

        <div className="profile-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="profile-header">

                <div>

                    <div className="profile-breadcrumb">
                        CloudCore
                        <span>/</span>
                        Profile
                    </div>

                    <h1>My Profile</h1>

                    <p>
                        Manage your administrator account
                        information and security settings.
                    </p>

                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {message && (
                <div className="profile-success">
                    <CheckCircle size={17} />
                    <span>{message}</span>
                </div>
            )}


            {error && (
                <div className="profile-error">
                    <span>{error}</span>
                </div>
            )}


            <div className="profile-grid">

                {/* =================================================
                    PROFILE SUMMARY
                ================================================= */}

                <div className="profile-card profile-summary">

                    <div className="large-avatar">
                        {(profile?.full_name ||
                            profile?.username ||
                            "A")
                            .charAt(0)
                            .toUpperCase()}
                    </div>


                    <h2>
                        {profile?.full_name ||
                            profile?.username}
                    </h2>


                    <span className="profile-role">
                        <Shield size={14} />
                        System Administrator
                    </span>


                    <div className="profile-status">
                        <CheckCircle size={15} />
                        {profile?.status}
                    </div>


                    <div className="summary-details">

                        <div>
                            <User size={16} />
                            <span>
                                {profile?.username}
                            </span>
                        </div>

                        <div>
                            <Mail size={16} />
                            <span>
                                {profile?.email}
                            </span>
                        </div>

                        <div>
                            <Calendar size={16} />
                            <span>
                                {profile?.created_at
                                    ? new Date(
                                        profile.created_at
                                    ).toLocaleDateString()
                                    : "-"}
                            </span>
                        </div>

                    </div>

                </div>


                {/* =================================================
                    EDIT PROFILE
                ================================================= */}

                <div className="profile-card">

                    <div className="card-heading">

                        <div>

                            <h2>Profile Information</h2>

                            <p>
                                Update your account information.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={handleProfileUpdate}
                        className="profile-form"
                    >

                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                            />

                        </div>


                        <button
                            type="submit"
                            className="profile-save-button"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>

                    </form>

                </div>


                {/* =================================================
                    CHANGE PASSWORD
                ================================================= */}

                <div className="profile-card password-card">

                    <div className="card-heading">

                        <div>

                            <h2>Change Password</h2>

                            <p>
                                Keep your administrator account secure.
                            </p>

                        </div>

                        <Lock size={20} />

                    </div>


                    <form
                        onSubmit={handlePasswordChange}
                        className="profile-form"
                    >

                        {/* CURRENT PASSWORD */}

                        <div className="form-group">

                            <label>
                                Current Password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        passwordForm.current_password
                                    }
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            current_password:
                                                e.target.value
                                        })
                                    }
                                />

                                <button
                                    type="button"
                                    className="password-eye-button"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            !showCurrentPassword
                                        )
                                    }
                                    aria-label={
                                        showCurrentPassword
                                            ? "Hide current password"
                                            : "Show current password"
                                    }
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="form-group">

                            <label>
                                New Password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    type={
                                        showNewPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        passwordForm.new_password
                                    }
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            new_password:
                                                e.target.value
                                        })
                                    }
                                />

                                <button
                                    type="button"
                                    className="password-eye-button"
                                    onClick={() =>
                                        setShowNewPassword(
                                            !showNewPassword
                                        )
                                    }
                                    aria-label={
                                        showNewPassword
                                            ? "Hide new password"
                                            : "Show new password"
                                    }
                                >
                                    {showNewPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label>
                                Confirm New Password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        passwordForm.confirm_password
                                    }
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            confirm_password:
                                                e.target.value
                                        })
                                    }
                                />

                                <button
                                    type="button"
                                    className="password-eye-button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="profile-save-button"
                        >
                            <Lock size={16} />
                            Change Password
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
};


export default AdminProfile;

