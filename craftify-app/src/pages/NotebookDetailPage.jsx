import React, { useEffect, useState, useMemo } from "react";
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
    const [executing, setExecuting] = useState(false);

    const API_BASE = "http://localhost:8080/api";

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

    useEffect(() => {
        fetchNotebook();
    }, [id, getAccessTokenSilently]);

    const handleExecute = async () => {
        try {
            setExecuting(true);
            const token = await getAccessTokenSilently();
            const response = await fetch(`${API_BASE}/notebooks/${id}/run`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Execution failed");
            }

            const newContent = await response.json();

            // Console log for debug
            console.log("Executed Notebook Response:", newContent);

            let parsedContent;
            try {
                parsedContent = typeof newContent === "string"
                    ? JSON.parse(newContent)
                    : newContent;
            } catch (e) {
                throw new Error("Failed to parse notebook content");
            }

            setNotebook((prev) => ({
                ...prev,
                content: parsedContent,
                updatedAt: new Date().toISOString(),
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setExecuting(false);
        }
    };

    const notebookJson = useMemo(() => {
        if (!notebook?.content) return null;
        try {
            return typeof notebook.content === "string"
                ? JSON.parse(notebook.content)
                : notebook.content;
        } catch {
            return null;
        }
    }, [notebook]);

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

    return (
        <div className="mt-5 flex flex-col gap-6">
            <h1 className="text-3xl font-bold mb-5">{notebook.title}</h1>

            {executing ? (
                <div className="text-center text-lg text-blue-500">Executing notebook...</div>
            ) : (
                notebookJson && <IpynbRenderer ipynb={notebookJson} />
            )}

            <div className="text-sm text-gray-500">
                <p>Created: {new Date(notebook.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(notebook.updatedAt).toLocaleString()}</p>
            </div>

            <button
                onClick={handleExecute}
                disabled={executing}
                className={`mt-10 px-6 py-3 ${
                    executing ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                } text-white text-lg font-semibold rounded-xl shadow-md transition`}
            >
                {executing ? "Executing..." : "Execute Notebook"}
            </button>
        </div>
    );
};
