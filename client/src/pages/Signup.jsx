import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecurity } from '../hooks/useSecurity.js';
import {OAuthButton} from "../utils/OAuthButton.jsx";
import {useAuthApi} from "../context/apiAuthContext.jsx";

export default function Signup() {
    const [rightPanelActive, setRightPanelActive] = useState(false);
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
    const MIN_LENGTH = 8;
    // Common public email providers whitelist
    const allowedEmailDomains = new Set([
        'gmail.com','googlemail.com','yahoo.com','yahoo.co.uk','outlook.com','hotmail.com','live.com','msn.com','aol.com','icloud.com','me.com','protonmail.com','mail.com','zoho.com','yandex.com','gmx.com','fastmail.com','qq.com','163.com','126.com','sina.com'
    ]);

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

    // Use React state to control overlay/panel visibility (more reliable than manual DOM listeners)
    useEffect(() => {
        console.log('[Signup.jsx] rightPanelActive =', rightPanelActive);
    }, [rightPanelActive]);

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

    // Update client-side password requirement indicators immediately
    useEffect(() => {
        setPasswordRequirements(validatePasswordClient(signupData.password || ""));
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
        } else {
            // enforce allowed domains for common public email providers
            const domain = signupData.email.trim().split('@').pop().toLowerCase();
            if (!allowedEmailDomains.has(domain)) {
                newErrors.email = "Please use a common email provider (e.g. gmail.com, yahoo.com)";
            }
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
            
            const res = await api.post('/api/auth/signup', signupData, { noAuth: true });
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
            const errorMessage = typeof err.response?.data === 'string' 
                ? err.response.data 
                : (err.response?.data?.message || err.message || "Error while signing up");
            alert(errorMessage);
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
            
            const res = await api.post('/api/auth/signin', loginData, { noAuth: true });
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
            
            const res = await api.post('/api/auth/verify-2fa', {
                userId: pendingUserId.toString(),
                code: twoFactorCode
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
        window.location.href = "/oauth2/authorization/google";
    };

    const handleFacebookAuth = () => {
        console.log("Facebook authentication clicked");
    };

    // Enhanced back behaviour: try history, fallback to home
    const handleBack = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            // prefer react-router navigate to go back
            navigate(-1);
        } catch (err) {
            if (window.history && window.history.length > 1) window.history.back();
            else navigate('/');
        }
    };

    // Allow Escape key to trigger back navigation
    useEffect(() => {
        const onKey = (ev) => {
            if (ev.key === 'Escape') handleBack();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50 text-black">
            <div className="absolute inset-0 -z-10">
                <div className="animate-blob bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 opacity-12 blur-3xl absolute -left-20 -top-32 w-96 h-96 rounded-full"></div>
                <div className="animate-blob2 bg-gradient-to-r from-cyan-200 to-indigo-200 opacity-10 blur-2xl absolute right-0 top-10 w-72 h-72 rounded-full"></div>
                <div className="absolute inset-0 bg-gray-50/40"></div>
            </div>

            <div className="absolute top-4 left-4">
                <button
                    onClick={handleBack}
                    aria-label="Go back"
                    title="Go back (Esc)"
                    className="flex items-center space-x-2 text-white/90 hover:text-white transition focus:outline-none"
                >
                    <span className="flex items-center gap-3 px-4 py-2 rounded-full brand-btn transform transition hover:scale-105 focus:ring-2 focus:ring-cyan-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-base font-semibold">Back</span>
                    </span>
                </button>
            </div>

            <div className="w-full max-w-6xl p-8">
                <div id="container" className={`relative mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200 ${rightPanelActive ? ' right-panel-active' : ''}`}>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-0 min-h-[620px]">
                        {/* Sign Up Panel */}
                        <div className="p-12 flex flex-col justify-center items-stretch space-y-6 sign-up-container relative text-black">
                            <div className="mb-4">
                                <h2 className="text-3xl font-extrabold text-black">Create account</h2>
                                <p className="text-sm text-gray-600 mt-2">Join CraftHub — build, sell and explore</p>
                            </div>

                            <div className="social-container flex gap-3">
                                <OAuthButton provider={"google"} />
                            </div>

                            <form onSubmit={handleSignUp} noValidate className="mt-2 flex flex-col gap-3">
                                <input
                                    className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500"
                                    type="text"
                                    placeholder="Full name"
                                    value={signupData.name}
                                    onChange={(e) => setSignupData({ ...signupData, name: sanitizeInput(e.target.value, 'name') })}
                                />
                                {errors.name && <div className="text-sm text-red-400">{errors.name}</div>}

                                <input
                                    className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500"
                                    type="email"
                                    placeholder="Email"
                                    value={signupData.email}
                                    onChange={(e) => setSignupData({ ...signupData, email: sanitizeInput(e.target.value, 'email') })}
                                />
                                {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}

                                <input
                                    className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500"
                                    type="password"
                                    placeholder="Create a password"
                                    value={signupData.password}
                                    onChange={(e) => setSignupData({ ...signupData, password: sanitizeInput(e.target.value, 'password') })}
                                    onBlur={() => setPasswordTouched(true)}
                                />

                                <div className="flex gap-3 text-xs">
                                    <div className={passwordRequirements.length ? 'text-green-300' : 'text-gray/70'}>● 12+</div>
                                    <div className={passwordRequirements.upper ? 'text-green-300' : 'text-gray/70'}>● Upper</div>
                                    <div className={passwordRequirements.number ? 'text-green-300' : 'text-gray/70'}>● Number</div>
                                    <div className={passwordRequirements.special ? 'text-green-300' : 'text-gray/70'}>● Special</div>
                                </div>

                                {isValidatingPassword && <div className="text-sm text-cyan-200">Validating password...</div>}
                                {passwordValidationErrors.length > 0 && (
                                    <div className="text-sm text-red-300">
                                        {passwordValidationErrors.map((err, i) => <div key={i}>{err}</div>)}
                                    </div>
                                )}

                                <div className="flex gap-3 justify-center mt-1">
                                    <label className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${signupData.accountType === 'BUYER' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                        <input type="radio" name="accountType" value="BUYER" checked={signupData.accountType === 'BUYER'} onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })} className="hidden" />
                                        <span>Buyer</span>
                                    </label>
                                    <label className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${signupData.accountType === 'SELLER' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                        <input type="radio" name="accountType" value="SELLER" checked={signupData.accountType === 'SELLER'} onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })} className="hidden" />
                                        <span>Seller</span>
                                    </label>
                                </div>

                                {passwordTouched && errors.password && <div className="text-sm text-red-400">{errors.password}</div>}

                                <button disabled={!isFormValid() || isSubmitting} className="mt-3 px-6 py-3 rounded-2xl brand-btn text-white font-semibold shadow-lg disabled:opacity-50">
                                    {isSubmitting ? 'Creating...' : 'Sign up'}
                                </button>

                                {/* in-panel toggle removed; overlay CTA will handle toggling */}
                            </form>
                        </div>

                        {/* Sign In Panel */}
                        <div className="p-12 flex flex-col justify-center items-stretch bg-transparent sign-in-container relative z-20 text-black">
                            <div className="mb-4">
                                <h2 className="text-3xl font-extrabold text-black">Welcome back</h2>
                                <p className="text-sm text-gray-600 mt-2">Sign in to access your account</p>
                            </div>

                            <form onSubmit={twoFactorRequired ? handleVerify2FA : handleSignIn} className="mt-2 flex flex-col gap-3">
                                {!twoFactorRequired && (
                                        <div className="social-container flex gap-3">
                                        <OAuthButton provider={"google"} />
                                    </div>
                                )}

                                {!twoFactorRequired ? (
                                    <>
                                        <input className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500" type="email" placeholder="Email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: sanitizeInput(e.target.value, 'email') })} required />
                                        <input className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500" type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: sanitizeInput(e.target.value, 'password') })} required />
                                    </>
                                ) : (
                                    <>
                                        <p className="mb-2 text-white/80">Enter your 2FA code</p>
                                        <input className="px-4 py-3 rounded-xl bg-white/6 border border-white/10 text-white placeholder:text-white/60" type="text" placeholder="6-digit code" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} required />
                                    </>
                                )}

                                {loginError && <div className="text-sm text-red-600">{loginError}</div>}

                                <button type="submit" disabled={loginSubmitting} className="relative z-50 mt-2 px-6 py-3 rounded-2xl brand-btn text-white font-semibold shadow-lg disabled:opacity-50">
                                    {loginSubmitting ? (twoFactorRequired ? 'Verifying...' : 'Signing in...') : (twoFactorRequired ? 'Verify 2FA' : 'Sign in')}
                                </button>

                                {/* in-panel toggle removed; overlay CTA will handle toggling */}
                            </form>
                        </div>
                        {/* Overlay container using wide sliding overlay (classic pattern) */}
                        <div className="overlay-container absolute top-0 right-0 h-full w-1/2 overflow-hidden pointer-events-none" aria-hidden={!rightPanelActive}>
                            <div className={`overlay absolute inset-0 h-full w-[200%] left-[-100%] flex ${rightPanelActive ? 'transform-on' : ''}`}>
                                <div className="overlay-panel overlay-left w-1/2 h-full flex items-center justify-center p-8 text-white" style={{ background: 'linear-gradient(135deg,#0b5e3a 0%,#1b8a5b 100%)' }}>
                                    <div className="text-center max-w-xs">
                                        <h3 className="text-2xl font-bold">Welcome Back!</h3>
                                        <p className="mt-3 text-sm text-white/80">To keep connected please login with your personal info</p>
                                        <button id="signIn" onClick={(e) => { e.stopPropagation(); setRightPanelActive(false); }} className="mt-8 px-8 py-3 rounded-full brand-btn pointer-events-auto hover:opacity-95">Sign In</button>
                                    </div>
                                </div>
                                <div className="overlay-panel overlay-right w-1/2 h-full flex items-center justify-center p-8 text-white" style={{ background: 'linear-gradient(135deg,#0b5e3a 0%,#2aa37a 100%)' }}>
                                    <div className="text-center max-w-xs">
                                        <h3 className="text-2xl font-bold">Hello, Friend!</h3>
                                        <p className="mt-3 text-sm text-white/80">Enter your details and start your journey with us</p>
                                        <button id="signUp" onClick={(e) => { e.stopPropagation(); setRightPanelActive(true); }} className="mt-8 px-8 py-3 rounded-full brand-btn pointer-events-auto hover:opacity-95">Sign Up</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                <style>{` 
                .animate-blob { animation: blob 12s infinite; }
                .animate-blob2 { animation: blob 10s infinite reverse; }
                @keyframes blob {
                    0% { transform: translateY(0px) scale(1); }
                    33% { transform: translateY(-20px) scale(1.1); }
                    66% { transform: translateY(10px) scale(0.9); }
                    100% { transform: translateY(0px) scale(1); }
                }
                #signUp, #signIn { cursor: pointer; }

                /* Panels: position them absolutely and slide horizontally. Start with sign-in visible. */
                #container { position: relative; }
                #container .sign-in-container, #container .sign-up-container {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    width: 50%;
                    transition: transform 0.6s cubic-bezier(.2,.8,.2,1), opacity 0.6s ease;
                    display: flex;
                    flex-direction: column;
                    padding: 2.5rem; /* keep existing spacing */
                }
                /* left panel (sign-in) occupies left half by default */
                #container .sign-in-container { left: 0; transform: translateX(0); z-index: 2; opacity: 1; }
                /* right panel (sign-up) sits on the right half by default (left:50%) */
                #container .sign-up-container { left: 50%; transform: translateX(0); z-index: 1; opacity: 0; pointer-events: none; }

                /* when active: slide sign-in out to the left and slide sign-up left into the empty space */
                #container.right-panel-active .sign-in-container { transform: translateX(-100%); opacity: 0; pointer-events: none; }
                /* move sign-up left by its full width (100% of its box) so it occupies the left half */
                #container.right-panel-active .sign-up-container { transform: translateX(-100%); opacity: 1; z-index: 3; pointer-events: auto; }

                /* ensure forms inside panels use full height and inner padding doesn't overflow */
                #container .sign-in-container form, #container .sign-up-container form { width: 100%; }

                /* Overlay container styles */
                /* overlay wide sliding pattern */
                .overlay-container { position: absolute; top: 0; right: 0; width: 50%; height: 100%; overflow: hidden; z-index: 6; }
                .overlay { position: absolute; left: -100%; top: 0; height: 100%; width: 200%; display: flex; transition: transform 0.6s cubic-bezier(.2,.8,.2,1); }
                .overlay.transform-on, .overlay.transform-on * { transition: transform 0.6s cubic-bezier(.2,.8,.2,1); }
                .overlay-panel { width: 50%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none; }
                .overlay-left { transform: translateX(0); }
                .overlay-right { transform: translateX(0); }
                /* slide the wide overlay half to the right when active */
                .overlay.transform-on { transform: translateX(50%); }
                .overlay-panel button { pointer-events: auto; }
                /* Brand button style used across CTAs */
                .brand-btn { background-color: #0b5e3a; color: #ffffff; border: 3px solid rgba(255,255,255,0.9); padding-left: 1rem; padding-right: 1rem; }
                .brand-btn:hover { filter: brightness(1.05); }
                .brand-btn:disabled { opacity: 0.5; transform: none; }
            `}</style>
        </div>
    );
}