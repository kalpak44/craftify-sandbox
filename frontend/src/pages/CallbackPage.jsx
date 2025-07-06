import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export const CallbackPage = () => {
    const { error, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const storeTokenAndRedirect = async () => {
            try {
                const token = await getAccessTokenSilently();
                localStorage.setItem("access_token", token);
                window.location.href = "/"
            } catch (err) {
                console.error("Error fetching access token:", err);
            }
        };

        if (!isLoading && isAuthenticated) {
            storeTokenAndRedirect();
        }
    }, [isAuthenticated, isLoading, getAccessTokenSilently]);

    if (error) {
        return (
            <div className="content-layout">
                <h1 id="page-title" className="content__title">Error</h1>
                <div className="content__body">
                    <p id="page-description">
                        <span>{error.message}</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-layout">
            <div className="page-layout__content" />
        </div>
    );
};
