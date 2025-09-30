import { useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import { Hourglass } from 'lucide-react';
import {useAuthApi} from "../context/apiAuthContext.jsx";

const OAuthCallback = () => {

  const urlParams = new URLSearchParams(window.location.search);
  const { provider } = useParams();

  const navigate = useNavigate();
  const { api , getMe, login } = useAuthApi();


  useEffect(() => {

    const code = urlParams.get("code");

    if (code) {
      api.post(`api/oauth/${provider}`, { code }, {noAuth: true})
          .then(async res => {
            const {accessToken, refreshToken, user: userFromRes} = res.data;
            // persist and update context via login()
            const userObj = userFromRes || (await getMe(accessToken).catch(() => null));
            login(accessToken, userObj);
            navigate("/");
          })
          .catch(err => {
            console.error("OAuth failed", err);
          });
    }
  }, [api, provider, navigate, getMe, login]);

  return (
      <div className="h-screen flex flex-col justify-center items-center gap-3 bg-dark4back text-notBrightWhite text-lg font-medium">
        <Hourglass
            size={48}
            strokeWidth={1.5}
            className="text-notBrightWhite animate-spin-accelerate"
        />
        <div>Logging in {provider ? `using ${provider}` : ""}</div>
      </div>
  );
};

export default OAuthCallback;
