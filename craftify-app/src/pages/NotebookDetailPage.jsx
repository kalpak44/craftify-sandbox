import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import { IpynbRenderer } from "react-ipynb-renderer";
import "react-ipynb-renderer/dist/styles/monokai.css";

export const NotebookDetailPage = () => {
    const { id } = useParams();
    const { getAccessTokenSilently } = useAuth0();

    const [notebook, setNotebook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = "http://localhost:8080/api";

    useEffect(() => {
        const fetchNotebook = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch(`${API_BASE}/notebooks/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Notebook not found");
                }

                const data = await response.json();
                setNotebook(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNotebook();
    }, [id, getAccessTokenSilently]);

    if (loading) {
        return <div className="page-layout__content mt-[150px] p-6">Loading...</div>;
    }

    if (error) {
        return (
            <div className="page-layout__content mt-[150px] p-6 text-red-500">
                {error}
            </div>
        );
    }

    const notebookJson = typeof notebook.content === "string"
        ? JSON.parse(notebook.content)
        : notebook.content;


    return (
        <div className="mt-5">
            <h1 className="text-3xl font-bold mb-5">{notebook.title}</h1>

            {notebookJson && <IpynbRenderer ipynb={notebookJson} />}

            <div className="text-sm text-gray-500">
                <p>Created: {new Date(notebook.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(notebook.updatedAt).toLocaleString()}</p>
            </div>
        </div>
    );
};
