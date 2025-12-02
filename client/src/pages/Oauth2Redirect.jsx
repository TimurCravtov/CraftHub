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
              
              if (userFromRes) {
                // User data already provided
                loginWithToken(accessToken, userFromRes);
              } else {
                // Fetch user data
                try {
                  const userObj = await getMe(accessToken);
                  console.log('✅ User data fetched after OAuth');
                  loginWithToken(accessToken, userObj);
                } catch (err) {
                  console.error('❌ Failed to fetch user data after OAuth:', err);
                  loginWithToken(accessToken, null);
                }
              }
              
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
      
      if (userFromRes) {
        // User data already provided
        loginWithToken(accessToken, userFromRes);
      } else {
        // Fetch user data
        try {
          const userObj = await getMe(accessToken);
          console.log('✅ User data fetched after OAuth 2FA');
          loginWithToken(accessToken, userObj);
        } catch (err) {
          console.error('❌ Failed to fetch user data after OAuth 2FA:', err);
          loginWithToken(accessToken, null);
        }
      }
      
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
      <div className="oauth-twofactor-page">
        <div className="modal-card modal-card--shadow-lg oauth-twofactor-card">
          <h2 className="page-title page-title--large">Two-Factor Authentication</h2>
          <p className="page-description">
            Enter the 6-digit code from your authenticator app
          </p>

          <form onSubmit={handleTwoFactorSubmit} className="form">
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="oauth-twofactor-input"
                autoFocus
              />
            </div>

            {error && (
              <div className="oauth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={twoFactorCode.length !== 6 || isVerifying}
              className="btn-primary oauth-submit"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
      <div className="oauth-loading">
        <Hourglass
            size={48}
            strokeWidth={1.5}
            className="oauth-spinner"
        />
        <div>Logging in {provider ? `using ${provider}` : ""}</div>
        {error && <div className="oauth-loading-error">{error}</div>}
      </div>
  );
};

export default OAuthCallback;
