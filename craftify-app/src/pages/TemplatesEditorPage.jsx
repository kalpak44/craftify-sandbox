import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, addEdge, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { LeftPanel, EdgeOptionsPanel, TriggerSelectionPanel } from '../components/flow';
import { useAuth0 } from '@auth0/auth0-react';
import { getFolderSchemaTree } from '../services/API';
import TemplateEdgePanel from '../components/flow/TemplateEdgePanel';

function InputNode({ id, data }) {
    // Only one type: Internal Input
    const [fetchMethod, setFetchMethod] = useState('fetchById');
    const [fetchId, setFetchId] = useState('');

    const handleApplyFetch = () => {
        if (fetchMethod === 'fetchById') {
            console.log(`Applied fetch method: ${fetchMethod}, id: ${fetchId}`);
        } else {
            console.log(`Applied fetch method: ${fetchMethod}`);
        }
        // Optionally, you can call a callback here
    };

    return (
        <>
            <div
                className={
                    `rounded-lg p-4 relative flex flex-col items-center border-2 border-blue-500 bg-blue-900`
                }
            >
                <button
                    className="absolute top-1 right-1 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    onClick={data.onRemove}
                    style={{lineHeight: 1}}
                >
                    ✕
                </button>
                <div className="text-white font-medium mb-2">
                    Internal Input
                </div>
                {data.schemaName && (
                    <div className="text-blue-200 text-xs mb-2">Schema: {data.schemaName}</div>
                )}
                <Handle type="output" position={Position.Bottom} className="w-3 h-3 bg-blue-400" />
                <div className="mt-3 flex flex-col items-center gap-2 w-full min-w-[180px] max-w-xs">
                    <button
                        className="w-full px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
                        onClick={data.onSelectSchema}
                    >
                        Select Schema
                    </button>
                    <select
                        className="w-full px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                        value={fetchMethod}
                        onChange={e => setFetchMethod(e.target.value)}
                    >
                        <option value="fetchById">fetchById</option>
                        <option value="fetchAll">fetchAll</option>
                    </select>
                    <input
                        type="text"
                        className="w-full px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                        placeholder="Enter id"
                        value={fetchId}
                        onChange={e => setFetchId(e.target.value)}
                        style={{ visibility: fetchMethod === 'fetchById' ? 'visible' : 'hidden' }}
                    />
                </div>
            </div>
        </>
    );
}

function OutputNode({ id, data }) {
    // Only one type: Logical Node
    return (
        <div
            className={
                `rounded-lg p-4 relative flex flex-col items-center border-2 border-yellow-500 bg-yellow-900`
            }
        >
            <button
                className="absolute top-1 right-1 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                onClick={data.onRemove}
                style={{lineHeight: 1}}
            >
                ✕
            </button>
            <div className="text-white font-medium mb-2">
                Logical Node
            </div>
            {data.schemaName && (
                <div className="text-yellow-200 text-xs mb-2">Schema: {data.schemaName}</div>
            )}
            <Handle type="input" position={Position.Bottom} className="w-3 h-3 bg-yellow-400" />
            <div className="mt-3 flex flex-col items-center gap-2 w-full min-w-[180px] max-w-xs">
                <button
                    className="w-full px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-600"
                    onClick={data.onSelectSchema}
                >
                    Select Schema
                </button>
            </div>
        </div>
    );
}

function FunctionalNode({ data }) {
    return (
        <div className="border border-purple-500 rounded-lg p-4 bg-purple-900 relative">
            <div className="text-white font-medium">Functional Node</div>
            <Handle type="input" position={Position.Left} className="w-3 h-3 bg-purple-400" />
            <Handle type="output" position={Position.Right} className="w-3 h-3 bg-purple-400" />
        </div>
    );
}

function PlaceholderNode({ data }) {
    return (
        <div
            className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-800 text-center cursor-pointer hover:bg-gray-700 transition"
            onClick={data.onClick}
        >
            <div className="text-gray-300 font-medium text-lg">+ Add Input Node</div>
            <div className="text-gray-500 text-xs mt-1">Click to create an input node</div>
        </div>
    );
}

function OutputPlaceholderNode({ data }) {
    return (
        <div
            className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-800 text-center cursor-pointer hover:bg-gray-700 transition"
            onClick={data.onClick}
        >
            <div className="text-gray-300 font-medium text-lg">+ Add Logical Node</div>
            <div className="text-gray-500 text-xs mt-1">Click to create a logical node</div>
        </div>
    );
}

