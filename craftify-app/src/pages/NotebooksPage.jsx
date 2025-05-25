import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";

export const NotebooksPage = () => {
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

    const [notebooks, setNotebooks] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const API_BASE = "http://localhost:8080/api";

    const fetchNotebooks = async () => {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(
                `${API_BASE}/notebooks?page=${page}&size=${size}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            setNotebooks(data.content || []);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteNotebook = async (id) => {
        try {
            const token = await getAccessTokenSilently();
            await fetch(`${API_BASE}/notebooks/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchNotebooks();
        } catch (err) {
            console.error("Delete error", err);
        }
    };

    useEffect(() => {
        fetchNotebooks();
    }, [page]);

    return (
        <div className="mt-5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Notebooks</h1>
                <button
                    onClick={() => navigate("/notebooks/create")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    + New Notebook
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <>
                    <ul className="space-y-4">
                        {notebooks.map((notebook) => (
                            <li
                                key={notebook.id}
                                className="w-full border rounded-xl p-6 shadow hover:shadow-md transition"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="w-full">
                                        <h2 className="text-xl font-semibold">{notebook.title}</h2>
                                        <p className="text-gray-700 mt-1">{notebook.content}</p>
                                        <p className="text-sm text-gray-400 mt-2">
                                            Created: {new Date(notebook.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-4 md:mt-0 md:ml-6">
                                        <Link
                                            to={`/notebooks/${notebook.id}`}
                                            className="px-3 py-1 bg-green-950 rounded hover:bg-green-900 text-sm text-white inline-block"
                                        >
                                            Details
                                        </Link>
                                        <button
                                            onClick={() => alert("Edit not implemented")}
                                            className="px-3 py-1 bg-gray-900 rounded hover:bg-gray-600 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteNotebook(notebook.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center justify-center space-x-2 mt-6">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                            disabled={page === 0}
                            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`px-3 py-1 border rounded ${
                                    i === page ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
