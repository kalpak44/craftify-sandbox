import {useState, useCallback, useRef, useEffect} from 'react';
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

const nodeTypes = {
    placeholder: PlaceholderNode,
    manualTrigger: ManualTriggerNode,
    cronTrigger: CronTriggerNode,
    action: GenericNode,
};

// Add a simple Tabs component for the bottom bar
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
    const {id} = useParams();
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
    const [, setBottomBarOpen] = useState(false);
    const [bottomBarHeight, setBottomBarHeight] = useState(180);
    const [isResizingBar, setIsResizingBar] = useState(false);
    const startYRef = useRef(0);
    const startHeightRef = useRef(0);
    const [selectedNodeId, setSelectedNodeId] = useState(null);

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
    } = useFlowCreation(id);

    const [bottomBarTab, setBottomBarTab] = useState('Config');
    const [variables, setVariables] = useState([]); // system variables
    const [secrets, setSecrets] = useState([]); // secrets
    const [config, setConfig] = useState({});

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
            if (!id) {
                alert('Please save the flow first before executing it.');
                return;
            }
            try {
                const token = await getAccessTokenSilently();
                await executeFlow(token, id);
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
    }, [placeholderId, resetToPlaceholder, setNodes, id, getAccessTokenSilently]);

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
                    if (!id) {
                        alert('Please save the flow first before executing it.');
                        return;
                    }
                    try {
                        const token = await getAccessTokenSilently();
                        await executeFlow(token, id);
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
                    if (!id) {
                        alert('Please save the flow first before executing it.');
                        return;
                    }
                    try {
                        const token = await getAccessTokenSilently();
                        await executeFlow(token, id);
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
        if (!id) {
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
    }, [id, loadFlowData, handlePlaceholderClick, setNodes, setEdges]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
    
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
            id ? await updateFlow(token, id, flowData) : await createFlow(token, flowData);
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
            setBottomBarOpen(false);
            setSelectedActionNode(null);
        } else {
            // If the selected node is not an action node, also close
            const node = nodes.find(n => n.id === selectedNodeId && n.type === 'action');
            if (!node) {
                setBottomBarOpen(false);
                setSelectedActionNode(null);
            }
        }
    }, [selectedNodeId, nodes]);

    return (
        <div className="h-screen flex overflow-hidden overflow-x-hidden">
            <LeftPanel
                leftPanelOpen={leftPanelOpen}
                setLeftPanelOpen={setLeftPanelOpen}
                id={id}
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
                        nodes={nodes}
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
                {selectedActionNode && (
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
                                                onChange={val => setConfig(cfg => ({ ...cfg, [key]: val }))}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">Double-click a value to edit.</div>
                                </div>
                            )}
                            {bottomBarTab === 'Logs' && (
                                <div>
                                    <div className="font-bold text-lg mb-2">
                                        Node Logs: {selectedActionNode.data?.label || selectedActionNode.data?.templateName || selectedActionNode.id}
                                    </div>
                                    <div className="mt-3 font-mono text-base text-gray-200">
                                        {/* Mock logs for now */}
                                        <div>[12:00:01] Node started execution...</div>
                                        <div>[12:00:02] Node completed successfully.</div>
                                        <div>[12:00:03] Output: {'{"result": "42"}'}</div>
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
