import { useEffect, useState } from "react";
import { Modal } from "../components/common/Modal";
import { listFlows, createFlow, deleteFlow } from "../api/flows";

export const FlowsPage = () => {
    const [data, setData] = useState({ content: [], page: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [flowName, setFlowName] = useState("");
    const [flowDescription, setFlowDescription] = useState("");
    const [parameters, setParameters] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [flowToDelete, setFlowToDelete] = useState(null);

    const PAGE_SIZE = 5;

    const fetchPage = async (pageIndex) => {
        setLoading(true);
        try {
            const result = await listFlows(pageIndex, PAGE_SIZE);
            setData(result);
        } catch (error) {
            alert("Failed to load flows: " + error.message);
        }
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

    const handleCreateFlow = async () => {
        try {
            const newFlow = {
                flowName,
                flowDescription,
                parameters
            };
            await createFlow(newFlow);
            await fetchPage(0);
            closeModal();
        } catch (e) {
            alert("Failed to create flow: " + e.message);
        }
    };

    const handleAddParameter = () => {
        setParameters([...parameters, { key: "" }]);
    };

    const handleRemoveParameter = (index) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const handleChangeParameter = (index, field, value) => {
        const updated = [...parameters];
        updated[index][field] = value;
        setParameters(updated);
    };

    const handleOpen = (flow) => {
        alert("Navigating to " + flow.flowName);
    };

    const handleViewHistory = (flow) => {
        alert("Viewing execution history for: " + flow.flowName);
    };

    const handleDelete = (flow) => {
        setFlowToDelete(flow);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteFlow(flowToDelete.id);
            await fetchPage(data.page);
        } catch (e) {
            alert("Failed to delete flow: " + e.message);
        }
        setFlowToDelete(null);
        setShowDeleteModal(false);
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
                            <th className="text-right px-3 py-2 font-medium">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.content.map((flow) => (
                            <tr key={flow.id} className="hover:bg-gray-800 border-b border-gray-800">
                                <td className="px-3 py-2">{flow.id}</td>
                                <td className="px-3 py-2">{flow.flowName}</td>
                                <td className="px-3 py-2">{flow.flowDescription}</td>
                                <td className="px-3 py-2 text-right space-x-2">
                                    <button
                                        onClick={() => handleOpen(flow)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                                    >
                                        Open
                                    </button>
                                    <button
                                        onClick={() => handleViewHistory(flow)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded"
                                    >
                                        History
                                    </button>
                                    <button
                                        onClick={() => handleDelete(flow)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

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

            {/* Create Flow Modal */}
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <Modal
                    title="Delete Flow"
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setFlowToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                >
                    Are you sure you want to delete <strong>{flowToDelete?.flowName}</strong>?
                </Modal>
            )}
        </div>
    );
};
