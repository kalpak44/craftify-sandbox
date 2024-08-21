import NotebookEditor from "../components/notebook-editor/NotebookEditor.jsx";
import {useState, useEffect} from "react";
import {useAuth0} from "@auth0/auth0-react";

export const RecipeEditPage = () => {
    const {getAccessTokenSilently} = useAuth0();
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                const token = await getAccessTokenSilently();
                setAccessToken(token);
            } catch (error) {
                console.error("Error fetching access token", error);
            }
        };

        fetchAccessToken().catch(console.error);
    }, [getAccessTokenSilently]);

    return (
        <>
            {accessToken && <NotebookEditor accessToken={accessToken} />}
        </>
    );
}
