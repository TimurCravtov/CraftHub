import React from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { redirectToOAuthProvider } from "./redirectToOAuthProvider";

const providers = {
    google: {
        label: "Continue with Google",
        icon: <FaGoogle style={{ width: '1.25rem', height: '1.25rem', color: 'white', filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))' }} />,
    },
    facebook: {
        label: "Continue with Facebook",
        icon: <FaFacebook style={{ width: '1.25rem', height: '1.25rem', color: 'white', filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))' }} />,
    },
};

export function OAuthButton({ provider }) {
    const config = providers[provider];

    if (!config) {
        return null; // unsupported provider
    }

    return (
        <button
            onClick={() => redirectToOAuthProvider(provider)}
            className="btn-primary btn-primary--full"
            style={{ gap: '0.75rem' }}
        >
            {config.icon}
            <span>{config.label}</span>
        </button>
    );
}
