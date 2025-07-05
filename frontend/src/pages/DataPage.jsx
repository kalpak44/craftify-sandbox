import {useEffect, useState} from "react";

// Simulated Spring Boot–style paginated fetch
const mockFetchSchemas = (page, size) => {
    const allSchemas = [];


    const start = page * size;
    const end = start + size;
    const content = allSchemas.slice(start, end);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                content,
                page,
                size,
                totalPages: Math.ceil(allSchemas.length / size),
                totalElements: allSchemas.length,
                all: allSchemas
            });
        }, 500);
    });
};

export const DataPage = () => {
    const PAGE_SIZE = 5;

    const [data, setData] = useState({content: [], page: 0, totalPages: 0, all: []});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const fetchPage = async (pageIndex) => {
        setLoading(true);
        const result = await mockFetchSchemas(pageIndex, PAGE_SIZE);
        setData(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchPage(0);
    }, []);

    const handleView = (schema) => {
        alert(`Viewing schema: ${schema.name}`);
    };

    const handleRemove = (id) => {
        const updated = data.all.filter((s) => s.id !== id);
        updatePageData(updated);
    };

    const handleAddSchema = () => {
        if (!newName.trim()) return;

        const newSchema = {
            id: Date.now().toString(),
            name: newName,
            description: newDescription,
            records: 0
        };

        const updated = [newSchema, ...data.all];
        updatePageData(updated);
        setShowModal(false);
        setNewName("");
        setNewDescription("");
    };

    const updatePageData = (allSchemas) => {
        const totalPages = Math.ceil(allSchemas.length / PAGE_SIZE);
        const page = 0;
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const content = allSchemas.slice(start, end);

        setData({
            content,
            page,
            totalPages,
            totalElements: allSchemas.length,
            all: allSchemas
        });
    };

    return (
        <div className="p-8 text-white w-full">
            {loading ? (
                <div className="text-gray-400">Loading schemas...</div>
            ) : data.content.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400">
                    <h1 className="text-3xl font-bold mb-2 text-white">Data Schemas</h1>
                    <p className="text-gray-400 mb-4 text-lg">No data schemas found.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium text-white"
                    >
                        Add Schema
                    </button>
                </div>
            ) : (
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
                                <td className="px-3 py-2">{schema.records}</td>
                                <td className="px-3 py-2 text-right space-x-3">
                                    <button
                                        onClick={() => handleView(schema)}
                                        className="text-blue-400 hover:underline"
                                    >
                                        View
                                    </button>
                                    {schema.records === 0 && (
                                        <button
                                            onClick={() => handleRemove(schema.id)}
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
                            {Array.from({length: data.totalPages}, (_, i) => (
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

            {/* Modal */}
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
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
