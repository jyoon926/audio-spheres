/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RoutesProps } from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-js";

interface AuthState {
  user: SpotifyApi.UserObjectPrivate | null;
  token: string | null;
  isAuthenticated: boolean;
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs | null;
}

interface AuthContextType extends AuthState {
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const INITIAL_STATE: AuthState = {
  user: null,
  token: localStorage.getItem("access_token"),
  isAuthenticated: false,
  spotifyApi: null,
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: RoutesProps) => {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const initializeSpotifyApi = useCallback((accessToken: string) => {
    const spotify = new SpotifyWebApi();
    spotify.setAccessToken(accessToken);
    return spotify;
  }, []);

  const fetchUser = useCallback(async (accessToken: string) => {
    if (state.user) return;
    try {
      const spotifyApi = state.spotifyApi || initializeSpotifyApi(accessToken);
      const user = await spotifyApi.getMe();
      updateState({ user, spotifyApi, isAuthenticated: true });
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [state.spotifyApi]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      updateState({ token: accessToken });
      fetchUser(accessToken);
      window.history.replaceState({}, document.title, "/");
    } else if (state.token) {
      fetchUser(state.token);
    } else {
      setLoading(false);
    }
  }, [state.token, fetchUser, updateState]);

  const login = useCallback(() => {
    const clientId = import.meta.env.VITE_REACT_APP_SPOTIFY_CLIENT_ID;
    const baseUrl = window.location.origin;
    const scope = "playlist-modify-public playlist-modify-private";
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${baseUrl}/callback`;
    window.location.href = authUrl;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    updateState({ token: null, user: null, spotifyApi: null, isAuthenticated: false });
  }, []);

  const contextValue = useMemo(() => (
    { ...state, loading, login, logout }
  ), [state, loading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
