import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import { Hourglass } from 'lucide-react';
import {useAuthApi} from "../context/apiAuthContext.jsx";

const OAuthCallback = () => {

  const urlParams = new URLSearchParams(window.location.search);
  const { provider } = useParams();

  const navigate = useNavigate();
  const { api , getMe, loginWithToken } = useAuthApi();
  
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);


  useEffect(() => {

    const code = urlParams.get("code");

    if (code && !twoFactorRequired) {
      api.post(`api/oauth/${provider}`, { code }, {noAuth: true})
          .then(async res => {
            // Check if 2FA is required
            if (res.status === 202 && res.data.twoFactorRequired) {
              setTwoFactorRequired(true);
              setTwoFactorData({
                email: res.data.email,
                provider: res.data.provider
              });
            } else {
              // Normal login flow
              const {accessToken, refreshToken, user: userFromRes} = res.data;
              const userObj = userFromRes || (await getMe(accessToken).catch(() => null));
              loginWithToken(accessToken, userObj);
              navigate("/");
            }
          })
          .catch(err => {
            console.error("OAuth failed", err);
            setError("OAuth authentication failed. Please try again.");
          });
    }
  }, [api, provider, navigate, getMe, loginWithToken, twoFactorRequired]);

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      const res = await api.post('/api/oauth/verify-2fa', {
        email: twoFactorData.email,
        provider: twoFactorData.provider,
        code: twoFactorCode
      }, { noAuth: true });

      const { accessToken, user: userFromRes } = res.data;
      const userObj = userFromRes || (await getMe(accessToken).catch(() => null));
      loginWithToken(accessToken, userObj);
      navigate("/");
    } catch (err) {
      console.error("2FA verification failed", err);
      setError(err.response?.data?.message || "Invalid 2FA code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (twoFactorRequired) {
    return (
      <div className="h-screen flex flex-col justify-center items-center gap-6 bg-dark4back text-notBrightWhite">
        <div className="bg-dark3back p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Two-Factor Authentication</h2>
          <p className="text-gray-400 mb-6 text-center">
            Enter the 6-digit code from your authenticator app
          </p>
          
          <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 bg-dark2back border border-gray-700 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={twoFactorCode.length !== 6 || isVerifying}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
      <div className="h-screen flex flex-col justify-center items-center gap-3 bg-dark4back text-notBrightWhite text-lg font-medium">
        <Hourglass
            size={48}
            strokeWidth={1.5}
            className="text-notBrightWhite animate-spin-accelerate"
        />
        <div>Logging in {provider ? `using ${provider}` : ""}</div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </div>
  );
};

export default OAuthCallback;
