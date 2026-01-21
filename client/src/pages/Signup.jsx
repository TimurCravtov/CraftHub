import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecurity } from "../hooks/useSecurity.js";
import { OAuthButton } from "../utils/OAuthButton.jsx";
import { useAuthApi } from "../context/apiAuthContext.jsx";

export default function Signup() {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "BUYER",
  });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser, getMe, api, loginWithToken } = useAuthApi();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [passwordValidationErrors, setPasswordValidationErrors] = useState([]);
  const [isValidatingPassword, setIsValidatingPassword] = useState(false);

  const [pendingUserId, setPendingUserId] = useState(null);

  // --- State-uri pentru vizibilitate parolă ---
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const navigate = useNavigate();
  const { sanitizeInput, validateInput, sanitizeFormData } = useSecurity();

  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_LENGTH = 12;

  const validatePasswordClient = (password) => {
    const requirements = {
      length: password.length >= MIN_LENGTH,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return requirements;
  };

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const DEFAULT_PWD_LEN = 16;
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const DIGITS = "0123456789";
  const SPECIAL = "!@#$%^&*()-_=+[]{};:,.<>?";

  const secureRandomInt = (max) => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  };

  const shuffleString = (str) => {
    const a = str.split("");
    for (let i = a.length - 1; i > 0; i--) {
      const j = secureRandomInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.join("");
  };

  const generateStrongPassword = (len = DEFAULT_PWD_LEN) => {
    const length = Math.max(len, MIN_LENGTH);
    const all = UPPER + LOWER + DIGITS + SPECIAL;
    let pwd =
      UPPER[secureRandomInt(UPPER.length)] +
      LOWER[secureRandomInt(LOWER.length)] +
      DIGITS[secureRandomInt(DIGITS.length)] +
      SPECIAL[secureRandomInt(SPECIAL.length)];

    while (pwd.length < length) {
      pwd += all[secureRandomInt(all.length)];
    }
    return shuffleString(pwd);
  };

  const handleGeneratePassword = async () => {
    const pwd = generateStrongPassword(16);
    setSignupData((prev) => ({ ...prev, password: pwd }));
    setPasswordTouched(true);
    const req = validatePasswordClient(pwd);
    setPasswordRequirements(req);

    try {
      await navigator.clipboard.writeText(pwd);
    } catch { /* ignore */ }
  };

  const handleCopyPassword = async () => {
    if (!signupData.password) return;
    try {
      await navigator.clipboard.writeText(signupData.password);
    } catch { /* ignore */ }
  };

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

  const validatePasswordWithBackend = async (password) => {
    return true; 
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validatePasswordWithBackend(signupData.password);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [signupData.password, signupData.email, signupData.name]);

  useEffect(() => {
    const newErrors = { name: "", email: "", password: "" };
    if (!signupData.name.trim()) newErrors.name = "Name is required";
    if (!signupData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!reEmail.test(signupData.email.trim())) {
      newErrors.email = "Invalid email";
    }
    const pwd = signupData.password || "";
    if (!pwd) newErrors.password = "Password is required";
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
      const res = await api.post("/api/auth/signup", signupData, { noAuth: true });
      const data = res.data;
      const token = data.accessToken || data.token;
      try {
        const userObj = await getMe(token);
        loginWithToken(token, userObj);
      } catch (err) {
        loginWithToken(token, null);
      }
      navigate("/");
    } catch (err) {
      const errorMessage = typeof err.response?.data === "string" ? err.response.data : err.response?.data?.message || err.message || "Error while signing up";
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
      const res = await api.post("/api/auth/signin", loginData, { noAuth: true });
      if (res.status === 202 && res.data.twoFactorRequired) {
        setTwoFactorRequired(true);
        setPendingUserId(res.data.userId);
        return;
      }
      const data = res.data;
      const token = data.accessToken || data.token;
      try {
        const userObj = await getMe(token);
        loginWithToken(token, userObj);
      } catch (err) {
        loginWithToken(token, null);
      }
      navigate("/");
    } catch (err) {
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
      const res = await api.post("/api/auth/verify-2fa", { userId: pendingUserId.toString(), code: twoFactorCode }, { noAuth: true });
      const { accessToken } = res.data;
      try {
        const userObj = await getMe(accessToken);
        loginWithToken(accessToken, userObj);
      } catch (err) {
        loginWithToken(accessToken, null);
      }
      navigate("/");
    } catch (err) {
      setLoginError(err.response?.data?.error || err.message || "Invalid 2FA code");
    } finally {
      setLoginSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="absolute top-4 left-4">
        <button onClick={() => window.history.back()} className="flex items-center space-x-2 text-black hover:text-blue-600 border-none bg-transparent p-0">
          <span>Back</span>
        </button>
      </div>

      <div className="flex justify-center items-center mt-10">
        <div className="container" id="container">
          {/* Sign Up */}
          <div className="form-container sign-up-container">
            <form onSubmit={handleSignUp} noValidate>
              <h1>Create Account</h1>
              <div className="social-container"><OAuthButton provider={"google"} /></div>
              <span>or use your email for registration</span>

              <input
                type="text"
                placeholder="Name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: sanitizeInput(e.target.value, "name") })}
              />
              {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}

              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: sanitizeInput(e.target.value, "email") })}
              />
              {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}

              {/* Parola Sign Up cu ochi */}
              <div className="password-wrapper">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => {
                    const val = sanitizeInput(e.target.value, "password");
                    setSignupData({ ...signupData, password: val });
                    const req = validatePasswordClient(val);
                    setPasswordRequirements(req);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                />
                <button 
                  type="button" 
                  className="eye-button" 
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                >
                  {showSignupPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="pwd-actions">
                <button type="button" onClick={handleGeneratePassword}>Generate</button>
                <button type="button" onClick={handleCopyPassword} disabled={!signupData.password}>Copy</button>
              </div>

              <div className="password-requirements">
                <div className={passwordRequirements.length ? "text-green-600" : "text-gray-600"}>{passwordRequirements.length ? "✓" : "•"} 12 chars</div>
                <div className={passwordRequirements.upper ? "text-green-600" : "text-gray-600"}>{passwordRequirements.upper ? "✓" : "•"} Upper</div>
                <div className={passwordRequirements.lower ? "text-green-600" : "text-gray-600"}>{passwordRequirements.lower ? "✓" : "•"} Lower</div>
                <div className={passwordRequirements.number ? "text-green-600" : "text-gray-600"}>{passwordRequirements.number ? "✓" : "•"} Number</div>
                <div className={passwordRequirements.special ? "text-green-600" : "text-gray-600"}>{passwordRequirements.special ? "✓" : "•"} Special</div>
              </div>

              {isValidatingPassword && <div className="text-sm text-blue-600 mb-2">Validating...</div>}

              <div className="account-type-container">
                <label className={`account-type-option ${signupData.accountType === "BUYER" ? "selected" : ""}`}>
                  <input type="radio" name="accountType" value="BUYER" checked={signupData.accountType === "BUYER"} onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })} />
                  <span>BUYER</span>
                </label>
                <label className={`account-type-option ${signupData.accountType === "SELLER" ? "selected" : ""}`}>
                  <input type="radio" name="accountType" value="SELLER" checked={signupData.accountType === "SELLER"} onChange={(e) => setSignupData({ ...signupData, accountType: e.target.value })} />
                  <span>SELLER</span>
                </label>
              </div>

              <button type="submit" disabled={!isFormValid() || isSubmitting}>{isSubmitting ? "Creating..." : "Sign Up"}</button>
            </form>
          </div>

          {/* Sign In */}
          <div className="form-container sign-in-container">
            <form onSubmit={twoFactorRequired ? handleVerify2FA : handleSignIn}>
              <h1>Sign in</h1>
              {!twoFactorRequired && <div className="social-container"><OAuthButton provider={"google"} /></div>}
              {!twoFactorRequired ? (
                <>
                  <span>or use your account</span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: sanitizeInput(e.target.value, "email") })}
                    required
                  />
                  {/* Parola Sign In cu ochi */}
                  <div className="password-wrapper">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: sanitizeInput(e.target.value, "password") })}
                      required
                    />
                    <button 
                      type="button" 
                      className="eye-button" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-2 text-gray-700">Enter your 2FA code</p>
                  <input type="text" placeholder="6-digit code" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} required />
                </>
              )}
              {loginError && <div className="text-sm text-red-600 mb-2">{loginError}</div>}
              <button type="submit" disabled={loginSubmitting}>
                {loginSubmitting ? (twoFactorRequired ? "Verifying..." : "Signing In...") : (twoFactorRequired ? "Verify 2FA" : "Sign In")}
              </button>
            </form>
          </div>

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

      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');
        * { box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; }
        h1 { font-weight: bold; margin: 0; }
        p { font-size: 14px; font-weight: 100; line-height: 20px; letter-spacing: 0.5px; margin: 20px 0 30px; }
        span { font-size: 12px; }

        button {
          border-radius: 20px;
          border: 1px solid #2563EB;
          background-color: #2563EB;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: bold;
          padding: 12px 45px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: transform 80ms ease-in;
          cursor: pointer;
        }
        button:active { transform: scale(0.95); }
        button:focus { outline: none; }
        button.ghost { background-color: transparent; border-color: #FFFFFF; }
        button:disabled { background-color: #94A3B8; border-color: #94A3B8; cursor: not-allowed; }

        /* Stiluri noi pentru ochișor */
        .password-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .eye-button {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          padding: 0;
          color: #666;
          font-size: 18px;
          width: auto;
          height: auto;
          text-transform: none;
        }
        .eye-button:active { transform: none; }

        .social-container { margin: 15px 0; display: flex; gap: 10px; justify-content: center; }
        .pwd-actions { width: 100%; display: flex; gap: 10px; margin-top: 6px; }
        .pwd-actions button { flex: 1; padding: 10px 12px; }

        .password-requirements {
          margin: 8px 0 12px 0;
          text-align: left;
          font-size: 11px;
          line-height: 1.3;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }

        .account-type-container { display: flex; gap: 20px; justify-content: center; margin: 10px 0 15px 0; }
        .account-type-option { display: flex; align-items: center; gap: 5px; cursor: pointer; padding: 5px 10px; border-radius: 15px; border: 1px solid #ddd; background-color: #fff; }
        .account-type-option.selected { background-color: #EBF4FF; border-color: #2563EB; color: #2563EB; }
        .account-type-option input[type="radio"] { margin: 0; width: auto; }

        form { background-color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; height: 100%; text-align: center; }
        input { background-color: #eee; border: none; padding: 12px 15px; margin: 6px 0; width: 100%; }

        .container { background-color: #fff; border-radius: 10px; box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22); position: relative; overflow: hidden; width: 900px; max-width: 100%; min-height: 580px; }
        .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
        .sign-in-container { left: 0; width: 50%; z-index: 2; }
        .container.right-panel-active .sign-in-container { transform: translateX(100%); }
        .sign-up-container { left: 0; width: 50%; opacity: 0; z-index: 1; }
        .container.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; }
        @keyframes show { 0%, 49.99% { opacity: 0; z-index: 1; } 50%, 100% { opacity: 1; z-index: 5; } }
        .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
        .container.right-panel-active .overlay-container { transform: translateX(-100%); }
        .overlay { background: linear-gradient(to right, #2563EB, #1D4ED8); position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: transform 0.6s ease-in-out; color: #FFFFFF; }
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