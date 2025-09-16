import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Oauth2Redirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // Decodare simplă JWT pentru a extrage email și nume
      const payload = JSON.parse(atob(token.split(".")[1]));
      const email = payload.sub || "";
      const name = payload.name || email.split("@")[0]; // fallback dacă name nu există

      localStorage.setItem(
        "user",
        JSON.stringify({
          token,
          name,
          email,
          provider: "google",
        })
      );

      navigate("/"); // redirect către pagina principală
    } else {
      navigate("/login"); // dacă nu există token
    }
  }, [location, navigate]);

  return <div>Logging in...</div>;
}
