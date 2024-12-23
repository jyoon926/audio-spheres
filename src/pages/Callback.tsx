import axios from "axios";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Callback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const post = async () => {
      const clientId = import.meta.env.VITE_REACT_APP_SPOTIFY_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_REACT_APP_SPOTIFY_CLIENT_SECRET;
      const code = searchParams.get("code");
      const baseUrl = window.location.origin;
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        { code, redirect_uri: baseUrl + "/callback", grant_type: "authorization_code" },
        {
          headers: {
            Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const { access_token } = response.data;
      window.location.href = `${baseUrl}/?access_token=${access_token}`;
    };

    post();
  }, [searchParams]);

  return null;
}
