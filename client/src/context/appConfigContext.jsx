import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";

const AppConfigContext = createContext(null);

export function AppConfigProvider({ children }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get("/api/config/auth-params", { withCredentials: true });
                setConfig(res.data);
            } catch (err) {
                console.error("Failed to fetch app config:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const value = useMemo(
        () => ({
            config,
            loading,
            error,
            googleClientId: config?.googleClientId || null,
            googleRedirectUri: config?.googleRedirectUri || null,
        }),
        [config, loading, error]
    );

    return (
        <AppConfigContext.Provider value={value}>
            {children}
        </AppConfigContext.Provider>
    );
}

export function useAppConfig() {
    return useContext(AppConfigContext);
}
