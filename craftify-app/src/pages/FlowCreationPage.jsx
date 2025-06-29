import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import PropTypes from 'prop-types';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createFlow, getFlowById, updateFlow } from '../services/API';

// ────────────────────────────────────────────
// Custom Nodes

const PlaceholderNode = ({ data, isConnectable }) => (
    <div
        className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-800 text-center cursor-pointer hover:bg-gray-700 transition"
        onClick={data.onClick}
    >
        <div className="text-gray-300 font-medium text-lg">+ Add First Node</div>
        <div className="text-gray-500 text-xs mt-1">Click to create a trigger</div>
        <Handle type="source" position="bottom" id="a" isConnectable={isConnectable} />
    </div>
);

const ManualTriggerNode = ({ data, isConnectable }) => (
    <div className="border border-blue-500 rounded-lg p-4 bg-blue-900 relative">
        <div className="absolute top-1 right-1 flex gap-2">
            <button
                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500"
                onClick={data.onExecute}
            >
                ▶
            </button>
            <button
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                onClick={data.onRemove}
            >
                ✕
            </button>
        </div>
        <div className="flex justify-between items-center mb-2 mt-4">
            <div className="text-white font-medium">Manual Trigger</div>
        </div>
        <div className="text-blue-300 text-xs mt-1">Triggered manually by user</div>
        <Handle type="source" position="bottom" id="a" isConnectable={isConnectable} />
    </div>
);

const CronTriggerNode = ({ data, isConnectable }) => (
    <div className="border border-purple-500 rounded-lg p-4 bg-purple-900 relative">
        <div className="absolute top-1 right-1 flex gap-2">
            <button
                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500"
                onClick={data.onExecute}
            >
                ▶
            </button>
            <button
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                onClick={data.onRemove}
            >
                ✕
            </button>
        </div>
        <div className="flex justify-between items-center mb-2">
            <div className="text-white font-medium">CRON Trigger</div>
        </div>
        <div className="text-purple-300 text-xs">CRON: {data.cron || 'Not set'}</div>
        <input
            type="text"
            placeholder="0 0 * * *"
            value={data.cron || ''}
            onChange={(e) => data.onCronChange?.(e.target.value)}
            className="mt-2 w-full text-sm px-2 py-1 rounded bg-purple-700 text-white border border-purple-400"
        />
        <Handle type="source" position="bottom" id="a" isConnectable={isConnectable} />
    </div>
);

// ────────────────────────────────────────────
// PropTypes

PlaceholderNode.propTypes = {
    data: PropTypes.shape({
        onClick: PropTypes.func.isRequired,
    }).isRequired,
    isConnectable: PropTypes.bool,
};

ManualTriggerNode.propTypes = {
    data: PropTypes.shape({
        onExecute: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
    }).isRequired,
    isConnectable: PropTypes.bool,
};

CronTriggerNode.propTypes = {
    data: PropTypes.shape({
        cron: PropTypes.string,
        onExecute: PropTypes.func.isRequired,
        onCronChange: PropTypes.func,
        onRemove: PropTypes.func.isRequired,
    }).isRequired,
    isConnectable: PropTypes.bool,
};

// ────────────────────────────────────────────
// Flow Page

const nodeTypes = {
    placeholder: PlaceholderNode,
    manualTrigger: ManualTriggerNode,
    cronTrigger: CronTriggerNode,
};

