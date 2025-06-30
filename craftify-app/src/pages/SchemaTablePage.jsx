import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { getSchemaFile } from "../services/API";

const PAGE_SIZE = 10;

const SchemaTablePage = () => {
    const { schemaId } = useParams();
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();
    const [schema, setSchema] = useState(null);
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editRecord, setEditRecord] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        let isMounted = true;
        async function fetchSchema() {
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                const schemaFile = await getSchemaFile(accessToken, schemaId);
                let parsed = {};
                try {
                    parsed = JSON.parse(schemaFile.content);
                } catch (e) {
                    setError("Invalid JSON in schema file.");
                    setLoading(false);
                    return;
                }
                if (isMounted) {
                    setSchema(parsed);
                    setFields(parsed.fields || []);
                    setData(parsed.data || []);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchSchema();
        return () => { isMounted = false; };
    }, [schemaId, getAccessTokenSilently]);

    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const pagedData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const handleAdd = () => {
        setEditRecord(null);
        setFormData({});
        setShowForm(true);
    };

    const handleEdit = (row) => {
        setEditRecord(row);
        setFormData(row);
        setShowForm(true);
    };

    const handleDelete = (row) => {
        // Implement delete logic
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Implement form submission logic
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (error) return <div className="p-8 text-red-400">{error}</div>;
    if (!schema) return <div className="p-8 text-white">No schema found.</div>;

    return (
        <div className="mt-5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">{schema.title || "Schema Table"}</h1>
                <button
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 transition"
                    onClick={() => navigate(`/schemas/${schemaId}/add`)}
                >
                    + Add
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
                    <thead className="bg-gray-900">
                        <tr>
                            {fields.map(field => (
                                <th key={field.name} className="py-3 px-4 text-left text-gray-300">{field.label || field.name}</th>
                            ))}
                            <th className="py-3 px-4 text-left text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagedData.length === 0 ? (
                            <tr>
                                <td colSpan={fields.length + 1} className="py-4 px-4 text-center text-gray-400">
                                    No data
                                </td>
                            </tr>
                        ) : (
                            pagedData.map((row, i) => (
                                <tr key={row.id} className="border-t border-gray-700 hover:bg-gray-700 text-gray-300">
                                    {fields.map(field => (
                                        <td key={field.name} className="py-3 px-4">{row[field.name]}</td>
                                    ))}
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(row)}
                                                className="px-3 py-1 bg-gray-900 rounded hover:bg-gray-600 text-sm text-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(row)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className="px-3 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                    Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`px-3 py-1 border border-gray-600 rounded ${
                            i === page ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-700"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <form className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700" onSubmit={handleFormSubmit}>
                        <h2 className="text-xl font-bold mb-4 text-gray-200">{editRecord ? "Edit Record" : "Add Record"}</h2>
                        {fields.map(field => (
                            <div key={field.name} className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-gray-300">{field.label || field.name}</label>
                                <input
                                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
                                    value={formData[field.name] || ""}
                                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                    required={field.required}
                                />
                            </div>
                        ))}
                        <div className="flex justify-end gap-2">
                            <button type="button" className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-600">{editRecord ? "Save" : "Add"}</button>
                        </div>
                    </form>
                </div>
            )}
            {error && <div className="text-red-400 mt-2">{error}</div>}
        </div>
    );
};

export default SchemaTablePage; 