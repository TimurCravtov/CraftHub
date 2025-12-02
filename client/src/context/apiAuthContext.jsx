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
import { sanitizeEmail, sanitizePassword, sanitizeName, sanitizeUserInput, sanitize2FA, sanitizeDescription, sanitizePhone, sanitizeAddress, safeUrl } from '../utils/sanitize.js';

const AuthApiContext = createContext(null);

/**
 * Recursively sanitize request data to prevent XSS attacks
 * This function handles objects, arrays, FormData, and primitive values
 */
function sanitizeRequestData(data) {
    // Skip sanitization for FormData (file uploads)
    if (data instanceof FormData) {
        // Sanitize text fields in FormData
        const sanitizedFormData = new FormData();
        for (const [key, value] of data.entries()) {
            if (value instanceof File || value instanceof Blob) {
                sanitizedFormData.append(key, value);
            } else {
                const sanitized = sanitizeValueByKey(key, String(value));
                sanitizedFormData.append(key, sanitized);
            }
        }
        return sanitizedFormData;
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => {
            if (item instanceof File || item instanceof Blob || typeof item !== 'object' || item === null) {
                return typeof item === 'string' ? sanitizeValueByKey('', item) : item;
            }
            return sanitizeRequestData(item);
        });
    }
    
    // Handle objects
    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === undefined) {
                sanitized[key] = value;
            } else if (value instanceof File || value instanceof Blob) {
                sanitized[key] = value;
            } else if (Array.isArray(value)) {
                sanitized[key] = sanitizeRequestData(value);
            } else if (typeof value === 'object') {
                sanitized[key] = sanitizeRequestData(value);
            } else {
                sanitized[key] = sanitizeValueByKey(key, String(value));
            }
        }
        return sanitized;
    }
    
    // Handle primitive values
    if (typeof data === 'string') {
        return sanitizeValueByKey('', data);
    }
    
    return data;
}

/**
 * Sanitize a value based on its field name
 */
function sanitizeValueByKey(key, value) {
    if (!value || typeof value !== 'string') return value;
    
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('email')) {
        return sanitizeEmail(value);
    } else if (lowerKey.includes('password')) {
        return sanitizePassword(value);
    } else if (lowerKey.includes('name') && !lowerKey.includes('description')) {
        return sanitizeName(value);
    } else if (lowerKey.includes('url')) {
        return safeUrl(value);
    } else if (lowerKey.includes('2fa') || lowerKey.includes('twofactor') || (lowerKey.includes('code') && lowerKey.includes('factor'))) {
        return sanitize2FA(value);
    } else if (lowerKey.includes('description')) {
        return sanitizeDescription(value);
    } else if (lowerKey.includes('phone')) {
        return sanitizePhone(value);
    } else if (lowerKey.includes('address') || lowerKey.includes('city') || lowerKey.includes('town')) {
        return sanitizeAddress(value);
    } else {
        return sanitizeUserInput(value);
    }
}

export function AuthApiProvider({ children }) {
    // Initialize from localStorage
    const [accessToken, setAccessToken] = useState(() => {
        try {
            const auth = JSON.parse(localStorage.getItem("auth") || "{}");
            return auth.accessToken || auth.token || null;
        } catch {
            return null;
        }
    });
    const [user, setUser] = useState(() => {
        try {
            const auth = JSON.parse(localStorage.getItem("auth") || "{}");
            if (auth.name || auth.email) {
                return { name: auth.name, email: auth.email, accountType: auth.accountType };
            }
            return null;
        } catch {
            return null;
        }
    });

    // Create a ref to store the API instance so we can use it in refreshAccessToken
    const apiRef = React.useRef(null);

    /**
     * Refresh access token using secure HttpOnly cookie
     * (refresh token lives in cookie, not in JS)
     */
    const refreshAccessToken = useCallback(
        async (failedRequest) => {
            try {
                console.log("Attempting to refresh token...");
                const res = await axios.post(
                    "https://localhost:8443/api/auth/refresh",
                    {},
                    { withCredentials: true }
                );

                const { accessToken: newToken } = res.data;
                console.log("Token refreshed successfully");
                setAccessToken(newToken);
                
                // Update localStorage
                const auth = JSON.parse(localStorage.getItem("auth") || "{}");
                auth.accessToken = newToken;
                auth.token = newToken;
                localStorage.setItem("auth", JSON.stringify(auth));

                // attach new token to the failed request if provided
                if (failedRequest && failedRequest.response) {
                    failedRequest.response.config.headers["Authorization"] = `Bearer ${newToken}`;
                }
                
                return Promise.resolve();
            } catch (err) {
                console.error("Token refresh failed:", err);
                // Clear everything on refresh failure
                setAccessToken(null);
                setUser(null);
                localStorage.removeItem("auth");
                return Promise.reject(err);
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
            
            // Sanitize request data to prevent XSS
            if (config.data) {
                config.data = sanitizeRequestData(config.data);
            }
            
            // Sanitize URL parameters
            if (config.params) {
                config.params = sanitizeRequestData(config.params);
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

        // Store in ref for use in refreshAccessToken
        apiRef.current = instance;

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
            
            // Persist to localStorage
            localStorage.setItem("auth", JSON.stringify({
                accessToken,
                token: accessToken,
                name: user.name,
                email: user.email,
                accountType: user.accountType
            }));
            
            return user;
        } catch (err) {
            console.error("Login failed", err);
            throw err;
        }
    }, [api]);

    /**
     * OAuth Login: directly set token and user (tokens already obtained from backend)
     */
    const loginWithToken = useCallback((token, userData) => {
        setAccessToken(token);
        setUser(userData);
        
        // Persist to localStorage
        localStorage.setItem("auth", JSON.stringify({
            accessToken: token,
            token: token,
            name: userData?.name,
            email: userData?.email,
            accountType: userData?.accountType
        }));
    }, []);

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
        localStorage.removeItem("auth");
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

    // Don't try to refresh on mount - let the interceptor handle it when needed

    const value = useMemo(
        () => ({
            api,
            accessToken,
            user,
            login,
            loginWithToken,
            setUser,
            setAccessToken,
            logout,
            isAuthenticated: !!accessToken,
            getMe,
        }),
        [api, accessToken, user, login, loginWithToken, logout, getMe]
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