export const FlowCreationPage = () => {
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const { id } = useParams();
    const reactFlowWrapper = useRef(null);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [flowName, setFlowName] = useState('');
    const [flowDescription, setFlowDescription] = useState('');
    const [flowActive, setFlowActive] = useState(false);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [loading, setLoading] = useState(!!id);
    const [showNodeTypeSelector, setShowNodeTypeSelector] = useState(false);
    const [placeholderId, setPlaceholderId] = useState(null);

    const handlePlaceholderClick = useCallback((id) => {
        setPlaceholderId(id);
        setShowNodeTypeSelector(true);
    }, []);

    const resetToPlaceholder = useCallback((id) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        type: 'placeholder',
                        data: {
                            onClick: () => handlePlaceholderClick(id),
                        },
                    }
                    : node
            )
        );
    }, [setNodes, handlePlaceholderClick]);

    const handleNodeTypeSelection = useCallback(
        (type) => {
            if (!placeholderId) return;

            const createNodeData = (type) => {
                if (type === 'manual') {
                    return {
                        onExecute: () => alert('Manual trigger executed!'),
                        onRemove: () => resetToPlaceholder(placeholderId),
                    };
                }
                return {
                    cron: '',
                    onExecute: () => alert('CRON trigger executed!'),
                    onCronChange: (value) =>
                        setNodes((nodes) =>
                            nodes.map((n) =>
                                n.id === placeholderId
                                    ? { ...n, data: { ...n.data, cron: value } }
                                    : n
                            )
                        ),
                    onRemove: () => resetToPlaceholder(placeholderId),
                };
            };

            setNodes((nds) =>
                nds.map((node) =>
                    node.id === placeholderId
                        ? {
                            ...node,
                            type: type === 'manual' ? 'manualTrigger' : 'cronTrigger',
                            data: createNodeData(type),
                        }
                        : node
                )
            );

            setShowNodeTypeSelector(false);
            setPlaceholderId(null);
        },
        [placeholderId, setNodes, resetToPlaceholder]
    );

    useEffect(() => {
        if (!id) {
            setNodes([
                {
                    id: '1',
                    type: 'placeholder',
                    data: { onClick: () => handlePlaceholderClick('1') },
                    position: { x: 250, y: 25 },
                },
            ]);
        }
    }, [id, handlePlaceholderClick, setNodes]);

    useEffect(() => {
        const fetchFlowData = async () => {
            if (id) {
                try {
                    const token = await getAccessTokenSilently();
                    const flowData = await getFlowById(token, id);
                    setFlowName(flowData.name);
                    setFlowDescription(flowData.description);
                    setFlowActive(flowData.active);

                    if (flowData.configuration) {
                        const config = JSON.parse(flowData.configuration);
                        if (config.nodes && config.edges) {
                            setNodes(config.nodes);
                            setEdges(config.edges);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching flow:', error);
                    alert('Failed to load flow data. Redirecting to flows list.');
                    navigate('/flows');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFlowData();
    }, [id, getAccessTokenSilently, navigate, setNodes, setEdges]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode = {
                id: `${Date.now()}`,
                type,
                position,
                data: { label: `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onSave = async () => {
        if (!flowName.trim()) {
            alert('Please enter a flow name');
            return;
        }

        try {
            const token = await getAccessTokenSilently();
            const config = { nodes, edges };

            const flowData = {
                name: flowName,
                description: flowDescription,
                configuration: JSON.stringify(config),
                active: flowActive,
            };

            if (id) {
                await updateFlow(token, id, flowData);
            } else {
                await createFlow(token, flowData);
            }

            navigate('/flows');
        } catch (error) {
            console.error('Error saving flow:', error);
            alert('Failed to save flow. Please try again.');
        }
    };

    const onCancel = () => navigate('/flows');

    return (
        <div className="mt-5">
            {showNodeTypeSelector && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 p-6 rounded shadow-lg text-center space-y-4">
                        <h2 className="text-white text-lg font-bold">Choose Node Type</h2>
                        <div className="flex justify-center gap-4">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                onClick={() => handleNodeTypeSelection('manual')}
                            >
                                Manual Trigger
                            </button>
                            <button
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
                                onClick={() => handleNodeTypeSelection('cron')}
                            >
                                CRON Trigger
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-400">Loading flow data...</p>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">{id ? 'Edit Flow' : 'Create New Flow'}</h1>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
                        <input
                            type="text"
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
                            placeholder="Enter flow name"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                        <textarea
                            value={flowDescription}
                            onChange={(e) => setFlowDescription(e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-gray-200"
                            rows="2"
                            placeholder="Enter flow description"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={flowActive}
                                onChange={(e) => setFlowActive(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium text-gray-300">Active</span>
                        </label>
                    </div>

                    <div className="border border-gray-700 rounded-lg mb-4" style={{ height: '500px' }} ref={reactFlowWrapper}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            nodeTypes={nodeTypes}
                            fitView
                        >
                            <Controls />
                            <MiniMap />
                            <Background variant="dots" gap={12} size={1} />
                        </ReactFlow>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
                        >
                            {id ? 'Update Flow' : 'Save Flow'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
