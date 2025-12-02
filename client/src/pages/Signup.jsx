import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecurity } from '../hooks/useSecurity.js';
import {OAuthButton} from "../utils/OAuthButton.jsx";
import {useAuthApi} from "../context/apiAuthContext.jsx";

export default function Signup() {
    const [signupData, setSignupData] = useState({ name: "", email: "", password: "", accountType: "BUYER" });
    const [errors, setErrors] = useState({ name: "", email: "", password: "" });
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {setUser, getMe, api, loginWithToken} = useAuthApi()
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

        return true;

        if (!password || password.length < 3) {
            setPasswordValidationErrors([]);
            return;
        }

        setIsValidatingPassword(true);
        try {
            const res = await fetch("http://localhost:8443/api/auth/validate-password", {
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
            console.log('🔵 [Signup.jsx] Attempting signup...');
            
            // Sanitize signup data before sending
            const sanitizedSignupData = sanitizeFormData(signupData);
            const res = await api.post('/api/auth/signup', sanitizedSignupData, { noAuth: true });
            console.log('✅ [Signup.jsx] Signup response:', res);
            
            const data = res.data;
            const token = data.accessToken || data.token;
            console.log('🔵 [Signup.jsx] Token received from signup:', token ? 'Yes' : 'No');

            // Fetch user data with the new token
            try {
                console.log('🔵 [Signup.jsx] Calling getMe after signup...');
                const userObj = await getMe(token);
                console.log('✅ [Signup.jsx] User data fetched after signup:', userObj);
                // Now set both token and user data
                loginWithToken(token, userObj);
                console.log('✅ [Signup.jsx] loginWithToken called with user data after signup');
            } catch (err) {
                console.error('❌ [Signup.jsx] Failed to fetch user data after signup:', err);
                // Even if fetching user fails, still login with token
                loginWithToken(token, null);
                console.log('⚠️ [Signup.jsx] loginWithToken called without user data after signup');
            }

            navigate("/");
        } catch (err) {
            console.error("Signup error:", err);
            alert(err.response?.data?.message || err.message || "Error while signing up");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginSubmitting(true);

        try {
            console.log('🔵 [Signup.jsx] Attempting login with:', { email: loginData.email });
            
            // Sanitize login data before sending
            const sanitizedLoginData = sanitizeFormData(loginData);
            const res = await api.post('/api/auth/signin', sanitizedLoginData, { noAuth: true });
            console.log('✅ [Signup.jsx] Login response:', res);

            // Check if 2FA is required
            if (res.status === 202 && res.data.twoFactorRequired) {
                console.log('🔵 [Signup.jsx] 2FA required');
                setTwoFactorRequired(true);
                setPendingUserId(res.data.userId);
                return;
            }

            const data = res.data;
            const token = data.accessToken || data.token;
            console.log('🔵 [Signup.jsx] Token received:', token ? 'Yes' : 'No');

            // Fetch user data with the new token
            try {
                console.log('🔵 [Signup.jsx] Calling getMe with token...');
                const userObj = await getMe(token);
                console.log('✅ [Signup.jsx] User data fetched:', userObj);
                // Now set both token and user data
                loginWithToken(token, userObj);
                console.log('✅ [Signup.jsx] loginWithToken called with user data');
            } catch (err) {
                console.error('❌ [Signup.jsx] Failed to fetch user data:', err);
                // Even if fetching user fails, still login with token
                loginWithToken(token, null);
                console.log('⚠️ [Signup.jsx] loginWithToken called without user data');
            }

            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setLoginError(err.response?.data?.message || err.message || "Error while signing in");
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginSubmitting(true);

        try {
            console.log('🔵 [Signup.jsx] Verifying 2FA...');
            
            // Sanitize 2FA code before sending
            const sanitizedCode = sanitizeInput(twoFactorCode, '2fa');
            
            const res = await api.post('/api/auth/verify-2fa', {
                userId: pendingUserId.toString(),
                code: sanitizedCode
            }, { noAuth: true });

            console.log('✅ [Signup.jsx] 2FA verification response:', res);

            const { accessToken } = res.data;
            console.log('🔵 [Signup.jsx] Token received from 2FA:', accessToken ? 'Yes' : 'No');

            // Fetch user data with the new token
            try {
                console.log('🔵 [Signup.jsx] Calling getMe after 2FA...');
                const userObj = await getMe(accessToken);
                console.log('✅ [Signup.jsx] User data fetched after 2FA:', userObj);
                // Now set both token and user data
                loginWithToken(accessToken, userObj);
                console.log('✅ [Signup.jsx] loginWithToken called with user data after 2FA');
            } catch (err) {
                console.error('❌ [Signup.jsx] Failed to fetch user data after 2FA:', err);
                // Even if fetching user fails, still login with token
                loginWithToken(accessToken, null);
                console.log('⚠️ [Signup.jsx] loginWithToken called without user data after 2FA');
            }

            navigate("/");
        } catch (err) {
            console.error("2FA verification error:", err);
            setLoginError(err.response?.data?.error || err.message || "Invalid 2FA code");
        } finally {
            setLoginSubmitting(false);
        }
    };

    const handleGoogleAuth = () => {
        console.log("Google authentication clicked");
        window.location.href = "https://localhost:8443/oauth2/authorization/google";
    };

    const handleFacebookAuth = () => {
        console.log("Facebook authentication clicked");
    };

    return (
        <div className="signup-page">
            <div className="signup-back-wrapper">
                <button
                    onClick={() => window.history.back()}
                    className="signup-back-button"
                >
                    <span>Back</span>
                </button>
            </div>

            <div className="signup-body">
                <div className="signup-shell" id="container">
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
                                className="glass-input"
                            />
                            {errors.name && <div className="form-error">{errors.name}</div>}

                            <input
                                type="email"
                                placeholder="Email"
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: sanitizeInput(e.target.value, 'email') })}
                                className="glass-input"
                            />
                            {errors.email && <div className="form-error">{errors.email}</div>}

                            <input
                                type="password"
                                placeholder="Password"
                                value={signupData.password}
                                onChange={(e) => setSignupData({ ...signupData, password: sanitizeInput(e.target.value, 'password') })}
                                onBlur={() => setPasswordTouched(true)}
                                className="glass-input"
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
                                <div className="form-info signup-info">Validating password...</div>
                            )}
                            {passwordValidationErrors.length > 0 && (
                                <div className="password-validation-errors">
                                    {passwordValidationErrors.map((error, index) => (
                                        <div key={index} className="form-error">{error}</div>
                                    ))}
                                </div>
                            )}

                            {/* Select BUYER/SELLER */}
                            <div className="account-type-container">
                                <label className={`account-type-option ${signupData.accountType === 'BUYER' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="BUYER"
                                        checked={signupData.accountType === "BUYER"}
                                        onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })}
                                    />
                                    <span>BUYER</span>
                                </label>
                                <label className={`account-type-option ${signupData.accountType === 'SELLER' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="SELLER"
                                        checked={signupData.accountType === "SELLER"}
                                        onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })}
                                    />
                                    <span>SELLER</span>
                                </label>
                            </div>

                            {passwordTouched && errors.password && (
                                <div className="form-error signup-error">{errors.password}</div>
                            )}

                            <button type="submit" className="btn-primary" disabled={!isFormValid() || isSubmitting}>
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
                                        className="glass-input"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: sanitizeInput(e.target.value, 'password') })}
                                        className="glass-input"
                                        required
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="form-note signup-note">Enter your 2FA code</p>
                                    <input
                                        type="text"
                                        placeholder="6-digit code"
                                        value={twoFactorCode}
                                        onChange={(e) => setTwoFactorCode(sanitizeInput(e.target.value, '2fa'))}
                                        className="glass-input"
                                        required
                                    />
                                </>
                            )}

                            {loginError && <div className="form-error signup-error">{loginError}</div>}

                            <button type="submit" className="btn-primary" disabled={loginSubmitting}>
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
        </div>
    );
}