import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecurity } from "../hooks/useSecurity.js";
import { OAuthButton } from "../utils/OAuthButton.jsx";
import { useAuthApi } from "../context/apiAuthContext.jsx";

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
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [copyMsg, setCopyMsg] = useState("");

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

    // Enhanced back behaviour: try history, fallback to home
    const handleBack = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            navigate(-1);
        } catch (err) {
            if (window.history && window.history.length > 1) window.history.back();
            else navigate('/');
        }
    };

    // Handle signup form submission
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!isFormValid() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const sanitizedData = sanitizeFormData(signupData);
            const response = await api.post('/api/auth/signup', sanitizedData, { noAuth: true });
            
            const data = response.data;
            const token = data.accessToken || data.token;
            
            if (token) {
                try {
                    const userObj = await getMe(token);
                    loginWithToken(token, userObj);
                } catch (err) {
                    loginWithToken(token, null);
                }
                navigate('/account');
            }
        } catch (error) {
            console.error('Signup error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Signup failed. Please try again.';
            setErrors(prev => ({ ...prev, password: errorMsg }));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle sign in form submission
    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginSubmitting(true);

        try {
            const response = await api.post('/api/auth/signin', loginData, { noAuth: true });
            
            // Check if 2FA is required
            if (response.status === 202 && response.data.twoFactorRequired) {
                setTwoFactorRequired(true);
                setPendingUserId(response.data.userId);
                setLoginSubmitting(false);
                return;
            }

            const data = response.data;
            const token = data.accessToken || data.token;
            
            if (token) {
                try {
                    const userObj = await getMe(token);
                    loginWithToken(token, userObj);
                } catch (err) {
                    loginWithToken(token, null);
                }
                navigate('/account');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoginSubmitting(false);
        }
    };

    // Handle 2FA verification
    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginSubmitting(true);

        try {
            const response = await api.post('/api/auth/verify-2fa', {
                userId: pendingUserId.toString(),
                code: twoFactorCode
            }, { noAuth: true });

            const { accessToken } = response.data;
            
            try {
                const userObj = await getMe(accessToken);
                loginWithToken(accessToken, userObj);
            } catch (err) {
                loginWithToken(accessToken, null);
            }
            
            navigate('/account');
        } catch (error) {
            console.error('2FA verification failed:', error);
            setLoginError(error.response?.data?.error || 'Invalid 2FA code. Please try again.');
        } finally {
            setLoginSubmitting(false);
        }
    };

  // NEW: password generator
  const generatePassword = (length = 14) => {
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const specials = "!@#$%^&*(),.?\":{}|<>";

    const all = lowers + uppers + nums + specials;

    // ensure at least one from each bucket
    const pick = (s) => s[Math.floor(Math.random() * s.length)];
    let pwd = [pick(lowers), pick(uppers), pick(nums), pick(specials)];

    for (let i = pwd.length; i < length; i++) {
      pwd.push(pick(all));
    }

    // shuffle
    for (let i = pwd.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
    }

    return pwd.join("");
  };

  const handleGeneratePassword = () => {
    const newPwd = generatePassword(14);
    setSignupData((prev) => ({ ...prev, password: newPwd }));
    setPasswordTouched(true);
    setShowSignupPassword(true);
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(signupData.password || "");
      setCopyMsg("Copied!");
      setTimeout(() => setCopyMsg(""), 1200);
    } catch (e) {
      setCopyMsg("Copy failed");
      setTimeout(() => setCopyMsg(""), 1200);
    }
  };

  const EyeIcon = ({ open }) =>
    open ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 12s3.5-7 10-7c2.8 0 5 1 6.6 2.3" />
        <path d="M22 12s-3.5 7-10 7c-2.8 0-5-1-6.6-2.3" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        <path d="M3 3l18 18" />
      </svg>
    );

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-5 h-5 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base font-semibold">Back</span>
          </span>
        </button>
      </div>

      <div className="w-full max-w-6xl p-8">
        <div
          id="container"
          className={`relative mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-200 ${
            rightPanelActive ? " right-panel-active" : ""
          }`}
        >
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
                  onChange={(e) => setSignupData({ ...signupData, name: sanitizeInput(e.target.value, "name") })}
                />
                {errors.name && <div className="text-sm text-red-400">{errors.name}</div>}

                <input
                  className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500"
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: sanitizeInput(e.target.value, "email") })}
                />
                {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}

                {/* Password with eye + generator */}
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 pr-24 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: sanitizeInput(e.target.value, "password") })
                    }
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="new-password"
                  />

                  {/* Eye toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    title={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showSignupPassword} />
                  </button>
                </div>

                {/* Generator actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:opacity-95"
                  >
                    Generate password
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    disabled={!signupData.password}
                    className="px-3 py-2 rounded-xl bg-gray-100 border border-gray-300 text-sm font-semibold text-gray-800 disabled:opacity-50"
                  >
                    Copy
                  </button>

                  {copyMsg && <span className="text-sm text-gray-600">{copyMsg}</span>}
                </div>

                <div className="flex gap-3 text-xs">
                  <div className={passwordRequirements.length ? "text-green-600" : "text-gray-400"}>● 8+</div>
                  <div className={passwordRequirements.upper ? "text-green-600" : "text-gray-400"}>● Upper</div>
                  <div className={passwordRequirements.number ? "text-green-600" : "text-gray-400"}>● Number</div>
                  <div className={passwordRequirements.special ? "text-green-600" : "text-gray-400"}>● Special</div>
                </div>

                {passwordTouched && errors.password && <div className="text-sm text-red-400">{errors.password}</div>}

                <div className="flex gap-3 justify-center mt-1">
                  <label
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                      signupData.accountType === "BUYER" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value="BUYER"
                      checked={signupData.accountType === "BUYER"}
                      onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })}
                      className="hidden"
                    />
                    <span>Buyer</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                      signupData.accountType === "SELLER" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value="SELLER"
                      checked={signupData.accountType === "SELLER"}
                      onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })}
                      className="hidden"
                    />
                    <span>Seller</span>
                  </label>
                </div>

                <button
                  disabled={!isFormValid() || isSubmitting}
                  className="mt-3 px-6 py-3 rounded-2xl brand-btn text-white font-semibold shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Sign up"}
                </button>
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
                    <input
                      className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500"
                      type="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: sanitizeInput(e.target.value, "email") })}
                      required
                    />
                    <input
                      className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500"
                      type="password"
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: sanitizeInput(e.target.value, "password") })}
                      required
                    />
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-gray-600">Enter your 2FA code</p>
                    <input
                      className="px-4 py-3 rounded-xl bg-gray-100 border border-gray-300 text-black placeholder:text-gray-500"
                      type="text"
                      placeholder="6-digit code"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      required
                    />
                  </>
                )}

                {loginError && <div className="text-sm text-red-600">{loginError}</div>}

                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="relative z-50 mt-2 px-6 py-3 rounded-2xl brand-btn text-white font-semibold shadow-lg disabled:opacity-50"
                >
                  {loginSubmitting
                    ? twoFactorRequired
                      ? "Verifying..."
                      : "Signing in..."
                    : twoFactorRequired
                    ? "Verify 2FA"
                    : "Sign in"}
                </button>
              </form>
            </div>

            {/* Overlay container using wide sliding overlay (classic pattern) */}
            <div
              className="overlay-container absolute top-0 right-0 h-full w-1/2 overflow-hidden pointer-events-none"
              aria-hidden={!rightPanelActive}
            >
              <div
                className={`overlay absolute inset-0 h-full w-[200%] left-[-100%] flex ${
                  rightPanelActive ? "transform-on" : ""
                }`}
              >
                <div
                  className="overlay-panel overlay-left w-1/2 h-full flex items-center justify-center p-8 text-white"
                  style={{ background: "linear-gradient(135deg,#0b5e3a 0%,#1b8a5b 100%)" }}
                >
                  <div className="text-center max-w-xs">
                    <h3 className="text-2xl font-bold">Welcome Back!</h3>
                    <p className="mt-3 text-sm text-white/80">To keep connected please login with your personal info</p>
                    <button
                      id="signIn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRightPanelActive(false);
                      }}
                      className="mt-8 px-8 py-3 rounded-full brand-btn pointer-events-auto hover:opacity-95"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
                <div
                  className="overlay-panel overlay-right w-1/2 h-full flex items-center justify-center p-8 text-white"
                  style={{ background: "linear-gradient(135deg,#0b5e3a 0%,#2aa37a 100%)" }}
                >
                  <div className="text-center max-w-xs">
                    <h3 className="text-2xl font-bold">Hello, Friend!</h3>
                    <p className="mt-3 text-sm text-white/80">Enter your details and start your journey with us</p>
                    <button
                      id="signUp"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRightPanelActive(true);
                      }}
                      className="mt-8 px-8 py-3 rounded-full brand-btn pointer-events-auto hover:opacity-95"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-blob {
          animation: blob 12s infinite;
        }
        .animate-blob2 {
          animation: blob 10s infinite reverse;
        }
        @keyframes blob {
          0% {
            transform: translateY(0px) scale(1);
          }
          33% {
            transform: translateY(-20px) scale(1.1);
          }
          66% {
            transform: translateY(10px) scale(0.9);
          }
          100% {
            transform: translateY(0px) scale(1);
          }
        }
        #signUp,
        #signIn {
          cursor: pointer;
        }

        /* Panels: position them absolutely and slide horizontally. Start with sign-in visible. */
        #container {
          position: relative;
        }
        #container .sign-in-container,
        #container .sign-up-container {
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.6s ease;
          display: flex;
          flex-direction: column;
          padding: 2.5rem;
        }
        /* left panel (sign-in) occupies left half by default */
        #container .sign-in-container {
          left: 0;
          transform: translateX(0);
          z-index: 2;
          opacity: 1;
        }
        /* right panel (sign-up) sits on the right half by default (left:50%) */
        #container .sign-up-container {
          left: 50%;
          transform: translateX(0);
          z-index: 1;
          opacity: 0;
          pointer-events: none;
        }

        /* when active: slide sign-in out to the left and slide sign-up left into the empty space */
        #container.right-panel-active .sign-in-container {
          transform: translateX(-100%);
          opacity: 0;
          pointer-events: none;
        }
        /* move sign-up left by its full width (100% of its box) so it occupies the left half */
        #container.right-panel-active .sign-up-container {
          transform: translateX(-100%);
          opacity: 1;
          z-index: 3;
          pointer-events: auto;
        }

        /* ensure forms inside panels use full height and inner padding doesn't overflow */
        #container .sign-in-container form,
        #container .sign-up-container form {
          width: 100%;
        }

        /* Overlay container styles */
        /* overlay wide sliding pattern */
        .overlay-container {
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          overflow: hidden;
          z-index: 6;
        }
        .overlay {
          position: absolute;
          left: -100%;
          top: 0;
          height: 100%;
          width: 200%;
          display: flex;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .overlay.transform-on,
        .overlay.transform-on * {
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .overlay-panel {
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .overlay-left {
          transform: translateX(0);
        }
        .overlay-right {
          transform: translateX(0);
        }
        /* slide the wide overlay half to the right when active */
        .overlay.transform-on {
          transform: translateX(50%);
        }
        .overlay-panel button {
          pointer-events: auto;
        }
        /* Brand button style used across CTAs */
        .brand-btn {
          background-color: #0b5e3a;
          color: #ffffff;
          border: 3px solid rgba(255, 255, 255, 0.9);
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .brand-btn:hover {
          filter: brightness(1.05);
        }
        .brand-btn:disabled {
          opacity: 0.5;
          transform: none;
        }
      `}</style>
    </div>
  );
}
