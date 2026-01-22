import React from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { redirectToOAuthProvider } from "./redirectToOAuthProvider";
import { useAppConfig } from "../context/appConfigContext";

const providers = {
    google: {
        label: "Continue with Google",
        icon: <FaGoogle className="w-5 h-5 mr-2" />,
    },
    facebook: {
        label: "Continue with Facebook",
        icon: <FaFacebook className="w-5 h-5 mr-2" />,
    },
};

export function OAuthButton({ provider }) {
    const { googleClientId, googleRedirectUri, loading } = useAppConfig();
    const config = providers[provider];

    if (!config) {
        return null; // unsupported provider
    }

    const handleClick = () => {
        if (provider === "google") {
            redirectToOAuthProvider(provider, googleClientId, googleRedirectUri);
        } else {
            redirectToOAuthProvider(provider, null, null);
        }
    };

    const btnClass = provider === 'google'
        ? 'flex items-center justify-center w-full px-4 py-2 space-x-2 rounded-lg shadow-sm bg-black text-white hover:bg-gray-900 disabled:opacity-50'
        : 'flex items-center justify-center w-full px-4 py-2 space-x-2 rounded-lg shadow-sm brand-btn disabled:opacity-50';

    return (
        <button
            type="button"  
            onClick={handleClick}
            disabled={provider === "google" && loading}
            className={btnClass}
        >
            {config.icon}
            <span>{config.label}</span>
        </button>
    );
}
