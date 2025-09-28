import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecurity } from '../hooks/useSecurity.js';
import {OAuthButton} from "../utils/OAuthButton.jsx";

export default function Signup() {
    const [signupData, setSignupData] = useState({ name: "", email: "", password: "", accountType: "buyer" });
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

    const navigate = useNavigate();
    const { sanitizeInput, validateInput, sanitizeFormData } = useSecurity();

    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Client-side password validation
    const validatePasswordClient = (password) => {
        const requirements = {
            length: password.length >= MIN_LENGTH,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        return requirements;
    };

    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    // Setup overlay buttons
    useEffect(() => {
        const signUpButton = document.getElementById("signUp");
        const signInButton = document.getElementById("signIn");
        const container = document.getElementById("container");

        if (!signUpButton || !signInButton || !container) return;

        const handleSignUpClick = () => container.classList.add("right-panel-active");
        const handleSignInClick = () => container.classList.remove("right-panel-active");

        signUpButton.addEventListener("click", handleSignUpClick);
        signInButton.addEventListener("click", handleSignInClick);

        return () => {
            signUpButton.removeEventListener("click", handleSignUpClick);
            signInButton.removeEventListener("click", handleSignInClick);
        };
    }, []);

    // Debounced password validation API call
    const validatePasswordWithBackend = async (password) => {
        if (!password || password.length < 3) {
            setPasswordValidationErrors([]);
            return;
        }

        setIsValidatingPassword(true);
        try {
            const res = await fetch("http://localhost:8080/api/auth/validate-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    password: password,
                    email: signupData.email,
                    name: signupData.name
                }),
            });
            
            if (res.ok) {
                const data = await res.json();
                setPasswordValidationErrors(data.errors || []);
            }
        } catch (err) {
            console.error("Password validation error:", err);
            // Don't show error to user for validation failure
        } finally {
            setIsValidatingPassword(false);
        }
    };

    // Debounce password validation
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            validatePasswordWithBackend(signupData.password);
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(timeoutId);
    }, [signupData.password, signupData.email, signupData.name]);

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

        const pwd = signupData.password || "";
        if (!pwd) {
            newErrors.password = "Password is required";
        }
        // Remove client-side password validation - rely on backend

        setErrors(newErrors);
    }, [signupData]);

    const isFormValid = () => {
        return (
            !errors.name &&
            !errors.email &&
            signupData.name.trim() &&
            signupData.email.trim() &&
            signupData.password
            // Remove client-side password requirement checks - backend will validate
        );
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setPasswordTouched(true);

        if (!isFormValid()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("http://localhost:8080/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...signupData }),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "Signup failed");
                throw new Error(text || "Signup failed");
            }
            const data = await res.json();

            localStorage.setItem(
                "user",
                JSON.stringify({
                    name: signupData.name,
                    email: signupData.email,
                    accountType: signupData.accountType,
                    token: data.accessToken ?? null,
                })
            );

            navigate("/");
        } catch (err) {
            console.error("Signup error:", err);
            alert(typeof err === "string" ? err : err.message || "Error while signing up");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginSubmitting(true);

        try {
            const res = await fetch("http://localhost:8080/api/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "Login failed");
                throw new Error(text || "Login failed");
            }
            const data = await res.json();

            if (data.requires2FA) {
                setTwoFactorRequired(true);
                setPendingUserId(data.userId);
                return;
            }

            if (res.ok) {
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        email: loginData.email,
                        role: data.role,
                        token: data.accessToken ?? null,
                    })
                );
                navigate("/");
            } else {
                throw new Error(data || "Login failed");
            }
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
            const res = await fetch("http://localhost:8080/api/auth/verify-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: pendingUserId, code: twoFactorCode }),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "Invalid 2FA code");
                throw new Error(text || "Invalid 2FA code");
            }

            const data = await res.json();

            localStorage.setItem(
                "user",
                JSON.stringify({
                    email: loginData.email,
                    role: data.role,
                    token: data.accessToken ?? null,
                })
            );

            navigate("/");
        } catch (err) {
            console.error("2FA verification error:", err);
            setLoginError(err.message || "Invalid 2FA code");
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleGoogleAuth = () => {
        console.log("Google authentication clicked");
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    const handleFacebookAuth = () => {
        console.log("Facebook authentication clicked");
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="absolute top-4 left-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center space-x-2 text-black hover:text-blue-600"
                >
                    <span>Back</span>
                </button>
            </div>

            <div className="flex justify-center items-center mt-10">
                <div className="container" id="container">
                    {/* Sign Up */}
                    <div className="form-container sign-up-container">
                        <form onSubmit={handleSignUp} noValidate>
                            <h1>Create Account</h1>

                            <div className="social-container">
                                <OAuthButton provider={"google"} />
                            </div>

                            <span>or use your email for registration</span>

                            <input
                                type="text"
                                placeholder="Name"
                                value={signupData.name}
                                onChange={(e) => setSignupData({ ...signupData, name: sanitizeInput(e.target.value, 'name') })}
                            />
                            {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}

                            <input
                                type="email"
                                placeholder="Email"
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: sanitizeInput(e.target.value, 'email') })}
                            />
                            {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}

                            <input
                                type="password"
                                placeholder="Password"
                                value={signupData.password}
                                onChange={(e) => setSignupData({ ...signupData, password: sanitizeInput(e.target.value, 'password') })}
                                onBlur={() => setPasswordTouched(true)}
                            />

                            {/* Password Requirements - Grid Layout with Backend Validation */}
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

                            {/* Backend Password Validation Errors */}
                            {isValidatingPassword && (
                                <div className="text-sm text-blue-600 mb-2">Validating password...</div>
                            )}
                            {passwordValidationErrors.length > 0 && (
                                <div className="password-validation-errors">
                                    {passwordValidationErrors.map((error, index) => (
                                        <div key={index} className="text-sm text-red-600">{error}</div>
                                    ))}
                                </div>
                            )}

                            {/* Select Buyer/Seller */}
                            <div className="account-type-container">
                                <label className={`account-type-option ${signupData.accountType === 'buyer' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="buyer"
                                        checked={signupData.accountType === "buyer"}
                                        onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })}
                                    />
                                    <span>Buyer</span>
                                </label>
                                <label className={`account-type-option ${signupData.accountType === 'seller' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="seller"
                                        checked={signupData.accountType === "seller"}
                                        onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })}
                                    />
                                    <span>Seller</span>
                                </label>
                            </div>

                            {passwordTouched && errors.password && (
                                <div className="text-sm text-red-600 mt-2">{errors.password}</div>
                            )}

                            <button type="submit" disabled={!isFormValid() || isSubmitting}>
                                {isSubmitting ? "Creating..." : "Sign Up"}
                            </button>
                        </form>
                    </div>

                    {/* Sign In */}
                    <div className="form-container sign-in-container">
                        <form onSubmit={twoFactorRequired ? handleVerify2FA : handleSignIn}>
                            <h1>Sign in</h1>
                            {!twoFactorRequired && (
                                <div className="social-container">
                                    <OAuthButton provider={"google"} />
                                </div>
                            )}
                            {!twoFactorRequired ? (
                                <>
                                    <span>or use your account</span>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: sanitizeInput(e.target.value, 'email') })}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: sanitizeInput(e.target.value, 'password') })}
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

                            {loginError && <div className="text-sm text-red-600 mb-2">{loginError}</div>}

                            <button type="submit" disabled={loginSubmitting}>
                                {loginSubmitting
                                    ? (twoFactorRequired ? "Verifying..." : "Signing In...")
                                    : (twoFactorRequired ? "Verify 2FA" : "Sign In")}
                            </button>
                        </form>
                    </div>

                    {/* Overlay */}
                    <div className="overlay-container">
                        <div className="overlay">
                            <div className="overlay-panel overlay-left">
                                <h1>Welcome Back!</h1>
                                <p>To keep connected please login with your personal info</p>
                                <button className="ghost" id="signIn">Sign In</button>
                            </div>
                            <div className="overlay-panel overlay-right">
                                <h1>Hello, Friend!</h1>
                                <p>Enter your details and start your journey with us</p>
                                <button className="ghost" id="signUp">Sign Up</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
        * { box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; }
        h1 { font-weight: bold; margin: 0; }
        p { font-size: 14px; font-weight: 100; line-height: 20px; letter-spacing: 0.5px; margin: 20px 0 30px; }
        span { font-size: 12px; }
        button { border-radius: 20px; border: 1px solid #2563EB; background-color: #2563EB; color: #FFFFFF; font-size: 12px; font-weight: bold; padding: 12px 45px; letter-spacing: 1px; text-transform: uppercase; transition: transform 80ms ease-in; }
        button:active { transform: scale(0.95); }
        button:focus { outline: none; }
        button.ghost { background-color: transparent; border-color: #FFFFFF; }
        button:disabled { background-color: #94A3B8; border-color: #94A3B8; cursor: not-allowed; }
        .social-container { margin: 15px 0; display: flex; gap: 10px; justify-content: center; }
        .password-requirements { 
            margin: 8px 0 12px 0; 
            text-align: left; 
            font-size: 11px; 
            line-height: 1.3; 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 2px; 
        }
        .account-type-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin: 10px 0 15px 0;
        }
        .account-type-option {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 15px;
            transition: all 0.3s ease;
            border: 1px solid #ddd;
            background-color: #fff;
        }
        .account-type-option.selected {
            background-color: #EBF4FF;
            border-color: #2563EB;
            color: #2563EB;
        }
        .account-type-option input[type="radio"] {
            margin: 0;
            width: auto;
            padding: 0;
        }
        .account-type-option span {
            font-size: 12px;
            font-weight: 500;
        }
        form { background-color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; height: 100%; text-align: center; }
        input { background-color: #eee; border: none; padding: 12px 15px; margin: 6px 0; width: 100%; }
        .container { 
            background-color: #fff; 
            border-radius: 10px; 
            box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22); 
            position: relative; 
            overflow: hidden; 
            width: 900px; 
            max-width: 100%; 
            min-height: 580px; 
        }
        .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
        .sign-in-container { left: 0; width: 50%; z-index: 2; }
        .container.right-panel-active .sign-in-container { transform: translateX(100%); }
        .sign-up-container { left: 0; width: 50%; opacity: 0; z-index: 1; }
        .container.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; }
        @keyframes show { 0%, 49.99% { opacity: 0; z-index: 1; } 50%, 100% { opacity: 1; z-index: 5; } }
        .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
        .container.right-panel-active .overlay-container { transform: translateX(-100%); }
        .overlay { 
            background: #1E40AF; 
            background: -webkit-linear-gradient(to right, #2563EB, #1D4ED8); 
            background: linear-gradient(to right, #2563EB, #1D4ED8); 
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
        .container.right-panel-active .overlay { transform: translateX(50%); }
        .overlay-panel { position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; text-align: center; top: 0; height: 100%; width: 50%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
        .overlay-left { transform: translateX(-20%); left: 0; }
        .container.right-panel-active .overlay-left { transform: translateX(0); }
        .overlay-right { right: 0; transform: translateX(0); }
        .container.right-panel-active .overlay-right { transform: translateX(20%); }
      `}</style>
        </div>
    );
}