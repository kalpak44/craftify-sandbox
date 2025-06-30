import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { getSchemaFile } from "../services/API";

const PAGE_SIZE = 10;

const SchemaTablePage = () => {
    const { schemaId } = useParams();
    const { getAccessTokenSilently } = useAuth0();
    const [schema, setSchema] = useState(null);
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);

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

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (error) return <div className="p-8 text-red-400">{error}</div>;
    if (!schema) return <div className="p-8 text-white">No schema found.</div>;

    return (
        <div className="w-full h-full min-h-screen bg-gray-800 flex flex-col p-8">
            <h1 className="text-2xl text-white font-semibold mb-4">{schema.title || "Schema Table"}</h1>
            <div className="overflow-x-auto bg-gray-900 rounded shadow">
                <table className="min-w-full text-white">
                    <thead>
                        <tr>
                            {fields.map(field => (
                                <th key={field.name} className="px-4 py-2 border-b border-gray-700 text-left">{field.label || field.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pagedData.length === 0 ? (
                            <tr><td colSpan={fields.length} className="px-4 py-4 text-center text-gray-400">No data</td></tr>
                        ) : pagedData.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-800">
                                {fields.map(field => (
                                    <td key={field.name} className="px-4 py-2 border-b border-gray-800">{row[field.name]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between mt-4">
                <button
                    className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                >
                    Previous
                </button>
                <span className="text-white">Page {page + 1} of {totalPages || 1}</span>
                <button
                    className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default SchemaTablePage; 