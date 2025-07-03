import { useState, useRef, useMemo, useCallback } from 'react';
import ReactFlow, { Background, useNodesState, useEdgesState, addEdge, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { LeftPanel, EdgeOptionsPanel, TriggerSelectionPanel } from '../components/flow';

function InputNode({ id, data }) {
    const isInternal = data.inputType === 'internal';
    const isExternal = data.inputType === 'external';
    return (
        <>
            <div
                className={
                    `rounded-lg p-4 relative flex flex-col items-center ` +
                    (isInternal
                        ? 'border-2 border-blue-500 bg-blue-900'
                        : isExternal
                        ? 'border-2 border-green-500 bg-green-900'
                        : 'border border-gray-500 bg-gray-800')
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
                    {isInternal && 'Internal Input'}
                    {isExternal && 'External Input'}
                    {!isInternal && !isExternal && 'Input Node'}
                </div>
                <Handle type="output" position={Position.Bottom} className={isInternal ? "w-3 h-3 bg-blue-400" : isExternal ? "w-3 h-3 bg-green-400" : "w-3 h-3 bg-gray-400"} />
                {isInternal && (
                    <button
                        className="mt-3 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
                        onClick={data.onSelectSchema}
                    >
                        Select Schema
                    </button>
                )}
            </div>
        </>
    );
}

function OutputNode({ data }) {
    return (
        <div className="border border-green-500 rounded-lg p-4 bg-green-900 relative">
            <div className="text-white font-medium">Output Node</div>
            <Handle type="input" position={Position.Left} className="w-3 h-3 bg-green-400" />
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
            <div className="text-gray-300 font-medium text-lg">+ Add First Node</div>
            <div className="text-gray-500 text-xs mt-1">Click to create an input node</div>
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
    const [showSchemaModal, setShowSchemaModal] = useState(false);

    // State for nodes and edges
    const [nodes, setNodes, onNodesChange] = useNodesState([
        {
            id: '1',
            type: 'placeholder',
            position: { x: 250, y: 150 },
            data: { onClick: () => setRightDragPanelOpen(true) },
        },
    ]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const nodeTypes = useMemo(
        () => ({
            inputNode: InputNode,
            outputNode: OutputNode,
            functionalNode: FunctionalNode,
            placeholder: PlaceholderNode,
        }),
        []
    );

    // Add InputNode (internal/external) and remove placeholder
    const handleNodeTemplateSelect = useCallback((type) => {
        setNodes([
            {
                id: `input-1`,
                type: 'inputNode',
                position: { x: 250, y: 150 },
                data: {
                    onRemove: () => {
                        setNodes([
                            {
                                id: '1',
                                type: 'placeholder',
                                position: { x: 250, y: 150 },
                                data: { onClick: () => setRightDragPanelOpen(true) },
                            },
                        ]);
                        setEdges([]);
                    },
                    inputType: type, // 'internal' or 'external'
                    onSelectSchema: () => setShowSchemaModal(true),
                },
            },
        ]);
        setEdges([]);
        setRightDragPanelOpen(false);
    }, [setNodes, setEdges]);

    // Custom selector for input type
    const customInputSelector = ({ onSelect, onClose }) => (
        <div className="p-4 space-y-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white">Add Input Node</h3>
            <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => { onSelect('internal'); onClose(); }}
            >
                Internal Input
            </button>
            <button
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={() => { onSelect('external'); onClose(); }}
            >
                External Input
            </button>
        </div>
    );

    const applyTriggerNode = () => {};
    const handleBarMouseDown = () => {};

    // Only show placeholder if there are no nodes except placeholder
    const displayNodes = nodes.length === 0
        ? [
            {
                id: '1',
                type: 'placeholder',
                position: { x: 250, y: 150 },
                data: { onClick: () => setRightDragPanelOpen(true) },
            },
        ]
        : nodes;

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
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700 z-10">
                            <h2 className="text-xl font-bold mb-4 text-gray-200">Select Schema</h2>
                            <div className="mb-4 text-gray-300">Schema selection UI goes here...</div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowSchemaModal(false)}
                                    className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowSchemaModal(false)}
                                    className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
                                >
                                    Select
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

                <EdgeOptionsPanel
                    rightDragPanelOpen={rightDragPanelOpen}
                    setRightDragPanelOpen={setRightDragPanelOpen}
                    onNodeTemplateSelect={handleNodeTemplateSelect}
                    customInputSelector={customInputSelector}
                />

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