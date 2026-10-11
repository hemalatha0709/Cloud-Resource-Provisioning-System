import {
    Cloud,
    Server,
    Activity,
    Settings,
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
    Eye,
    EyeOff
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../style/login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            console.log("Login response:", response.data);

            const token = response.data.token;
const loggedInUser = response.data.user;

console.log("Logged in user:", loggedInUser);
console.log("Role ID:", loggedInUser?.role_id);

if (!token || !loggedInUser) {
    setError("Invalid login response from server.");
    return;
}

login(token, loggedInUser);

if (Number(loggedInUser.role_id) === 1) {
    console.log("Admin login successful");
} else {
    console.log("User login successful");
}

navigate("/dashboard");

        } catch (error) {
            console.error(error);

            if (error.response) {
                setError(
                    error.response.data.message ||
                    "Login failed"
                );
            } else {
                setError("Unable to connect to the server");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">

            {/* =================================================
                LEFT SIDE - CLOUD PLATFORM
            ================================================= */}

            <section className="login-visual">

                <div className="visual-background-grid"></div>

                <div className="visual-content">

                    {/* BRAND */}
                    <div className="company-mark">

                        <div className="company-mark-icon">
                            ☁
                        </div>

                        <span>
                            CLOUDCORE
                        </span>

                    </div>


                    {/* MAIN CONTENT */}
                    <div className="visual-heading">

                        <span className="eyebrow">
                            CLOUD INFRASTRUCTURE PLATFORM
                        </span>

                        <h1>
                            Manage your cloud.
                            <span>
                                Smarter &amp; simpler.
                            </span>
                        </h1>

                        <p>
                            Provision, monitor and manage your
                            cloud infrastructure from one secure,
                            centralized platform.
                        </p>

                    </div>


                    {/* FEATURES */}
                    <div className="platform-features">

                        <div className="platform-feature">

                            <div className="feature-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    Resource Provisioning
                                </strong>

                                <span>
                                    Request and allocate cloud
                                    resources efficiently.
                                </span>
                            </div>

                        </div>


                        <div className="platform-feature">

                            <div className="feature-icon">
                                ◉
                            </div>

                            <div>
                                <strong>
                                    Real-time Monitoring
                                </strong>

                                <span>
                                    Track CPU, memory, storage
                                    and network usage.
                                </span>
                            </div>

                        </div>


                        <div className="platform-feature">

                            <div className="feature-icon">
                                ◆
                            </div>

                            <div>
                                <strong>
                                    Centralized Management
                                </strong>

                                <span>
                                    Manage requests, resources
                                    and reports in one place.
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* FOOTER */}
                    <div className="visual-footer">

                        <span className="status-dot"></span>

                        <span>
                            Infrastructure services operational
                        </span>

                        <span className="footer-divider">
                            •
                        </span>

                        <span>
                            Secure environment
                        </span>

                    </div>

                </div>

            </section>


            {/* =================================================
                RIGHT SIDE - LOGIN
            ================================================= */}

            <section className="login-panel">

                <div className="login-box">

                    {/* LOGIN HEADER */}
                    <div className="login-heading">

                        <span>
                            SECURE ACCESS
                        </span>

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to access your cloud resource
                            management workspace.
                        </p>

                    </div>


                    {/* ERROR MESSAGE */}
                    {error && (
                        <div className="login-alert">

                            <div className="alert-icon">
                                !
                            </div>

                            <div>

                                <strong>
                                    Login unsuccessful
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        </div>
                    )}


                  {/* LOGIN FORM */}
<form
    className="login-form"
    onSubmit={handleSubmit}
>

    {/* EMAIL */}
    <div className="login-field">

        <label htmlFor="email">
            Email address
        </label>

        <div className="input-container">

            {/* Email Icon */}
            <span className="input-icon">
                <Mail size={17} strokeWidth={1.8} />
            </span>

            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                    setEmail(e.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
            />

        </div>

    </div>

{/* PASSWORD */}
    <div className="input-container">

    <span className="input-icon">
        <Lock size={17} strokeWidth={1.8} />
    </span>

    <input
        id="password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
    />

    <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
    >
        {showPassword ? (
            <EyeOff size={17} strokeWidth={1.8} />
        ) : (
            <Eye size={17} strokeWidth={1.8} />
        )}
    </button>

</div>
    


    {/* LOGIN BUTTON */}
    <button
        type="submit"
        className="login-submit"
        disabled={loading}
    >

        {loading ? (
            <>
                <span className="loading-spinner"></span>

                Signing in...
            </>
        ) : (
            <>
                Sign in

                <ArrowRight
                    size={18}
                    strokeWidth={2}
                />
            </>
        )}

    </button>

</form>  


<div className="register-link">
    Don't have an account?{" "}
    <Link to="/register">
        Register
    </Link>
</div>

                    {/* SECURITY NOTICE */}
                    <div className="security-notice">

                        <div className="security-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Secure cloud environment
                            </strong>

                            <span>
                                Your session is protected with
                                secure authentication.
                            </span>

                        </div>

                    </div>


                    {/* COPYRIGHT */}
                    <div className="login-copyright">

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

export default Login;