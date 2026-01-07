export const redirectToOAuthProvider = (provider) => {

    const redirectUri = `${window.location.origin}/oauth/redirect/${provider}`;

    let authUrl = "";

    if (provider === "google") {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "16503281538-a8j06a7mdhmrq46kb45ia24s4ttsisns.apps.googleusercontent.com";
        console.log("clientId: ", clientId);
        const scope = encodeURIComponent("openid email profile");
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    } else if (provider === "facebook") {

    }
    window.location.href = authUrl;
};

