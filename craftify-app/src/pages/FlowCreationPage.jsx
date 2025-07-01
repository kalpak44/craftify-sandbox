import {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useAuth0} from '@auth0/auth0-react';
import ReactFlow, {
    addEdge,
    Background,
    useNodesState,
    useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {createFlow, updateFlow, executeFlow} from '../services/API';
import { Client } from '@stomp/stompjs';
import { useDebouncedCallback } from 'use-debounce';

import {
    PlaceholderNode,
    ManualTriggerNode,
    CronTriggerNode,
    LeftPanel,
    TriggerSelectionPanel,
    EdgeOptionsPanel,
    useFlowCreation
} from '../components/flow';
import GenericNode from '../components/flow/GenericNode';

// Helper components
const BottomBarTabs = ({ tabs, activeTab, setActiveTab }) => (
    <div className="flex border-b border-gray-700 bg-gray-800">
        {tabs.map((tab) => (
            <button
                key={tab}
                className={`px-4 py-2 focus:outline-none ${activeTab === tab ? 'border-b-2 border-blue-400 text-blue-400' : 'text-gray-300'}`}
                onClick={() => setActiveTab(tab)}
            >
                {tab}
            </button>
        ))}
    </div>
);

// Inline editable config row
const EditableConfigRow = ({ label, value, onChange }) => {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    useEffect(() => { setEditValue(value); }, [value]);
    return (
        <div className="flex items-center py-1">
            <div className="w-40 text-gray-400">{label}</div>
            {editing ? (
                <input
                    className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 flex-1"
                    value={editValue}
                    autoFocus
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => { setEditing(false); onChange(editValue); }}
                    onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onChange(editValue); } }}
                />
            ) : (
                <div
                    className="flex-1 cursor-pointer text-gray-200 hover:underline"
                    onDoubleClick={() => setEditing(true)}
                    title="Double-click to edit"
                >
                    {String(value)}
                </div>
            )}
        </div>
    );
};

// Variables/Secrets management section
const VariableManager = ({ items, setItems, type }) => {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const handleAdd = () => {
        if (!newKey) return;
        if (type === 'secrets') {
            setItems([...items, { key: newKey }]);
        } else {
            setItems([...items, { key: newKey, value: newValue }]);
        }
        setNewKey(''); setNewValue('');
    };
    const handleEdit = (idx, key, value) => {
        if (type === 'secrets') {
            setItems(items.map((item, i) => i === idx ? { key } : item));
        } else {
            setItems(items.map((item, i) => i === idx ? { key, value } : item));
        }
    };
    const handleDelete = (idx) => {
        setItems(items.filter((_, i) => i !== idx));
    };
    return (
        <div className="space-y-2">
            <div className="flex gap-2 mb-2">
                <input className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600" placeholder="Key" value={newKey} onChange={e => setNewKey(e.target.value)} />
                {type !== 'secrets' && (
                    <input className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600" placeholder="Value" value={newValue} onChange={e => setNewValue(e.target.value)} />
                )}
                <button className="bg-blue-600 px-3 py-1 rounded text-white" onClick={handleAdd}>Add</button>
            </div>
            {items.length === 0 && <div className="text-gray-400">No {type} defined.</div>}
            {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                    <input className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 w-32" value={item.key} onChange={e => handleEdit(idx, e.target.value, item.value)} />
                    {type !== 'secrets' && (
                        <input className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 flex-1" value={item.value} onChange={e => handleEdit(idx, item.key, e.target.value)} />
                    )}
                    <button className="text-red-400 px-2" onClick={() => handleDelete(idx)}>Delete</button>
                </div>
            ))}
        </div>
    );
};

