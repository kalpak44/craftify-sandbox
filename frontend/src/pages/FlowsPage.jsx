import { useState } from "react";

export const FlowsPage = () => {
    const [flows, setFlows] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [flowName, setFlowName] = useState("");
    const [flowDescription, setFlowDescription] = useState("");
    const [parameters, setParameters] = useState([{ key: "", value: "" }]);

    const openModal = () => {
        setFlowName("");
        setFlowDescription("");
        setParameters([]);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleAddParameter = () => {
        setParameters([...parameters, { key: "", value: "" }]);
    };

    const handleRemoveParameter = (index) => {
        setParameters(parameters.filter((_, i) => i !== index));
    };

    const handleChangeParameter = (index, field, value) => {
        const updated = [...parameters];
        updated[index][field] = value;
        setParameters(updated);
    };

    const handleCreateFlow = () => {
        const newFlow = {
            name: flowName,
            description: flowDescription,
            parameters: parameters.filter(p => p.key.trim() !== "")
        };
        alert(`Flow Created:\n${JSON.stringify(newFlow, null, 2)}`);
        setFlows([...flows, newFlow]);
        closeModal();
    };

    if (flows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <h1 className="text-4xl font-semibold mb-2">Flows</h1>
                <p className="text-gray-400 mb-1 text-lg">No flows created</p>
                <p className="text-gray-500 mb-6">Get started by creating a new flow.</p>
                <button
                    onClick={openModal}
                    className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                >
                    Create Flow
                </button>

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
                                            onChange={(e) => handleChangeParameter(index, "key", e.target.value)}
                                            className="flex-1 px-2 py-1 bg-gray-700 text-white rounded"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            value={param.value}
                                            onChange={(e) => handleChangeParameter(index, "value", e.target.value)}
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
    }

    // (future: render flows list)
    return (
        <div className="p-10 text-white">
            <h1 className="text-2xl font-semibold mb-4">Your Flows</h1>
            {flows.map((flow, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded mb-4 border border-gray-700">
                    <h2 className="text-lg font-bold">{flow.name}</h2>
                    <p className="text-sm text-gray-400 mb-2">{flow.description}</p>
                    <ul className="text-sm text-gray-300">
                        {flow.parameters.map((param, i) => (
                            <li key={i}>
                                <span className="text-blue-300">{param.key}</span>: {param.value}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};
