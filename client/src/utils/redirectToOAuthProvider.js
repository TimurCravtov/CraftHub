export const redirectToOAuthProvider = (provider, googleClientId) => {

    const redirectUri = `${window.location.origin}/oauth/redirect/${provider}`;

    let authUrl = "";

    if (provider === "google") {
        if (!googleClientId) {
            console.error("Google Client ID is not available yet.");
            return;
        }
        console.log("clientId: ", googleClientId);
        const scope = encodeURIComponent("openid email profile");
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    } else if (provider === "facebook") {

    }
    window.location.href = authUrl;
};

