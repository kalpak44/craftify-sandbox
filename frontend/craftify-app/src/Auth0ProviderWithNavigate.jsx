import {Auth0Provider} from "@auth0/auth0-react";
import React from "react";
import {useNavigate} from "react-router-dom";

export const Auth0ProviderWithNavigate = ({children}) => {
    const navigate = useNavigate();

    const domain = "dev-f5ge1-8v.us.auth0.com";
    const clientId = "wUzgSsPGxVXW2g9rDKG9UUmYRRh7Oo6P";
    const redirectUri = `http://localhost:5173/callback`;
    const audience = "https://app.craftify.com/";

    const onRedirectCallback = (appState) => {
        navigate(appState?.returnTo || window.location.pathname);
    };

    if (!(domain && clientId && redirectUri && audience)) {
        return null;
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                audience: audience,
                redirect_uri: redirectUri,
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};
