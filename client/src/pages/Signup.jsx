import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header.jsx";

export default function Signup() {
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();

  // Regex rules
  const MIN_LENGTH = 8;
  const reHasUpper = /[A-Z]/;
  const reHasLower = /[a-z]/;
  const reHasDigit = /[0-9]/;
  const reHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const signUpButton = document.getElementById("signUp");
    const signInButton = document.getElementById("signIn");
    const container = document.getElementById("container");

    if (signUpButton && signInButton && container) {
      signUpButton.addEventListener("click", () => {
        container.classList.add("right-panel-active");
      });

      signInButton.addEventListener("click", () => {
        container.classList.remove("right-panel-active");
      });
    }
  }, []);

  // validate fields whenever signupData changes
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
        body: JSON.stringify({ ...signupData, accountType: "USER" }),
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
          token: data.accessToken ?? data.token ?? null,
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

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: loginData.email,
          token: data.accessToken ?? data.token ?? null,
        })
      );

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(err.message || "Error while signing in");
    } finally {
      setLoginSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* <Header /> */}

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
              <span>or use your email for registration</span>

              <input
                type="text"
                placeholder="Name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
              />
              {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}

              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
              {errors.email && <div className="text-sm text-red-600">{errors.email}</div>}

              <input
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                onBlur={() => setPasswordTouched(true)}
              />

              <div className="mt-2 mb-4 text-sm text-left">
                <div className={signupData.password.length >= MIN_LENGTH ? "text-green-600" : "text-gray-600"}>
                  {signupData.password.length >= MIN_LENGTH ? "✓" : "•"} At least {MIN_LENGTH} characters
                </div>
                <div className={reHasUpper.test(signupData.password) ? "text-green-600" : "text-gray-600"}>
                  {reHasUpper.test(signupData.password) ? "✓" : "•"} Uppercase letter
                </div>
                <div className={reHasLower.test(signupData.password) ? "text-green-600" : "text-gray-600"}>
                  {reHasLower.test(signupData.password) ? "✓" : "•"} Lowercase letter
                </div>
                <div className={reHasDigit.test(signupData.password) ? "text-green-600" : "text-gray-600"}>
                  {reHasDigit.test(signupData.password) ? "✓" : "•"} Number
                </div>
                <div className={reHasSpecial.test(signupData.password) ? "text-green-600" : "text-gray-600"}>
                  {reHasSpecial.test(signupData.password) ? "✓" : "•"} Special character
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
            <form onSubmit={handleSignIn}>
              <h1>Sign in</h1>
              <span>or use your account</span>
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
              {loginError && <div className="text-sm text-red-600 mb-2">{loginError}</div>}
              <button type="submit" disabled={loginSubmitting}>
                {loginSubmitting ? "Signing In..." : "Sign In"}
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

      {/* Stilurile inline (rămân neschimbate) */}
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
        form { background-color: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 50px; height: 100%; text-align: center; }
        input { background-color: #eee; border: none; padding: 12px 15px; margin: 8px 0; width: 100%; }
        .container { background-color: #fff; border-radius: 10px; box-shadow: 0 14px 28px rgba(0,0,0,0.25),0 10px 10px rgba(0,0,0,0.22); position: relative; overflow: hidden; width: 768px; max-width: 100%; min-height: 480px; }
        .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
        .sign-in-container { left: 0; width: 50%; z-index: 2; }
        .container.right-panel-active .sign-in-container { transform: translateX(100%); }
        .sign-up-container { left: 0; width: 50%; opacity: 0; z-index: 1; }
        .container.right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; }
        @keyframes show { 0%,49.99%{opacity:0;z-index:1;} 50%,100%{opacity:1;z-index:5;} }
        .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; }
        .container.right-panel-active .overlay-container { transform: translateX(-100%); }
        .overlay { background: linear-gradient(to right, #FF4B2B, #FF416C); background-repeat: no-repeat; background-size: cover; background-position: 0 0; color: #FFFFFF; position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
        .container.right-panel-active .overlay { transform: translateX(50%); }
        .overlay-panel { position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; text-align: center; top: 0; height: 100%; width: 50%; transform: translateX(0); transition: transform 0.6s ease-in-out; }
        .overlay-left { transform: translateX(-20%); }
        .container.right-panel-active .overlay-left { transform: translateX(0); }
        .overlay-right { right: 0; transform: translateX(0); }
        .container.right-panel-active .overlay-right { transform: translateX(20%); }
      `}</style>
    </div>
  );
}
