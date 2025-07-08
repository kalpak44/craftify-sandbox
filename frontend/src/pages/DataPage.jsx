import { useEffect, useState } from "react";
import { listSchemas, deleteSchema, createSchema } from "../api/dataSchema";
import FieldEditor from "../components/schema-editor/FieldEditor";
import JSONPreview from "../components/schema-editor/JSONPreview";

export const DataPage = () => {
    const PAGE_SIZE = 5;

    const [data, setData] = useState({ content: [], page: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [schemaToDelete, setSchemaToDelete] = useState(null);

    const [editorVisible, setEditorVisible] = useState(false);
    const [editorSchema, setEditorSchema] = useState({ type: "object", properties: {} });

    const fetchPage = async (pageIndex) => {
        setLoading(true);
        setError(null);
        try {
            const result = await listSchemas(pageIndex, PAGE_SIZE);
            setData(result);
        } catch (err) {
            setError("Failed to load schemas: " + err.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPage(0);
    }, []);

    const handleView = (schema) => {
        alert(`Viewing schema: ${schema.name}`);
    };

    const handleDeleteClick = (schema) => {
        setSchemaToDelete(schema);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!schemaToDelete) return;
        try {
            await deleteSchema(schemaToDelete.id);
            await fetchPage(data.page);
        } catch (err) {
            alert(err.message);
        } finally {
            setSchemaToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleAddSchema = () => {
        if (!newName.trim()) return;

        setEditorSchema({
            type: "object",
            properties: {}
        });

        setShowModal(false);
        setEditorVisible(true);
    };

    const handleSaveSchema = async () => {
        try {
            await createSchema({
                name: newName,
                description: newDescription,
                schema: editorSchema
            });
            await fetchPage(0);
            setEditorVisible(false);
            setNewName("");
            setNewDescription("");
        } catch (err) {
            alert("Failed to save schema: " + err.message);
        }
    };

    return (
        <div className="p-8 text-white w-full">
            {!editorVisible ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-semibold">Data Schemas</h1>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
                        >
                            Add Schema
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-gray-400">Loading schemas...</div>
                    ) : error ? (
                        <div className="text-red-400">{error}</div>
                    ) : data.content.length === 0 ? (
                        <div className="text-gray-400">No schemas available.</div>
                    ) : (
                        <>
                            <table className="w-full text-sm border-collapse mb-6">
                                <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="text-left px-3 py-2 font-medium">Name</th>
                                    <th className="text-left px-3 py-2 font-medium">Description</th>
                                    <th className="text-left px-3 py-2 font-medium">Records</th>
                                    <th className="text-right px-3 py-2 font-medium">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.content.map((schema) => (
                                    <tr key={schema.id} className="hover:bg-gray-800 border-b border-gray-800">
                                        <td className="px-3 py-2">{schema.name}</td>
                                        <td className="px-3 py-2">{schema.description}</td>
                                        <td className="px-3 py-2">{schema.recordCount}</td>
                                        <td className="px-3 py-2 text-right space-x-3">
                                            <button
                                                onClick={() => handleView(schema)}
                                                className="text-blue-400 hover:underline"
                                            >
                                                View
                                            </button>
                                            {schema.recordCount === 0 && (
                                                <button
                                                    onClick={() => handleDeleteClick(schema)}
                                                    className="text-red-400 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex justify-end mt-4">
                                <div className="inline-flex rounded overflow-hidden border border-gray-700 bg-gray-800 text-sm">
                                    {Array.from({ length: data.totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => fetchPage(i)}
                                            className={`px-4 py-2 border-r border-gray-700 last:border-r-0 transition ${
                                                data.page === i
                                                    ? "bg-blue-600 text-white"
                                                    : "text-gray-300 hover:bg-gray-700"
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Add Schema Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-lg border border-gray-600">
                                <h2 className="text-lg font-semibold mb-4">Add Schema</h2>
                                <input
                                    type="text"
                                    placeholder="Schema name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full mb-3 px-3 py-2 bg-gray-700 text-white rounded outline-none"
                                />
                                <textarea
                                    placeholder="Schema description"
                                    rows={3}
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full mb-4 px-3 py-2 bg-gray-700 text-white rounded outline-none resize-none"
                                />
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-1 bg-gray-600 hover:bg-gray-500 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddSchema}
                                        className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && schemaToDelete && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md border border-gray-600">
                                <h2 className="text-lg font-semibold mb-4">Delete Schema</h2>
                                <p className="mb-4 text-sm">
                                    Are you sure you want to delete <strong>{schemaToDelete.name}</strong>?
                                </p>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setSchemaToDelete(null);
                                        }}
                                        className="px-4 py-1 bg-gray-600 hover:bg-gray-500 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Schema Editor: {newName}</h1>
                            <p className="text-gray-400 text-sm mt-1">{newDescription}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditorVisible(false)}
                                className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSchema}
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-sm font-medium text-white"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 gap-6">
                        <div className="flex-1 overflow-auto bg-gray-900 p-4 rounded border border-gray-700">
                            <FieldEditor schema={editorSchema} onSchemaChange={setEditorSchema} />
                        </div>
                        <div className="w-1/2 overflow-auto bg-gray-800 p-4 rounded border border-gray-700">
                            <JSONPreview data={editorSchema} />
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};
