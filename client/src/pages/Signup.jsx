import { useEffect, useState } from "react";

export default function Signup() {
    const [signupData, setSignupData] = useState({
        name: "",
        email: "",
        password: "",
        accountType: "buyer",
    });
    const [errors, setErrors] = useState({ name: "", email: "", password: "" });
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [loginSubmitting, setLoginSubmitting] = useState(false);
    const [loginError, setLoginError] = useState("");

    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [passwordValidationErrors, setPasswordValidationErrors] = useState([]);
    const [isValidatingPassword, setIsValidatingPassword] = useState(false);

    const [pendingUserId, setPendingUserId] = useState(null);
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);

    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
    });

    const sanitizeInput = (value, type) => {
        return value.replace(/<[^>]*>/g, '');
    };

    useEffect(() => {
        const requirements = {
            length: signupData.password.length >= 12,
            upper: /[A-Z]/.test(signupData.password),
            lower: /[a-z]/.test(signupData.password),
            number: /[0-9]/.test(signupData.password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(signupData.password),
        };
        setPasswordRequirements(requirements);
    }, [signupData.password]);

    useEffect(() => {
        const newErrors = { name: "", email: "", password: "" };

        if (!signupData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!signupData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!reEmail.test(signupData.email.trim())) {
            newErrors.email = "Invalid email";
        }

        if (!signupData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
    }, [signupData]);

    const isFormValid = () => {
        return (
            !errors.name &&
            !errors.email &&
            signupData.name.trim() &&
            signupData.email.trim() &&
            signupData.password
        );
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setPasswordTouched(true);

        if (!isFormValid()) return;

        setIsSubmitting(true);
        try {
            alert("Sign up successful! (Demo mode)");
        } catch (err) {
            console.error("Signup error:", err);
            alert(err.message || "Error while signing up");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginSubmitting(true);

        try {
            alert("Sign in successful! (Demo mode)");
        } catch (err) {
            console.error("Login error:", err);
            setLoginError(err.message || "Error while signing in");
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginSubmitting(true);

        try {
            alert("2FA verified! (Demo mode)");
        } catch (err) {
            console.error("2FA verification error:", err);
            setLoginError(err.message || "Invalid 2FA code");
        } finally {
            setLoginSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <style>{`
                .auth-container {
                    background-color: #fff;
                    border-radius: 10px;
                    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
                    position: relative;
                    overflow: hidden;
                    width: 768px;
                    max-width: 100%;
                    min-height: 580px;
                }

                .form-container {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    transition: all 0.6s ease-in-out;
                }

                .sign-in-container {
                    left: 0;
                    width: 50%;
                    z-index: 2;
                }

                .auth-container.right-panel-active .sign-in-container {
                    transform: translateX(100%);
                }

                .sign-up-container {
                    left: 0;
                    width: 50%;
                    opacity: 0;
                    z-index: 1;
                }

                .auth-container.right-panel-active .sign-up-container {
                    transform: translateX(100%);
                    opacity: 1;
                    z-index: 5;
                    animation: show 0.6s;
                }

                @keyframes show {
                    0%, 49.99% {
                        opacity: 0;
                        z-index: 1;
                    }
                    50%, 100% {
                        opacity: 1;
                        z-index: 5;
                    }
                }

                .overlay-container {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    width: 50%;
                    height: 100%;
                    overflow: hidden;
                    transition: transform 0.6s ease-in-out;
                    z-index: 100;
                }

                .auth-container.right-panel-active .overlay-container {
                    transform: translateX(-100%);
                }

                .overlay {
                    background: linear-gradient(to right, #4f46e5, #7c3aed);
                    background-repeat: no-repeat;
                    background-size: cover;
                    background-position: 0 0;
                    color: #FFFFFF;
                    position: relative;
                    left: -100%;
                    height: 100%;
                    width: 200%;
                    transform: translateX(0);
                    transition: transform 0.6s ease-in-out;
                }

                .auth-container.right-panel-active .overlay {
                    transform: translateX(50%);
                }

                .overlay-panel {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    padding: 0 40px;
                    text-align: center;
                    top: 0;
                    height: 100%;
                    width: 50%;
                    transform: translateX(0);
                    transition: transform 0.6s ease-in-out;
                }

                .overlay-left {
                    transform: translateX(-20%);
                }

                .auth-container.right-panel-active .overlay-left {
                    transform: translateX(0);
                }

                .overlay-right {
                    right: 0;
                    transform: translateX(0);
                }

                .auth-container.right-panel-active .overlay-right {
                    transform: translateX(20%);
                }

                .auth-form {
                    background-color: #FFFFFF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    padding: 0 50px;
                    height: 100%;
                    text-align: center;
                }

                .auth-form h1 {
                    font-weight: bold;
                    margin: 0 0 20px 0;
                    font-size: 24px;
                    color: #333;
                }

                .auth-form span {
                    font-size: 12px;
                    color: #666;
                    margin: 15px 0;
                }

                .auth-form input {
                    background-color: #eee;
                    border: none;
                    padding: 12px 15px;
                    margin: 8px 0;
                    width: 100%;
                    border-radius: 5px;
                    font-size: 14px;
                }

                .auth-form button {
                    border-radius: 20px;
                    border: 1px solid #4f46e5;
                    background-color: #4f46e5;
                    color: #FFFFFF;
                    font-size: 12px;
                    font-weight: bold;
                    padding: 12px 45px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    transition: transform 80ms ease-in;
                    cursor: pointer;
                    margin-top: 15px;
                }

                .auth-form button:active {
                    transform: scale(0.95);
                }

                .auth-form button:focus {
                    outline: none;
                }

                .auth-form button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .ghost-btn {
                    background-color: transparent;
                    border-color: #FFFFFF;
                    color: #FFFFFF;
                }

                .ghost-btn:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .social-container {
                    margin: 20px 0;
                }

                .password-requirements {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin: 10px 0;
                    font-size: 11px;
                }

                .account-type-container {
                    display: flex;
                    gap: 10px;
                    margin: 15px 0;
                    width: 100%;
                }

                .account-type-option {
                    flex: 1;
                    padding: 10px;
                    border: 2px solid #eee;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .account-type-option.selected {
                    border-color: #4f46e5;
                    background-color: #f0f0ff;
                }

                .account-type-option input[type="radio"] {
                    width: auto;
                    margin: 0;
                }
            `}</style>

            <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                {/* Sign Up */}
                <div className="form-container sign-up-container">
                    <form onSubmit={handleSignUp} noValidate className="auth-form">
                        <h1>Create Account</h1>

                        <div className="social-container">
                            <button type="button" className="bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                                <span className="text-xl">G</span>
                            </button>
                        </div>

                        <span>or use your email for registration</span>

                        <input
                            type="text"
                            placeholder="Name"
                            value={signupData.name}
                            onChange={(e) =>
                                setSignupData({
                                    ...signupData,
                                    name: sanitizeInput(e.target.value, "name"),
                                })
                            }
                        />
                        {errors.name && (
                            <div className="text-xs text-red-600 w-full text-left">{errors.name}</div>
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={signupData.email}
                            onChange={(e) =>
                                setSignupData({
                                    ...signupData,
                                    email: sanitizeInput(e.target.value, "email"),
                                })
                            }
                        />
                        {errors.email && (
                            <div className="text-xs text-red-600 w-full text-left">{errors.email}</div>
                        )}

                        <input
                            type="password"
                            placeholder="Password"
                            value={signupData.password}
                            onChange={(e) =>
                                setSignupData({
                                    ...signupData,
                                    password: sanitizeInput(e.target.value, "password"),
                                })
                            }
                            onBlur={() => setPasswordTouched(true)}
                        />

                        {/* Password Requirements */}
                        <div className="password-requirements">
                            <div className={passwordRequirements.length ? "text-green-600" : "text-gray-600"}>
                                {passwordRequirements.length ? "✓" : "•"} 12 chars
                            </div>
                            <div className={passwordRequirements.upper ? "text-green-600" : "text-gray-600"}>
                                {passwordRequirements.upper ? "✓" : "•"} Upper
                            </div>
                            <div className={passwordRequirements.lower ? "text-green-600" : "text-gray-600"}>
                                {passwordRequirements.lower ? "✓" : "•"} Lower
                            </div>
                            <div className={passwordRequirements.number ? "text-green-600" : "text-gray-600"}>
                                {passwordRequirements.number ? "✓" : "•"} Number
                            </div>
                            <div className={passwordRequirements.special ? "text-green-600" : "text-gray-600"}>
                                {passwordRequirements.special ? "✓" : "•"} Special
                            </div>
                        </div>

                        {/* Account type */}
                        <div className="account-type-container">
                            <label className={`account-type-option ${signupData.accountType === "buyer" ? "selected" : ""}`}>
                                <input
                                    type="radio"
                                    name="accountType"
                                    value="buyer"
                                    checked={signupData.accountType === "buyer"}
                                    onChange={(e) =>
                                        setSignupData({
                                            ...signupData,
                                            accountType: e.target.value,
                                        })
                                    }
                                />
                                <span>Buyer</span>
                            </label>
                            <label className={`account-type-option ${signupData.accountType === "seller" ? "selected" : ""}`}>
                                <input
                                    type="radio"
                                    name="accountType"
                                    value="seller"
                                    checked={signupData.accountType === "seller"}
                                    onChange={(e) =>
                                        setSignupData({
                                            ...signupData,
                                            accountType: e.target.value,
                                        })
                                    }
                                />
                                <span>Seller</span>
                            </label>
                        </div>

                        {passwordTouched && errors.password && (
                            <div className="text-xs text-red-600 w-full text-left">
                                {errors.password}
                            </div>
                        )}

                        <button type="submit" disabled={!isFormValid() || isSubmitting}>
                            {isSubmitting ? "Creating..." : "Sign Up"}
                        </button>
                    </form>
                </div>

                {/* Sign In */}
                <div className="form-container sign-in-container">
                    <form onSubmit={twoFactorRequired ? handleVerify2FA : handleSignIn} className="auth-form">
                        <h1>Sign in</h1>
                        {!twoFactorRequired && (
                            <div className="social-container">
                                <button type="button" className="bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                                    <span className="text-xl">G</span>
                                </button>
                            </div>
                        )}
                        {!twoFactorRequired ? (
                            <>
                                <span>or use your account</span>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={loginData.email}
                                    onChange={(e) =>
                                        setLoginData({
                                            ...loginData,
                                            email: sanitizeInput(e.target.value, "email"),
                                        })
                                    }
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={loginData.password}
                                    onChange={(e) =>
                                        setLoginData({
                                            ...loginData,
                                            password: sanitizeInput(e.target.value, "password"),
                                        })
                                    }
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <p className="mb-2 text-gray-700">Enter your 2FA code</p>
                                <input
                                    type="text"
                                    placeholder="6-digit code"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    required
                                />
                            </>
                        )}

                        {loginError && (
                            <div className="text-xs text-red-600 mb-2">{loginError}</div>
                        )}

                        <button type="submit" disabled={loginSubmitting}>
                            {loginSubmitting
                                ? twoFactorRequired
                                    ? "Verifying..."
                                    : "Signing In..."
                                : twoFactorRequired
                                    ? "Verify 2FA"
                                    : "Sign In"}
                        </button>
                    </form>
                </div>

                {/* Overlay */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
                            <p className="mb-6">To keep connected please login with your personal info</p>
                            <button
                                className="ghost-btn border-2 rounded-full px-8 py-2 font-bold uppercase tracking-wide"
                                onClick={() => setIsRightPanelActive(false)}
                                type="button"
                            >
                                Sign In
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className="text-3xl font-bold mb-4">Hello, Friend!</h1>
                            <p className="mb-6">Enter your details and start your journey with us</p>
                            <button
                                className="ghost-btn border-2 rounded-full px-8 py-2 font-bold uppercase tracking-wide"
                                onClick={() => setIsRightPanelActive(true)}
                                type="button"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}