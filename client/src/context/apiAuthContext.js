import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import axios from 'axios';

const AuthApiContext = createContext(null);

export function AuthApiProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null);
    const [user, setUser] = useState(null);

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

    const login = useCallback((token, userData) => {
        setAccessToken(token);
        setUser(userData || null);
    }, []);

    const logout = useCallback(() => {
        setAccessToken(null);
        setUser(null);
    }, []);

    const getMe = useCallback(async () => {
        try {
            const res = await api.get('/users/me');
            setUser(res.data);
            return res.data;
        } catch (err) {
            console.error('getMe failed', err);
            throw err;
        }
    }, [api]);

    const value = useMemo(() => ({
        api,
        accessToken,
        user,
        login,
        logout,
        isAuthenticated: !!accessToken,
        getMe,
    }), [api, accessToken, user, login, logout, getMe]);

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