export const FlowCreationPage = () => {
    const {getAccessTokenSilently} = useAuth0();
    const {id: paramId} = useParams();
    const navigate = useNavigate();
    const reactFlowWrapper = useRef(null);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const [placeholderId, setPlaceholderId] = useState(null);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [rightDragPanelOpen, setRightDragPanelOpen] = useState(false);
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);

    // State for bottom bar and selected action node
    const [selectedActionNode, setSelectedActionNode] = useState(null);
    const [bottomBarOpen, setBottomBarOpen] = useState(false);
    const [bottomBarHeight, setBottomBarHeight] = useState(180);
    const [isResizingBar, setIsResizingBar] = useState(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);
    const [selectedNodeId, setSelectedNodeId] = useState(null);

    // Use local flowId state to track the current flow id (initialized from params.id if present)
    const [flowId, setFlowId] = useState(paramId || null);

    const {
        loading,
        flowName,
        setFlowName,
        flowDescription,
        setFlowDescription,
        flowActive,
        setFlowActive,
        onCancel,
        loadFlowData
    } = useFlowCreation(flowId);

    const [bottomBarTab, setBottomBarTab] = useState('Config');
    const [variables, setVariables] = useState([]); // system variables
    const [secrets, setSecrets] = useState([]); // secrets
    const [config, setConfig] = useState({});

    const [executingNodeId, setExecutingNodeId] = useState(null);

    // Add state to store logs for each node
    const [nodeLogs, setNodeLogs] = useState({});

    // Track if a flow execution is in progress to clear logs on new execution
    const executionInProgress = useRef(false);

    // Move nodeTypes here so it can access executingNodeId
    const nodeTypes = useMemo(() => ({
        placeholder: PlaceholderNode,
        manualTrigger: ManualTriggerNode,
        cronTrigger: CronTriggerNode,
        action: (props) => <GenericNode {...props} executing={props.id === executingNodeId} />,
    }), [executingNodeId]);

    // Sync config state with selectedActionNode
    useEffect(() => {
        if (selectedActionNode && selectedActionNode.data) {
            // Only show primitive values for config (not functions)
            const filtered = Object.fromEntries(
                Object.entries(selectedActionNode.data).filter(
                    ([k, v]) => typeof v !== 'function'
                )
            );
            setConfig(filtered);
        }
    }, [selectedActionNode]);

    const handlePlaceholderClick = useCallback((id) => {
        setPlaceholderId(id);
        setRightPanelOpen(true);
    }, []);

    const resetToPlaceholder = useCallback((id) => {
        setRightDragPanelOpen(false);
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        type: 'placeholder',
                        data: {onClick: () => handlePlaceholderClick(id)},
                    }
                    : node
            )
        );
    }, [setNodes, handlePlaceholderClick]);

    const applyTriggerNode = useCallback((type) => {
        if (!placeholderId) return;
        const nodeId = placeholderId;

        const onExecute = async () => {
            if (!flowId) {
                alert('Please save the flow first before executing it.');
                return;
            }
            try {
                const token = await getAccessTokenSilently();
                await executeFlow(token, flowId);
                alert(`${type.toUpperCase()} trigger executed successfully!`);
            } catch (error) {
                console.error('Flow execution failed:', error);
                alert(`Failed to execute flow: ${error.message}`);
            }
        };
        const onRemove = () => resetToPlaceholder(nodeId);

        const data =
            type === 'manual'
                ? {onExecute, onRemove}
                : {
                    cron: '',
                    onExecute,
                    onRemove,
                    onCronChange: (cron) => {
                        setNodes((nds) =>
                            nds.map((n) =>
                                n.id === nodeId ? {...n, data: {...n.data, cron}} : n
                            )
                        );
                    },
                };

        const nodeType = type === 'manual' ? 'manualTrigger' : 'cronTrigger';

        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId ? {...node, type: nodeType, data} : node
            )
        );

        setRightPanelOpen(false);
        setPlaceholderId(null);
    }, [placeholderId, resetToPlaceholder, setNodes, flowId, getAccessTokenSilently]);

    const hydrateNode = (node) => {
        const base = {...node};
        if (node.type === 'action') {
            base.selected = node.id === selectedNodeId;
        }
        if (node.type === 'placeholder') {
            base.data = {onClick: () => handlePlaceholderClick(node.id)};
        }
        if (node.type === 'manualTrigger') {
            base.data = {
                ...node.data,
                onExecute: async () => {
                    if (!flowId) {
                        alert('Please save the flow first before executing it.');
                        return;
                    }
                    try {
                        const token = await getAccessTokenSilently();
                        await executeFlow(token, flowId);
                        alert('Manual trigger executed successfully!');
                    } catch (error) {
                        console.error('Flow execution failed:', error);
                        alert(`Failed to execute flow: ${error.message}`);
                    }
                },
                onRemove: () => resetToPlaceholder(node.id),
            };
        }
        if (node.type === 'cronTrigger') {
            base.data = {
                ...node.data,
                onExecute: async () => {
                    if (!flowId) {
                        alert('Please save the flow first before executing it.');
                        return;
                    }
                    try {
                        const token = await getAccessTokenSilently();
                        await executeFlow(token, flowId);
                        alert('Cron trigger executed successfully!');
                    } catch (error) {
                        console.error('Flow execution failed:', error);
                        alert(`Failed to execute flow: ${error.message}`);
                    }
                },
                onRemove: () => resetToPlaceholder(node.id),
                onCronChange: (cron) => {
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === node.id ? {...n, data: {...n.data, cron}} : n
                        )
                    );
                },
            };
        }
        if (node.type === 'action') {
            base.data = {
                ...node.data,
                onRemove: () => {
                    setNodes((nds) => nds.filter((n) => n.id !== node.id));
                },
                onClick: () => {
                    setSelectedActionNode(base);
                    setBottomBarOpen(true);
                },
            };
        }
        return base;
    };

    useEffect(() => {
        if (!flowId) {
            setNodes([
                {
                    id: '1',
                    type: 'placeholder',
                    data: {onClick: () => handlePlaceholderClick('1')},
                    position: {x: 250, y: 25},
                },
            ]);
        } else {
            const initializeFlow = async () => {
                const flowData = await loadFlowData();
                if (flowData?.configuration) {
                    const config = JSON.parse(flowData.configuration);
                    const enrichedNodes = config.nodes.map(hydrateNode);
                    setNodes(enrichedNodes);
                    setEdges(config.edges);
                }
            };
            initializeFlow();
        }
    }, [flowId, loadFlowData, handlePlaceholderClick, setNodes, setEdges]);

    const onConnect = useCallback((params) => {
        // Ensure the edge has the proper sourceHandle information
        const edge = {
            ...params,
            id: `e${params.source}-${params.sourceHandle || 'default'}-${params.target}`,
            // Preserve sourceHandle if it exists (for success/failure paths)
            ...(params.sourceHandle && { sourceHandle: params.sourceHandle })
        };
        setEdges((eds) => addEdge(edge, eds));
    }, [setEdges]);
    
    const onDrop = useCallback((event) => {
        event.preventDefault();
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;
        const position = reactFlowInstance.project({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        });
        const nodeId = `${Date.now()}`;
        let newNode;
        if (type === 'action') {
            newNode = {
                id: nodeId,
                type,
                position,
                data: {
                    label: `${type} node`,
                    onRemove: () => {
                        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
                    },
                    onClick: () => {
                        setSelectedNodeId(nodeId);
                        setSelectedActionNode({
                            id: nodeId,
                            type: 'action',
                            position,
                            data: {
                                label: `${type} node`,
                            }
                        });
                        setBottomBarOpen(true);
                    },
                }
            };
        } else {
            newNode = {id: nodeId, type, position, data: {label: `${type} node`}};
        }
        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes, setSelectedActionNode, setSelectedNodeId]);

    const handleNodeTemplateSelect = useCallback((template) => {
        if (!reactFlowInstance) return;
        
        // Get the center of the viewport
        const center = reactFlowInstance.getViewport();
        const position = reactFlowInstance.project({
            x: center.x + 200,
            y: center.y + 100,
        });

        // Create node ID first
        const nodeId = `${Date.now()}`;

        // Create a new node based on the template
        const newNode = {
            id: nodeId,
            type: 'action',
            position,
            data: {
                label: template.name,
                templateId: template.id,
                templateName: template.name,
                ...JSON.parse(template.configuration || '{}'),
                onRemove: () => {
                    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
                },
                onClick: () => {
                    setSelectedNodeId(nodeId);
                    setSelectedActionNode({
                        id: nodeId,
                        type: 'action',
                        position,
                        data: {
                            label: template.name,
                            templateId: template.id,
                            templateName: template.name,
                            ...JSON.parse(template.configuration || '{}'),
                        }
                    });
                    setBottomBarOpen(true);
                },
            }
        };

        setNodes((nds) => nds.concat(newNode));
        setRightDragPanelOpen(false);
    }, [reactFlowInstance, setNodes, setRightDragPanelOpen, setSelectedActionNode, setSelectedNodeId]);

    // Save handler (used for Save button)
    const onSave = async () => {
        if (!flowName.trim()) return alert('Flow name is required');
        try {
            const token = await getAccessTokenSilently();
            const flowData = {
                name: flowName,
                description: flowDescription,
                configuration: JSON.stringify({nodes, edges}),
                active: flowActive,
            };
            if (flowId) {
                await updateFlow(token, flowId, flowData);
            } else {
                const created = await createFlow(token, flowData);
                if (created && created.id) {
                    setFlowId(created.id);
                }
            }
            navigate('/flows');
        } catch (e) {
            console.error('Save failed', e);
            alert('Could not save.');
        }
    };

    // Drag handlers for bottom bar
    const handleBarMouseDown = (e) => {
        setIsResizingBar(true);
        startYRef.current = e.clientY;
        startHeightRef.current = bottomBarHeight;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
    };
    useEffect(() => {
        if (!isResizingBar) return;
        const handleMouseMove = (e) => {
            const deltaY = startYRef.current - e.clientY;
            let newHeight = Math.max(100, Math.min(400, startHeightRef.current + deltaY));
            setBottomBarHeight(newHeight);
        };
        const handleMouseUp = () => {
            setIsResizingBar(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingBar]);

    // Close bottom bar if no node is selected
    useEffect(() => {
        if (!selectedNodeId) {
            setSelectedActionNode(null);
            setBottomBarOpen(false);
        } else {
            // Find the node and set as selectedActionNode
            const node = nodes.find(n => n.id === selectedNodeId && n.type === 'action');
            if (node) {
                setSelectedActionNode(node);
                setBottomBarOpen(true);
            } else {
                setSelectedActionNode(null);
                setBottomBarOpen(false);
            }
        }
    }, [selectedNodeId, nodes]);

    useEffect(() => {
        if (!flowId) return;
        let client;
        let isActive = true;
        (async () => {
            const token = await getAccessTokenSilently();
            if (!isActive) return;
            client = new Client({
                brokerURL: 'ws://localhost:8080/ws-native',
                reconnectDelay: 5000,
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                debug: (str) => console.log('[STOMP DEBUG]', str),
            });
            client.onConnect = (frame) => {
                console.log('[STOMP] Connected:', frame);
                client.subscribe(`/topic/flow-execution/${flowId}`, (message) => {
                    console.log('[STOMP] Message received:', message.body);
                    const data = JSON.parse(message.body);
                    if (data.type === 'node_execution' && data.status === 'started') {
                        // If not already in progress, clear logs for all nodes
                        if (!executionInProgress.current) {
                            setNodeLogs({});
                            executionInProgress.current = true;
                        }
                        setExecutingNodeId(data.nodeId);
                        setSelectedNodeId(data.nodeId);
                        setBottomBarTab('Logs');
                        setBottomBarOpen(true);
                    }
                    if (data.type === 'flow_execution' && data.status === 'completed') {
                        setExecutingNodeId(null);
                        executionInProgress.current = false;
                    }
                    if (data.type === 'flow_execution' && data.status === 'failed') {
                        setExecutingNodeId(null);
                        alert('Flow execution failed: ' + (data.error || 'Unknown error'));
                        executionInProgress.current = false;
                    }
                    if (data.type === 'node_log' && data.nodeId && data.log) {
                        console.log('[LOG EVENT]', data);
                        setNodeLogs(prev => {
                            const updated = {
                                ...prev,
                                [data.nodeId]: [...(prev[data.nodeId] || []), data.log]
                            };
                            console.log('[nodeLogs updated]', updated);
                            return updated;
                        });
                    }
                });
                console.log('[STOMP] Subscribed to', `/topic/flow-execution/${flowId}`);
            };
            client.onStompError = (frame) => {
                console.error('[STOMP] Broker error:', frame.headers['message'], frame.body);
            };
            client.onWebSocketError = (event) => {
                console.error('[STOMP] WebSocket error:', event);
            };
            client.onDisconnect = (frame) => {
                console.log('[STOMP] Disconnected:', frame);
            };
            client.activate();
        })();
        return () => {
            isActive = false;
            if (client) client.deactivate();
        };
    }, [flowId, getAccessTokenSilently]);

    useEffect(() => {
        console.log('[nodeLogs state]', nodeLogs);
    }, [nodeLogs]);

    useEffect(() => {
        console.log('[selectedActionNode]', selectedActionNode?.id);
    }, [selectedActionNode]);

    // Hydrate nodes with orange border if executing
    const hydratedNodes = nodes;

    // Autosave logic
    const debouncedSave = useDebouncedCallback(async (nodes, edges, flowName, flowDescription, flowActive, flowId) => {
        if (!flowName.trim()) return; // Don't save if no name
        try {
            const token = await getAccessTokenSilently();
            const flowData = {
                name: flowName,
                description: flowDescription,
                configuration: JSON.stringify({ nodes, edges }),
                active: flowActive,
            };
            if (flowId) {
                await updateFlow(token, flowId, flowData);
            } else {
                // Create new flow and set id for subsequent updates
                const created = await createFlow(token, flowData);
                if (created && created.id) {
                    setFlowId(created.id);
                }
            }
        } catch (e) {
            console.error('Autosave failed', e);
        }
    }, 1000); // 1s debounce

    useEffect(() => {
        debouncedSave(nodes, edges, flowName, flowDescription, flowActive, flowId);
    }, [nodes, edges, flowName, flowDescription, flowActive, flowId, debouncedSave]);

    return (
        <div className="h-screen flex overflow-hidden overflow-x-hidden">
            <LeftPanel
                leftPanelOpen={leftPanelOpen}
                setLeftPanelOpen={setLeftPanelOpen}
                id={flowId}
                flowName={flowName}
                setFlowName={setFlowName}
                flowDescription={flowDescription}
                setFlowDescription={setFlowDescription}
                flowActive={flowActive}
                setFlowActive={setFlowActive}
                onCancel={onCancel}
                onSave={onSave}
            />

            <div className="flex-1 bg-gray-800 relative overflow-x-hidden" ref={reactFlowWrapper}>
                {!loading && (
                    <ReactFlow
                        nodes={hydratedNodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onConnectEnd={() => setRightDragPanelOpen(true)}
                        onDrop={onDrop}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                        }}
                        onInit={setReactFlowInstance}
                        nodeTypes={nodeTypes}
                        fitView
                        onNodeClick={(event, node) => {
                            setSelectedNodeId(node.id);
                            if (node.type === 'action' && node.data?.onClick) {
                                node.data.onClick();
                            }
                        }}
                        onPaneClick={() => {
                            setSelectedNodeId(null);
                            setSelectedActionNode(null);
                        }}
                    >
                        <Background variant="dots" gap={12} size={1}/>
                    </ReactFlow>
                )}

                <EdgeOptionsPanel
                    rightDragPanelOpen={rightDragPanelOpen}
                    setRightDragPanelOpen={setRightDragPanelOpen}
                    onNodeTemplateSelect={handleNodeTemplateSelect}
                />

                {/* Bottom Bar for Action Node Logs */}
                {bottomBarOpen && selectedActionNode && (
                    <div
                        className="absolute left-0 right-0 bottom-0 bg-gray-900 text-white border-t border-gray-700 z-50 flex flex-col"
                        style={{ minHeight: '100px', maxHeight: '400px', height: bottomBarHeight }}
                    >
                        {/* Drag handle */}
                        <div
                            className="w-full h-3 cursor-ns-resize flex items-center justify-center bg-gray-800 border-b border-gray-700"
                            onMouseDown={handleBarMouseDown}
                            style={{ userSelect: 'none' }}
                        >
                            <div className="w-12 h-1 rounded bg-gray-600" />
                        </div>
                        {/* Tabs */}
                        <BottomBarTabs
                            tabs={['Config', 'Logs', 'Variables', 'Secrets']}
                            activeTab={bottomBarTab}
                            setActiveTab={setBottomBarTab}
                        />
                        <div className="flex-1 flex flex-col overflow-y-auto p-4">
                            {bottomBarTab === 'Config' && (
                                <div>
                                    <div className="font-bold text-lg mb-2">Config</div>
                                    <div className="space-y-2">
                                        {Object.entries(config).length === 0 && <div className="text-gray-400">No config available.</div>}
                                        {Object.entries(config).map(([key, value]) => (
                                            <EditableConfigRow
                                                key={key}
                                                label={key}
                                                value={value}
                                                onChange={val => {
                                                    setConfig(cfg => ({ ...cfg, [key]: val }));
                                                    if (selectedActionNode) {
                                                        setNodes(nds =>
                                                            nds.map(node =>
                                                                node.id === selectedActionNode.id
                                                                    ? { ...node, data: { ...node.data, [key]: val } }
                                                                    : node
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">Double-click a value to edit.</div>
                                </div>
                            )}
                            {bottomBarTab === 'Logs' && (
                                <div>
                                    <div className="font-bold text-lg mb-2">
                                        Node Logs: {selectedActionNode?.data?.label || selectedActionNode?.data?.templateName || selectedActionNode?.id}
                                    </div>
                                    <div className="mt-3 font-mono text-base text-gray-200" style={{whiteSpace: 'pre-wrap'}}>
                                        {(selectedActionNode && nodeLogs[selectedActionNode.id]) ?
                                            nodeLogs[selectedActionNode.id].join('\n') :
                                            <div className="text-gray-400">No logs yet.</div>
                                        }
                                    </div>
                                </div>
                            )}
                            {bottomBarTab === 'Variables' && (
                                <div>
                                    <div className="font-bold text-lg mb-2">System Variables</div>
                                    <VariableManager items={variables} setItems={setVariables} type="variables" />
                                </div>
                            )}
                            {bottomBarTab === 'Secrets' && (
                                <div>
                                    <div className="font-bold text-lg mb-2">Secrets</div>
                                    <VariableManager items={secrets} setItems={setSecrets} type="secrets" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <TriggerSelectionPanel
                rightPanelOpen={rightPanelOpen}
                applyTriggerNode={applyTriggerNode}
                setRightPanelOpen={setRightPanelOpen}
            />
        </div>
    );
};
