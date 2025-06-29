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
            <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500" onClick={data.onExecute}>▶</button>
            <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500" onClick={data.onRemove}>✕</button>
        </div>
        <div className="text-white font-medium mt-4">Manual Trigger</div>
        <div className="text-blue-300 text-xs mt-1">Triggered manually by user</div>
        <Handle type="source" position="bottom" id="a" isConnectable={isConnectable} />
    </div>
);

const CronTriggerNode = ({ data, isConnectable }) => (
    <div className="border border-purple-500 rounded-lg p-4 bg-purple-900 relative">
        <div className="absolute top-1 right-1 flex gap-2">
            <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500" onClick={data.onExecute}>▶</button>
            <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500" onClick={data.onRemove}>✕</button>
        </div>
        <div className="text-white font-medium mt-4">CRON Trigger</div>
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

PlaceholderNode.propTypes = { data: PropTypes.object.isRequired, isConnectable: PropTypes.bool };
ManualTriggerNode.propTypes = { data: PropTypes.object.isRequired, isConnectable: PropTypes.bool };
CronTriggerNode.propTypes = { data: PropTypes.object.isRequired, isConnectable: PropTypes.bool };

const nodeTypes = {
    placeholder: PlaceholderNode,
    manualTrigger: ManualTriggerNode,
    cronTrigger: CronTriggerNode,
};

export const FlowCreationPage = () => {
    const { getAccessTokenSilently } = useAuth0();
    const { id } = useParams();
    const navigate = useNavigate();
    const reactFlowWrapper = useRef(null);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const [loading, setLoading] = useState(!!id);
    const [flowName, setFlowName] = useState('');
    const [flowDescription, setFlowDescription] = useState('');
    const [flowActive, setFlowActive] = useState(false);

    const [placeholderId, setPlaceholderId] = useState(null);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);

    const handlePlaceholderClick = useCallback((id) => {
        setPlaceholderId(id);
        setRightPanelOpen(true);
    }, []);

    const resetToPlaceholder = useCallback((id) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        type: 'placeholder',
                        data: { onClick: () => handlePlaceholderClick(id) },
                    }
                    : node
            )
        );
    }, [setNodes, handlePlaceholderClick]);

    const applyTriggerNode = useCallback((type) => {
        if (!placeholderId) return;
        const nodeId = placeholderId;

        const onExecute = () => alert(`${type.toUpperCase()} triggered`);
        const onRemove = () => resetToPlaceholder(nodeId);

        const data =
            type === 'manual'
                ? { onExecute, onRemove }
                : {
                    cron: '',
                    onExecute,
                    onRemove,
                    onCronChange: (cron) => {
                        setNodes((nds) =>
                            nds.map((n) =>
                                n.id === nodeId ? { ...n, data: { ...n.data, cron } } : n
                            )
                        );
                    },
                };

        const nodeType = type === 'manual' ? 'manualTrigger' : 'cronTrigger';

        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId ? { ...node, type: nodeType, data } : node
            )
        );

        setRightPanelOpen(false);
        setPlaceholderId(null);
    }, [placeholderId, resetToPlaceholder, setNodes]);

    const hydrateNode = (node) => {
        const base = { ...node };
        if (node.type === 'placeholder') {
            base.data = { onClick: () => handlePlaceholderClick(node.id) };
        }
        if (node.type === 'manualTrigger') {
            base.data = {
                ...node.data,
                onExecute: () => alert('MANUAL triggered'),
                onRemove: () => resetToPlaceholder(node.id),
            };
        }
        if (node.type === 'cronTrigger') {
            base.data = {
                ...node.data,
                onExecute: () => alert('CRON triggered'),
                onRemove: () => resetToPlaceholder(node.id),
                onCronChange: (cron) => {
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === node.id ? { ...n, data: { ...n.data, cron } } : n
                        )
                    );
                },
            };
        }
        return base;
    };

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
        } else {
            const fetchFlow = async () => {
                try {
                    const token = await getAccessTokenSilently();
                    const flowData = await getFlowById(token, id);
                    setFlowName(flowData.name);
                    setFlowDescription(flowData.description);
                    setFlowActive(flowData.active);
                    if (flowData.configuration) {
                        const config = JSON.parse(flowData.configuration);
                        const enrichedNodes = config.nodes.map(hydrateNode);
                        setNodes(enrichedNodes);
                        setEdges(config.edges);
                    }
                } catch (err) {
                    console.error('Load error', err);
                    navigate('/flows');
                } finally {
                    setLoading(false);
                }
            };
            fetchFlow();
        }
    }, [id, getAccessTokenSilently, navigate, handlePlaceholderClick]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
    const onDrop = useCallback((event) => {
        event.preventDefault();
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;
        const position = reactFlowInstance.project({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        });
        const newNode = { id: `${Date.now()}`, type, position, data: { label: `${type} node` } };
        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance]);

    const onSave = async () => {
        if (!flowName.trim()) return alert('Flow name is required');
        try {
            const token = await getAccessTokenSilently();
            const flowData = {
                name: flowName,
                description: flowDescription,
                configuration: JSON.stringify({ nodes, edges }),
                active: flowActive,
            };
            id ? await updateFlow(token, id, flowData) : await createFlow(token, flowData);
            navigate('/flows');
        } catch (e) {
            console.error('Save failed', e);
            alert('Could not save.');
        }
    };

    const onCancel = () => navigate('/flows');

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Left Sidebar */}
            <div className={`transition-all bg-gray-900 text-white p-4 ${leftPanelOpen ? 'w-80' : 'w-12'} flex flex-col`}>
                <button onClick={() => setLeftPanelOpen(!leftPanelOpen)} className="text-gray-400 hover:text-white self-end mb-4">
                    {leftPanelOpen ? '←' : '→'}
                </button>
                {leftPanelOpen && (
                    <>
                        <h2 className="text-xl font-bold mb-4">{id ? 'Edit Flow' : 'Create Flow'}</h2>
                        <label className="text-sm font-medium mb-1">Name</label>
                        <input value={flowName} onChange={(e) => setFlowName(e.target.value)} className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded" />
                        <label className="text-sm font-medium mb-1">Description</label>
                        <textarea value={flowDescription} onChange={(e) => setFlowDescription(e.target.value)} rows="2" className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded" />
                        <label className="flex items-center mb-4">
                            <input type="checkbox" checked={flowActive} onChange={(e) => setFlowActive(e.target.checked)} className="mr-2" />
                            Active
                        </label>
                        <button onClick={onCancel} className="w-full border border-gray-600 px-3 py-2 rounded hover:bg-gray-700 mb-2">Cancel</button>
                        <button onClick={onSave} className="w-full bg-blue-600 px-3 py-2 rounded text-white hover:bg-blue-500">Save</button>
                    </>
                )}
            </div>

            {/* Flow Editor */}
            <div className="flex-1 bg-gray-800 relative" ref={reactFlowWrapper}>
                {!loading && (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        nodeTypes={nodeTypes}
                        onInit={setReactFlowInstance}
                        fitView
                    >
                        <Background variant="dots" gap={12} size={1} />
                    </ReactFlow>
                )}
            </div>

            {/* Right Trigger Selector */}
            {rightPanelOpen && (
                <div className="w-64 bg-gray-900 text-white p-4 border-l border-gray-700 flex flex-col">
                    <h2 className="text-lg font-semibold mb-4">Choose Trigger</h2>
                    <button onClick={() => applyTriggerNode('manual')} className="mb-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white">Manual Trigger</button>
                    <button onClick={() => applyTriggerNode('cron')} className="mb-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 text-white">CRON Trigger</button>
                    <button onClick={() => setRightPanelOpen(false)} className="mt-auto px-4 py-2 text-sm text-gray-400 hover:text-white">Close</button>
                </div>
            )}
        </div>
    );
};
