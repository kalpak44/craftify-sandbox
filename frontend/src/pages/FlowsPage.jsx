import { useEffect, useState } from "react";

// Simulated Spring Boot-style pageable response
const mockFetchFlows = (page, size) => {
    const allFlows = [
        {
            id: "flow-373e",
            name: "Flow 3731",
            description: "Arguments as parameters",
            createdAt: "2024-04-23 15:23",
            updatedAt: "2024-04-23 18:45"
        },
        {
            id: "flow-a1b2",
            name: "Sample flow",
            description: "Sample flow",
            createdAt: "2024-04-22 10:10",
            updatedAt: "2024-04-22 10:10"
        },
        {
            id: "flow-8f04",
            name: "Test Flow",
            description: "Test Flow",
            createdAt: "2024-04-20 09:05",
            updatedAt: "2024-04-21 11:30"
        },
        {
            id: "flow-6c7d",
            name: "ETL Job",
            description: "ETL Job",
            createdAt: "2024-04-19 14:45",
            updatedAt: "2024-04-19 14:45"
        },
        {
            id: "flow-52e8",
            name: "Batch processing",
            description: "Batch processing flow",
            createdAt: "2024-04-18 08:00",
            updatedAt: "2024-04-18 12:20"
        },
        {
            id: "flow-3f1a",
            name: "Streaming data pipeline",
            description: "Streaming data pipeline",
            createdAt: "2024-04-17 13:15",
            updatedAt: "2024-04-17 13:13"
        }
    ];

    const start = page * size;
    const end = start + size;
    const content = allFlows.slice(start, end);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                content,
                page,
                size,
                totalPages: Math.ceil(allFlows.length / size),
                totalElements: allFlows.length
            });
        }, 500);
    });
};

export const FlowsPage = () => {
    const [data, setData] = useState({ content: [], page: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [flowName, setFlowName] = useState("");
    const [flowDescription, setFlowDescription] = useState("");
    const [parameters, setParameters] = useState([]);

    const PAGE_SIZE = 5;

    const fetchPage = async (pageIndex) => {
        setLoading(true);
        const result = await mockFetchFlows(pageIndex, PAGE_SIZE);
        setData(result);
        setLoading(false);
    };

    useEffect(() => {
        fetchPage(0);
    }, []);

    const openModal = () => {
        setFlowName("");
        setFlowDescription("");
        setParameters([]);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleCreateFlow = () => {
        alert("New flow created:\n" + JSON.stringify({ flowName, flowDescription, parameters }, null, 2));
        closeModal();
    };

    const handleAddParameter = () => {
        setParameters([...parameters, { key: ""}]);
    };

    const handleRemoveParameter = (index) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const handleChangeParameter = (index, field, value) => {
        const updated = [...parameters];
        updated[index][field] = value;
        setParameters(updated);
    };

    const handleDelete = (id) => {
        alert("Deleted flow: " + id);
    };

    const handleOpen = (flow) => {
        alert("Navigating to " + flow.name);
    };

    return (
        <div className="p-8 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-semibold">Flows</h1>
                <button
                    onClick={openModal}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
                >
                    Create Flow
                </button>
            </div>

            {loading ? (
                <div className="text-gray-400">Loading flows...</div>
            ) : data.content.length === 0 ? (
                <div className="text-gray-400">No flows available.</div>
            ) : (
                <>
                    <table className="w-full text-sm border-collapse mb-6">
                        <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                            <th className="text-left px-3 py-2 font-medium">ID</th>
                            <th className="text-left px-3 py-2 font-medium">Name</th>
                            <th className="text-left px-3 py-2 font-medium">Description</th>
                            <th className="text-left px-3 py-2 font-medium">Created At</th>
                            <th className="text-left px-3 py-2 font-medium">Updated At</th>
                            <th className="text-right px-3 py-2 font-medium">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.content.map((flow) => (
                            <tr
                                key={flow.id}
                                className="hover:bg-gray-800 border-b border-gray-800"
                            >
                                <td className="px-3 py-2">{flow.id}</td>
                                <td className="px-3 py-2">{flow.name}</td>
                                <td className="px-3 py-2">{flow.description}</td>
                                <td className="px-3 py-2">{flow.createdAt}</td>
                                <td className="px-3 py-2">{flow.updatedAt}</td>
                                <td className="px-3 py-2 text-right space-x-3">
                                    <button
                                        onClick={() => handleOpen(flow)}
                                        className="text-blue-400 hover:underline"
                                    >
                                        Open
                                    </button>
                                    <button
                                        onClick={() => handleDelete(flow.id)}
                                        className="text-red-400 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-lg border border-gray-600">
                        <h2 className="text-lg font-semibold mb-4">Create New Flow</h2>

                        <input
                            type="text"
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            placeholder="Flow name"
                            className="w-full mb-3 px-3 py-2 bg-gray-700 text-white rounded outline-none"
                        />

                        <textarea
                            value={flowDescription}
                            onChange={(e) => setFlowDescription(e.target.value)}
                            placeholder="Flow description"
                            rows={3}
                            className="w-full mb-4 px-3 py-2 bg-gray-700 text-white rounded outline-none resize-none"
                        />

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-300">Parameters</span>
                                <button
                                    onClick={handleAddParameter}
                                    className="text-blue-400 text-sm hover:underline"
                                >
                                    + Add
                                </button>
                            </div>

                            {parameters.map((param, index) => (
                                <div key={index} className="flex space-x-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Key"
                                        value={param.key}
                                        onChange={(e) =>
                                            handleChangeParameter(index, "key", e.target.value)
                                        }
                                        className="flex-1 px-2 py-1 bg-gray-700 text-white rounded"
                                    />
                                    <button
                                        onClick={() => handleRemoveParameter(index)}
                                        className="text-red-400 text-sm hover:underline"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-1 bg-gray-600 hover:bg-gray-500 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateFlow}
                                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