export function TemplatesEditorPage() {
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [rightDragPanelOpen, setRightDragPanelOpen] = useState(false);
    const [bottomBarOpen, setBottomBarOpen] = useState(false);
    const [bottomBarHeight, setBottomBarHeight] = useState(180);
    const reactFlowWrapper = useRef(null);
    const { getAccessTokenSilently } = useAuth0();
    const [showSchemaModal, setShowSchemaModal] = useState(false);
    const [schemaModalTarget, setSchemaModalTarget] = useState(null); // 'input' or 'output'
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [schemaTree, setSchemaTree] = useState([]);
    const [loadingTree, setLoadingTree] = useState(false);

    // State for nodes and edges
    const [nodes, setNodes, onNodesChange] = useNodesState([
        {
            id: 'input-placeholder',
            type: 'placeholder',
            position: { x: 150, y: 150 },
            data: { onClick: () => setRightDragPanelOpen('input') },
        },
        {
            id: 'output-placeholder',
            type: 'outputPlaceholder',
            position: { x: 550, y: 150 },
            data: { onClick: () => setRightDragPanelOpen('output') },
        },
    ]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodeTypes = useMemo(
        () => ({
            inputNode: InputNode,
            outputNode: OutputNode,
            functionalNode: FunctionalNode,
            placeholder: PlaceholderNode,
            outputPlaceholder: OutputPlaceholderNode,
        }),
        []
    );

    // Fetch schema tree when modal opens
    useEffect(() => {
        if (showSchemaModal) {
            setLoadingTree(true);
            getAccessTokenSilently()
                .then(token => getFolderSchemaTree(token))
                .then(data => setSchemaTree(data))
                .finally(() => setLoadingTree(false));
        }
    }, [showSchemaModal, getAccessTokenSilently]);

    // Add InputNode (internal/external) and remove placeholder
    const handleNodeTemplateSelect = useCallback((type, target) => {
        if (target === 'input') {
            setNodes(nds => [
                ...nds.filter(n => n.type !== 'placeholder' && n.type !== 'inputNode'),
                {
                    id: `input-1`,
                    type: 'inputNode',
                    position: { x: 150, y: 150 },
                    data: {
                        onRemove: () => {
                            setNodes(nds2 => [
                                ...nds2.filter(n => n.type !== 'inputNode'),
                                {
                                    id: 'input-placeholder',
                                    type: 'placeholder',
                                    position: { x: 150, y: 150 },
                                    data: { onClick: () => setRightDragPanelOpen('input') },
                                },
                            ]);
                        },
                        // Only one type: internal
                        inputType: 'internal',
                        onSelectSchema: () => { setSchemaModalTarget('input'); setShowSchemaModal(true); },
                    },
                },
            ]);
        } else if (target === 'output') {
            setNodes(nds => [
                ...nds.filter(n => n.type !== 'outputPlaceholder' && n.type !== 'outputNode'),
                {
                    id: `output-1`,
                    type: 'outputNode',
                    position: { x: 550, y: 150 },
                    data: {
                        onRemove: () => {
                            setNodes(nds2 => [
                                ...nds2.filter(n => n.type !== 'outputNode'),
                                {
                                    id: 'output-placeholder',
                                    type: 'outputPlaceholder',
                                    position: { x: 550, y: 150 },
                                    data: { onClick: () => setRightDragPanelOpen('output') },
                                },
                            ]);
                        },
                        // Only one type: logical
                        outputType: 'logical',
                        onSelectSchema: () => { setSchemaModalTarget('output'); setShowSchemaModal(true); },
                    },
                },
            ]);
        }
        setRightDragPanelOpen(false);
    }, [setNodes]);

    // Custom selector for input/output type
    const customInputSelector = ({ onSelect, onClose }) => (
        <div className="p-4 space-y-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white">Add Input Node</h3>
            <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => { onSelect('internal', 'input'); onClose(); }}
            >
                Internal Input
            </button>
        </div>
    );
    const customOutputSelector = ({ onSelect, onClose }) => (
        <div className="p-4 space-y-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white">Add Logical Node</h3>
            <button
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                onClick={() => { onSelect('logical', 'output'); onClose(); }}
            >
                Logical Node
            </button>
        </div>
    );

    const applyTriggerNode = () => {};
    const handleBarMouseDown = () => {};

    // Only show placeholder if there are no nodes except placeholder
    const displayNodes = nodes;

    // Handler for schema selection from tree
    const handleSchemaSelect = (schema) => {
        setSelectedSchema(schema);
        setShowSchemaModal(false);
        if (schemaModalTarget === 'input') {
            setNodes(nds => nds.map(node =>
                node.type === 'inputNode'
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            schemaName: schema.name,
                        },
                    }
                    : node
            ));
        } else if (schemaModalTarget === 'output') {
            setNodes(nds => nds.map(node =>
                node.type === 'outputNode'
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            schemaName: schema.name,
                        },
                    }
                    : node
            ));
        }
    };

    // Recursive tree renderer
    const renderSchemaTree = (nodes) => (
        <ul className="nav-bar__dropdown-list">
            {nodes.map(node => {
                if (node.type === 'folder') {
                    return (
                        <li key={node.id} className="nav-bar__dropdown-folder">
                            <span className="nav-bar__dropdown-folder-label">
                                <span className="nav-bar__dropdown-icon" role="img" aria-label="folder">📁</span>
                                {node.name}
                            </span>
                            {node.children && node.children.length > 0 && renderSchemaTree(node.children)}
                        </li>
                    );
                } else if (node.type === 'schema') {
                    return (
                        <li key={node.id} className="nav-bar__dropdown-schema">
                            <button
                                onClick={() => handleSchemaSelect(node)}
                                className="nav-bar__dropdown-link w-full text-left"
                            >
                                <span className="nav-bar__dropdown-icon" role="img" aria-label="schema">📄</span>
                                {node.name}
                            </button>
                        </li>
                    );
                }
                return null;
            })}
        </ul>
    );

    return (
        <div className="h-screen flex overflow-hidden overflow-x-hidden">
            <LeftPanel
                leftPanelOpen={leftPanelOpen}
                setLeftPanelOpen={setLeftPanelOpen}
                id={null}
                flowName={"Template Editor"}
                setFlowName={() => {}}
                flowDescription={"Edit your templates here."}
                setFlowDescription={() => {}}
                flowActive={false}
                setFlowActive={() => {}}
            />

            <div className="flex-1 bg-gray-800 relative overflow-x-hidden" ref={reactFlowWrapper}>
                {showSchemaModal && (
                    <div className="absolute inset-0 flex items-center justify-center z-50" style={{ pointerEvents: 'auto' }}>
                        <div className="bg-black bg-opacity-70 absolute inset-0" />
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700 z-10 flex flex-col">
                            <h2 className="text-xl font-bold mb-4 text-gray-200">Select Schema</h2>
                            <div className="mb-4 text-gray-300" style={{height: 400, overflowY: 'auto'}}>
                                {loadingTree ? (
                                    <div className="text-gray-400">Loading...</div>
                                ) : (
                                    renderSchemaTree(schemaTree)
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowSchemaModal(false)}
                                    className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <ReactFlow
                    nodes={displayNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={params => setEdges(eds => addEdge(params, eds))}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>

                {/* Show the correct selector panel based on which placeholder was clicked */}
                {rightDragPanelOpen === 'input' && (
                    <TemplateEdgePanel
                        rightDragPanelOpen={!!rightDragPanelOpen}
                        setRightDragPanelOpen={setRightDragPanelOpen}
                        onNodeTemplateSelect={(type) => handleNodeTemplateSelect(type, 'input')}
                        customInputSelector={customInputSelector}
                    />
                )}
                {rightDragPanelOpen === 'output' && (
                    <TemplateEdgePanel
                        rightDragPanelOpen={!!rightDragPanelOpen}
                        setRightDragPanelOpen={setRightDragPanelOpen}
                        onNodeTemplateSelect={(type) => handleNodeTemplateSelect(type, 'output')}
                        customInputSelector={customOutputSelector}
                    />
                )}

                {bottomBarOpen && (
                    <div
                        className="absolute left-0 right-0 bottom-0 bg-gray-900 text-white border-t border-gray-700 z-50 flex flex-col"
                        style={{ minHeight: '100px', maxHeight: '400px', height: bottomBarHeight }}
                    >
                        <div
                            className="w-full h-3 cursor-ns-resize flex items-center justify-center bg-gray-800 border-b border-gray-700"
                            onMouseDown={handleBarMouseDown}
                            style={{ userSelect: 'none' }}
                        >
                            <div className="w-12 h-1 rounded bg-gray-600" />
                        </div>
                        <div className="flex-1 flex flex-col overflow-y-auto p-4">
                            Bottom Bar (Config/Logs/Variables/Secrets)
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
}