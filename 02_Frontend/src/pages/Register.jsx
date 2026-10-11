import {
    User,
    UserRound,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Cloud
} from "lucide-react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import "../style/register.css";

const Register = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.username ||
            !formData.full_name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/register", {
                username: formData.username,
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password
            });

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            console.error("Registration error:", error);

            if (error.response) {
                setError(
                    error.response.data.message ||
                    "Registration failed."
                );
            } else {
                setError("Unable to connect to the server.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">

            {/* =================================================
                LEFT SIDE - CLOUD PLATFORM
            ================================================= */}

            <section className="register-visual">

                <div className="register-background-grid"></div>

                <div className="register-visual-content">

                    {/* BRAND */}

                    <div className="register-company-mark">

                        <div className="register-company-icon">
                            <Cloud size={24} />
                        </div>

                        <span>
                            CLOUDCORE
                        </span>

                    </div>


                    {/* HEADING */}

                    <div className="register-visual-heading">

                        <span className="register-eyebrow">
                            CLOUD INFRASTRUCTURE PLATFORM
                        </span>

                        <h1>
                            Build your cloud.
                            <span>
                                Securely &amp; efficiently.
                            </span>
                        </h1>

                        <p>
                            Create your CloudCore account and
                            start managing your cloud resources
                            from one centralized platform.
                        </p>

                    </div>


                    {/* FEATURES */}

                    <div className="register-features">

                        <div className="register-feature">

                            <div className="register-feature-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Cloud Resource Management
                                </strong>

                                <span>
                                    Request and manage your cloud
                                    resources efficiently.
                                </span>
                            </div>

                        </div>


                        <div className="register-feature">

                            <div className="register-feature-icon">
                                ◉
                            </div>

                            <div>
                                <strong>
                                    Resource Monitoring
                                </strong>

                                <span>
                                    Monitor CPU, memory and storage
                                    usage in one place.
                                </span>
                            </div>

                        </div>


                        <div className="register-feature">

                            <div className="register-feature-icon">
                                ◆
                            </div>

                            <div>
                                <strong>
                                    Secure Access
                                </strong>

                                <span>
                                    Your account is protected with
                                    secure authentication.
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="register-visual-footer">

                        <span className="register-status-dot"></span>

                        <span>
                            Infrastructure services operational
                        </span>

                        <span className="register-footer-divider">
                            •
                        </span>

                        <span>
                            Secure environment
                        </span>

                    </div>

                </div>

            </section>


            {/* =================================================
                RIGHT SIDE - REGISTER
            ================================================= */}

            <section className="register-panel">

                <div className="register-box">

                    {/* HEADER */}

                    <div className="register-heading">

                        <span>
                            CREATE ACCOUNT
                        </span>

                        <h2>
                            Join CloudCore
                        </h2>

                        <p>
                            Create your account to access the
                            cloud resource management workspace.
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="register-alert">

                            <div className="register-alert-icon">
                                !
                            </div>

                            <div>

                                <strong>
                                    Registration unsuccessful
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* SUCCESS */}

                    {success && (

                        <div className="register-success">

                            <div className="register-success-icon">
                                ✓
                            </div>

                            <div>
                                {success}
                            </div>

                        </div>

                    )}


                    {/* FORM */}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        {/* USERNAME */}

                        <div className="register-field">

                            <label htmlFor="username">
                                Username
                            </label>

                            <div className="register-input-container">

                                <span className="register-input-icon">
                                    <User size={17} />
                                </span>

                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    autoComplete="username"
                                    required
                                />

                            </div>

                        </div>


                        {/* FULL NAME */}

                        <div className="register-field">

                            <label htmlFor="full_name">
                                Full name
                            </label>

                            <div className="register-input-container">

                                <span className="register-input-icon">
                                    <UserRound size={17} />
                                </span>

                                <input
                                    id="full_name"
                                    name="full_name"
                                    type="text"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                />

                            </div>

                        </div>


                        {/* EMAIL */}

                        <div className="register-field">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="register-input-container">

                                <span className="register-input-icon">
                                    <Mail size={17} />
                                </span>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="register-field">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="register-input-container">

                                <span className="register-input-icon">
                                    <Lock size={17} />
                                </span>

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="register-field">

                            <label htmlFor="confirmPassword">
                                Confirm password
                            </label>

                            <div className="register-input-container">

                                <span className="register-input-icon">
                                    <Lock size={17} />
                                </span>

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={17} />
                                    ) : (
                                        <Eye size={17} />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            className="register-submit"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="register-spinner"></span>

                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account

                                    <ArrowRight
                                        size={18}
                                    />
                                </>
                            )}

                        </button>

                    </form>


                    {/* LOGIN LINK */}

                    <div className="register-login-link">

                        Already have an account?{" "}

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>


                    {/* SECURITY NOTICE */}

                    <div className="register-security">

                        <div className="register-security-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Secure cloud environment
                            </strong>

                            <span>
                                Your account is protected with
                                secure authentication.
                            </span>

                        </div>

                    </div>


                    {/* COPYRIGHT */}

                    <div className="register-copyright">

                        <span>
                            Cloud Resource Management
                        </span>

                        <span>
                            © 2026
                        </span>

                    </div>

                </div>

            </section>

        </div>
    );
};

export default Register;