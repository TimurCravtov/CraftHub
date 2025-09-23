import React from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { redirectToOAuthProvider } from "./redirectToOAuthProvider";

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
    const config = providers[provider];

    if (!config) {
        return null; // unsupported provider
    }

    return (
        <button
            onClick={() => redirectToOAuthProvider(provider)}
            className="flex items-center justify-center w-full px-4 py-2 space-x-2 border rounded-lg shadow-sm hover:bg-gray-100 transition"
        >
            {config.icon}
            <span>{config.label}</span>
        </button>
    );
}
