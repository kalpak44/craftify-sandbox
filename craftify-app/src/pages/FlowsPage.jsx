import {useEffect, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";
import {createFlow, deleteFlow, getFlowsPageable, updateFlow} from "../services/API";

export const FlowsPage = () => {
    const {getAccessTokenSilently} = useAuth0();
    const navigate = useNavigate();

    const [flows, setFlows] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentFlow, setCurrentFlow] = useState({name: "", description: "", configuration: "", active: false});
    const [isEditing, setIsEditing] = useState(false);

    const fetchFlows = async () => {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently();
            const data = await getFlowsPageable(token, {page, size});
            setFlows(data.content || []);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFlow = async (id) => {
        if (window.confirm("Are you sure you want to delete this flow?")) {
            try {
                const token = await getAccessTokenSilently();
                await deleteFlow(token, id);
                fetchFlows();
            } catch (err) {
                console.error("Delete error", err);
            }
        }
    };

    const handleCreateOrUpdateFlow = async () => {
        try {
            const token = await getAccessTokenSilently();

            if (isEditing) {
                await updateFlow(token, currentFlow.id, currentFlow);
            } else {
                await createFlow(token, currentFlow);
            }

            setShowModal(false);
            setCurrentFlow({name: "", description: "", configuration: "", active: false});
            setIsEditing(false);
            fetchFlows();
        } catch (err) {
            console.error("Save error", err);
        }
    };

    const handleEditFlow = (flow) => {
        navigate(`/flows/edit/${flow.id}`);
    };


    useEffect(() => {
        fetchFlows();
    }, [page]);

    return (
        <div className="mt-5">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Flows</h1>
                <button
                    onClick={() => navigate('/flows/create')}
                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 transition"
                >
                    + New Flow
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg">
                            <thead className="bg-gray-900">
                            <tr>
                                <th className="py-3 px-4 text-left text-gray-300">Name</th>
                                <th className="py-3 px-4 text-left text-gray-300">Description</th>
                                <th className="py-3 px-4 text-left text-gray-300">Status</th>
                                <th className="py-3 px-4 text-left text-gray-300">Created</th>
                                <th className="py-3 px-4 text-left text-gray-300">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {flows.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-4 px-4 text-center text-gray-400">
                                        No flows found. Create your first flow!
                                    </td>
                                </tr>
                            ) : (
                                flows.map((flow) => (
                                    <tr key={flow.id}
                                        className="border-t border-gray-700 hover:bg-gray-700 text-gray-300">
                                        <td className="py-3 px-4">{flow.name}</td>
                                        <td className="py-3 px-4">{flow.description}</td>
                                        <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${flow.active ? 'bg-green-800 text-green-100' : 'bg-gray-700 text-gray-300'}`}>
                                                    {flow.active ? 'Active' : 'Inactive'}
                                                </span>
                                        </td>
                                        <td className="py-3 px-4">{new Date(flow.createdAt).toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditFlow(flow)}
                                                    className="px-3 py-1 bg-gray-900 rounded hover:bg-gray-600 text-sm text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFlow(flow.id)}
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
                        {Array.from({length: totalPages}, (_, i) => (
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
                </>
            )}

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-gray-200">{isEditing ? 'Edit Flow' : 'Create New Flow'}</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
                            <input
                                type="text"
                                value={currentFlow.name}
                                onChange={(e) => setCurrentFlow({...currentFlow, name: e.target.value})}
                                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                            <textarea
                                value={currentFlow.description}
                                onChange={(e) => setCurrentFlow({...currentFlow, description: e.target.value})}
                                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
                                rows="3"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 text-gray-300">Configuration (JSON)</label>
                            <textarea
                                value={currentFlow.configuration}
                                onChange={(e) => setCurrentFlow({...currentFlow, configuration: e.target.value})}
                                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200 font-mono text-sm"
                                rows="5"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={currentFlow.active}
                                    onChange={(e) => setCurrentFlow({...currentFlow, active: e.target.checked})}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-300">Active</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateOrUpdateFlow}
                                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
                            >
                                {isEditing ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
