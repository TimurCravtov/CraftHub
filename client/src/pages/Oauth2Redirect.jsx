import { useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import { Hourglass } from 'lucide-react';
import {useAuthApi} from "../context/apiAuthContext.jsx";

const OAuthCallback = () => {

  const urlParams = new URLSearchParams(window.location.search);
  const { provider } = useParams();

  const navigate = useNavigate();
  const { api , getMe } = useAuthApi();


  useEffect(() => {

    const code = urlParams.get("code");

    if (code) {
      api.post(`api/oauth/${provider}`, { code }, {noAuth: true})
          .then(async res => {
            const {accessToken, refreshToken} = res.data;
            localStorage.setItem("accessToken", accessToken);
            // localStorage.setItem("refreshToken", refreshToken);
            const me = await getMe(accessToken);
            console.log(me);
            navigate("/");
          })
          .catch(err => {
            console.error("OAuth failed", err);
          });
    }
  }, [navigate]);

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
