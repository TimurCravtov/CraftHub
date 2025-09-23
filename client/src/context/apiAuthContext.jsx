import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

const AuthApiContext = createContext(null);

export function AuthApiProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);


    /**
     * This should be edited to handle cookeis
     * @param failedRequest
     * @returns {Promise<unknown>}
     */
    const refreshAccessToken = (failedRequest) => {
        return new Promise((resolve, reject) => {
            const refreshToken = localStorage.getItem('refreshToken'); // Get latest refreshToken
            if (!refreshToken) {
                logout(); // No refresh token, logout user
                reject(new Error('No refresh token available'));
                return;
            }

            // Request new accessToken
            api.post('/api/v1/tokens/refresh', { refreshToken }, {noAuth: true})
                .then((response) => {
                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    // Save new tokens and retry failed request
                    saveTokens(accessToken, newRefreshToken);
                    failedRequest.response.config.headers['Authorization'] = `Bearer ${accessToken}`;
                    resolve();
                })
                .catch((error) => {
                    console.error('Token refresh failed:', error);
                    logout(); // Log out user if refresh fails
                    reject(error);
                });
        });
    };


    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: 'http://localhost:8080/',
            withCredentials: true,
        });


        instance.interceptors.request.use((config) => {
            if (!config.noAuth && accessToken) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        });

        return instance;
    }, [accessToken]);

    createAuthRefreshInterceptor(api, refreshAccessToken);

    const login = useCallback((token, userData) => {
        setAccessToken(token);
        setUser(userData || null);
    }, []);

    const logout = useCallback(() => {
        setAccessToken(null);
        setUser(null);
    }, []);

    const getMe = useCallback(
        async (token) => { // optional token parameter
            try {
                const headers = {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}), // add Authorization if token exists
                };

                const res = await api.get('api/users/me', { headers });
                setUser(res.data);
                return res.data;
            } catch (err) {
                console.error('getMe failed', err);
                throw err;
            }
        },
        [api]
    );


    const value = useMemo(() => ({
        api,
        accessToken,
        user,
        login,
        setUser,
        logout,
        isAuthenticated: !!accessToken,
        getMe,
    }), [api, accessToken, user, login, logout, getMe, setUser]);

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
            login: () => {},
            logout: () => {},
            isAuthenticated: false,
            getMe: async () => null,
        };
}
