import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback,
    useEffect,
} from "react";
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";

const AuthApiContext = createContext(null);

export function AuthApiProvider({ children }) {
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [user, setUser] = useState(null);

    /**
     * Refresh access token using secure HttpOnly cookie
     * (refresh token lives in cookie, not in JS)
     */
    const refreshAccessToken = useCallback(
        async (failedRequest = "null") => {
            try {
                const res = await api.post(
                    "/api/auth/refresh",
                    {},
                    { withCredentials: true, noAuth: true }
                );

                const { accessToken } = res.data;
                setAccessToken(accessToken);

                // attach new token to the failed request
                failedRequest.response.config.headers[
                    "Authorization"
                    ] = `Bearer ${accessToken}`;

                // refresh user profile silently
                // getMe(accessToken).catch(() => {});
            } catch (err) {
                console.error("Token refresh failed:", err);
                logout();
                throw err;
            }
        },
        []
    );

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: "https://localhost:8443",  // Removed trailing slash
            withCredentials: true, // send cookies automatically
            timeout: 10000, // 10 second timeout
        });

        instance.interceptors.request.use((config) => {
            console.log('Making request to:', config.baseURL + config.url);
            if (!config.noAuth && accessToken) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        }, (error) => {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        });

        instance.interceptors.response.use(
            (response) => {
                console.log('Response received:', response.status);
                return response;
            },
            (error) => {
                console.error('Response error:', error);
                console.error('Error config:', error.config);
                console.error('Error response:', error.response);
                return Promise.reject(error);
            }
        );

        // Set up refresh interceptor inside useMemo - but skip it for noAuth requests
        createAuthRefreshInterceptor(instance, refreshAccessToken, {
            statusCodes: [401],
            skipAuthRefresh: (failedRequest) => {
                // Skip refresh for requests marked as noAuth
                return failedRequest?.config?.noAuth === true;
            }
        });

        return instance;
    }, [accessToken, refreshAccessToken]);

    /**
     * Login: server should set refresh token in secure cookie,
     * we only keep the access token in memory.
     */
    const login = useCallback(async (credentials) => {
        try {
            const res = await api.post("/api/v1/auth/login", credentials, {
                noAuth: true,
            });

            const { accessToken, user } = res.data;
            setAccessToken(accessToken);
            setUser(user);
            return user;
        } catch (err) {
            console.error("Login failed", err);
            throw err;
        }
    }, [api]);

    /**
     * Logout: clear memory + tell backend to clear cookie
     */
    const logout = useCallback(async () => {
        try {
            await api.post("/api/auth/logout", {}, { noAuth: true });
        } catch (err) {
            console.warn("Logout request failed", err);
        }
        setAccessToken(null);
        setUser(null);
    }, [api]);

    /**
     * Get current user profile
     */
    const getMe = useCallback(
        async (token) => {
            try {
                const headers = {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                };

                const res = await api.get("/api/users/me", { headers });
                setUser(res.data);
                return res.data;
            } catch (err) {
                console.error("getMe failed", err);
                throw err;
            }
        },
        [api]
    );

    /**
     * On mount: try to fetch new access token
     * using refresh token from HttpOnly cookie
     */
    useEffect(() => {
        refreshAccessToken().catch(() => {
            // not logged in or refresh failed
        });
    }, [refreshAccessToken]);

    const value = useMemo(
        () => ({
            api,
            accessToken,
            user,
            login,
            setUser,
            setAccessToken,
            logout,
            isAuthenticated: !!accessToken,
            getMe,
        }),
        [api, accessToken, user, login, logout, getMe]
    );

    return (
        <AuthApiContext.Provider value={value}>
            {children}
        </AuthApiContext.Provider>
    );
}

export function useAuthApi() {
    return useContext(AuthApiContext);
}

export function useApi() {
    const ctx = useContext(AuthApiContext);
    return ctx ? ctx.api : null;
}

export function useAuthUser() {
    const ctx = useContext(AuthApiContext);
    return ctx
        ? {
            accessToken: ctx.accessToken,
            user: ctx.user,
            setUser: ctx.setUser,
            login: ctx.login,
            logout: ctx.logout,
            isAuthenticated: ctx.isAuthenticated,
            getMe: ctx.getMe,
        }
        : {
            accessToken: null,
            user: null,
            login: async () => {},
            logout: () => {},
            isAuthenticated: false,
            getMe: async () => null,
        };
}
