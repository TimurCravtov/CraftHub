import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecurity } from '../hooks/useSecurity.js';

export default function Signup() {
    const [signupData, setSignupData] = useState({ name: "", email: "", password: "", accountType: "LOCAL" });
    const [errors, setErrors] = useState({ name: "", email: "", password: "" });
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [loginSubmitting, setLoginSubmitting] = useState(false);
    const [loginError, setLoginError] = useState("");

    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [pendingUserId, setPendingUserId] = useState(null);

    const navigate = useNavigate();
    const { sanitizeInput, validateInput, sanitizeFormData } = useSecurity();

    const MIN_LENGTH = 8;
    const reHasUpper = /[A-Z]/;
    const reHasLower = /[a-z]/;
    const reHasDigit = /[0-9]/;
    const reHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

        // Cleanup on unmount
        return () => {
            signUpButton.removeEventListener("click", handleSignUpClick);
            signInButton.removeEventListener("click", handleSignInClick);
        };
    }, []);

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
        } else {
            if (pwd.length < MIN_LENGTH) {
                newErrors.password = `Password must be at least ${MIN_LENGTH} characters long`;
            } else if (!reHasUpper.test(pwd)) {
                newErrors.password = "Password must contain at least one uppercase letter";
            } else if (!reHasLower.test(pwd)) {
                newErrors.password = "Password must contain at least one lowercase letter";
            } else if (!reHasDigit.test(pwd)) {
                newErrors.password = "Password must contain at least one number";
            } else if (!reHasSpecial.test(pwd)) {
                newErrors.password = "Password must contain at least one special character";
            }
        }

        setErrors(newErrors);
    }, [signupData]);

    const isFormValid = () => {
        return (
            !errors.name &&
            !errors.email &&
            !errors.password &&
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

    const GoogleIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );

    const FacebookIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
        </svg>
    );

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
                                <button type="button" className="social" onClick={handleGoogleAuth}>
                                    <GoogleIcon />
                                </button>
                                <button type="button" className="social" onClick={handleFacebookAuth}>
                                    <FacebookIcon />
                                </button>
                            </div>
                            <span>or use your email for registration</span>

                            <input
                                type="text"
                                placeholder="Name"
                                value={signupData.name}
                                onChange={(e) => setSignupData({ ...signupData, name: sanitizeInput(e.target.value, 'text') })}
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

                            {/* Select Buyer/Seller */}
                            <div className="flex justify-center gap-4 my-2">
                                <label>
                                    <input
                                            type="radio"
                                            name="accountType"
                                            value="LOCAL"
                                          checked={signupData.accountType === "LOCAL"}
                                            onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })}
                                        />
                                        Buyer
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="accountType"
                                        value="LOCAL"
                                        checked={signupData.role === "LOCAL"}
                                        onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })}
                                    />
                                    Seller
                                </label>
                            </div>

                            <div className="password-requirements">
                                <div className={signupData.password.length >= MIN_LENGTH ? "text-green-600" : "text-gray-600"}>
                                    {signupData.password.length >= MIN_LENGTH ? "✓" : "•"} {MIN_LENGTH} chars
                                </div>
                                <div className={reHasUpper.test(signupData.password) ? "text-green-600" : "text-gray-600"}>
                                    {reHasUpper.test(signupData.password) ? "✓" : "•"} Upper
                                </div>
                                <div className={reHasLower.test(signupData.password) ? "text-green-600" : "text-gray-600"}>
                                    {reHasLower.test(signupData.password) ? "✓" : "•"} Lower
                                </div>
                                <div className={reHasDigit.test(signupData.password) ? "text-green-600" : "text-gray-600"}>
                                    {reHasDigit.test(signupData.password) ? "✓" : "•"} Number
                                </div>
                                <div className={reHasSpecial.test(signupData.password) ? "text-green-600" : "text-gray-600"}>
                                    {reHasSpecial.test(signupData.password) ? "✓" : "•"} Special
                                </div>
                                {passwordTouched && errors.password && (
                                    <div className="text-sm text-red-600 mt-2">{errors.password}</div>
                                )}
                            </div>

                            <button type="submit" disabled={!isFormValid() || isSubmitting}>
                                {isSubmitting ? "Creating..." : "Sign Up"}
                            </button>
                        </form>
                    </div>

                    {/* Sign In */}
                    <div className="form-container sign-in-container">
                        <form onSubmit={twoFactorRequired ? handleVerify2FA : handleSignIn}>
                            <h1>Sign in</h1>
                            {!twoFactorRequired ? (
                                <>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
        button { border-radius: 20px; border: 1px solid #FF4B2B; background-color: #FF4B2B; color: #FFFFFF; font-size: 12px; font-weight: bold; padding: 12px 45px; letter-spacing: 1px; text-transform: uppercase; transition: transform 80ms ease-in; }
        button:active { transform: scale(0.95); }
        button:focus { outline: none; }
        button.ghost { background-color: transparent; border-color: #FFFFFF; }
        .social-container { margin: 15px 0; display: flex; gap: 10px; justify-content: center; }
        .social { border: 1px solid #ddd; border-radius: 50%; display: inline-flex; justify-content: center; align-items: center; height: 36px; width: 36px; background-color: #fff; cursor: pointer; transition: all 0.3s ease; }
        .social:hover { background-color: #f5f5f5; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .password-requirements { margin: 8px 0 12px 0; text-align: left; font-size: 11px; line-height: 1.3; display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        form { background-color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 50px; height: 100%; text-align: center; }
        input { background-color: #eee; border: none; padding: 12px 15px; margin: 8px 0; width: 100%; }
        .container { background-color: #fff; border-radius: 10px; box-shadow: 0 14px 28px rgba(0,0,0,0.25),0 10px 10px rgba(0,0,0,0.22); position: relative; overflow: hidden; width: 768px; max-width: 100%; min-height: 480px; }
        .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
        .sign-in-container { left: 0; width: 50%; z-index: 2; }
        .container.right-panel-active .sign-in-container { transform: translateX(100%); }
        .sign-up-container { left: 0; width: 50%; opacity: 0; z-index: 1; }
        .container.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; }
        @keyframes show { 0% { opacity: 0; transform: scale(0.9);} 100% { opacity: 1; transform: scale(1);} }
        .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
        .container.right-panel-active .overlay-container{ transform: translateX(-100%); }
        .overlay { background: #FF416C; background: -webkit-linear-gradient(to right, #FF4B2B, #FF416C); background: linear-gradient(to right, #FF4B2B, #FF416C); background-repeat: no-repeat; background-size: cover; background-position: 0 0; color: #FFFFFF; position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
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
