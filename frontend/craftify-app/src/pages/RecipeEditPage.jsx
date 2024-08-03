import React, { useState, useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PageLayout } from '../components/page-layout/PageLayout.jsx';
import { v4 as uuidv4 } from 'uuid';
import { IngredientSearchNode } from '../components/custom-nodes/IngredientSearchNode.jsx';
import { LoopNode } from '../components/custom-nodes/LoopNode.jsx';
import { ProductChangerNode } from '../components/custom-nodes/ProductChangerNode.jsx';
import { ConditionalNode } from '../components/custom-nodes/ConditionalNode.jsx';
import { StateMachineNode } from '../components/custom-nodes/StateMachineNode.jsx';
import { Modal } from '../components/modal/Modal.jsx';

const nodeTypes = {
    ingredientSearchNode: IngredientSearchNode,
    loopNode: LoopNode,
    productChangerNode: ProductChangerNode,
    conditionalNode: ConditionalNode,
    stateMachineNode: StateMachineNode
};

const initialNodes = [
    {
        id: 'start',
        type: 'input',
        data: { label: 'Start', state: { label: 'Start', description: '' } },
        position: { x: 250, y: 50 },
        style: { backgroundColor: '#2196f3', color: 'white', borderColor: 'white' },
    },
];

const initialEdges = [];

export const RecipeEditPage = () => {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [modalVisible, setModalVisible] = useState(false);
    const [configModalVisible, setConfigModalVisible] = useState(false);
    const [selectedNodeType, setSelectedNodeType] = useState('ingredientSearchNode');
    const [configNodeId, setConfigNodeId] = useState(null);
    const [configNodeState, setConfigNodeState] = useState({});
    const [edgeSourceNodeId, setEdgeSourceNodeId] = useState(null);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnectStart = useCallback((event, { nodeId }) => {
        setEdgeSourceNodeId(nodeId);
    }, []);

    const onConnectEnd = useCallback(
        (event) => {
            if (!edgeSourceNodeId) return;

            const targetNodeElement = event.target.closest('.react-flow__node');
            const targetNodeId = targetNodeElement?.getAttribute('data-id');
            if (targetNodeId && targetNodeId !== edgeSourceNodeId) {
                setEdges((eds) => addEdge({ id: `e-${edgeSourceNodeId}-${targetNodeId}`, source: edgeSourceNodeId, target: targetNodeId }, eds));
            } else {
                setModalVisible(true);
            }
        },
        [edgeSourceNodeId, nodes]
    );

    const addNode = () => {
        if (!edgeSourceNodeId) return;

        const newNodeId = uuidv4();
        const newNodePosition = { x: 250, y: 150 };

        let nodeLabel;
        let initialState = {};
        switch (selectedNodeType) {
            case 'ingredientSearchNode':
                nodeLabel = 'Product Search';
                initialState = { label: nodeLabel, description: '' };
                break;
            case 'productChangerNode':
                nodeLabel = 'Product Changer';
                initialState = { label: nodeLabel, description: '' };
                break;
            case 'loopNode':
                nodeLabel = 'Loop Results';
                initialState = { label: nodeLabel, description: '' };
                break;
            case 'conditionalNode':
                nodeLabel = 'Conditional';
                initialState = { label: nodeLabel, description: '' };
                break;
            case 'stateMachineNode':
                nodeLabel = 'State Machine';
                initialState = { label: nodeLabel, description: '', outputs: [] };
                break;
            default:
                nodeLabel = 'Node';
                initialState = { label: nodeLabel, description: '' };
                break;
        }

        const newNode = {
            id: newNodeId,
            type: selectedNodeType,
            data: {
                label: nodeLabel,
                state: initialState,
                onDelete: deleteNode,
                onUpdate: updateNodeState,
                onConfig: openConfigModal,
            },
            position: newNodePosition,
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => addEdge({ id: `e-${edgeSourceNodeId}-${newNodeId}`, source: edgeSourceNodeId, target: newNodeId }, eds));
        setModalVisible(false);
        setEdgeSourceNodeId(null);
    };

    const deleteNode = useCallback((nodeIdToDelete) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeIdToDelete));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeIdToDelete && edge.target !== nodeIdToDelete));
    }, []);

    const updateNodeState = (nodeId, newState) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, state: newState, label: newState.label } } : node
            )
        );
    };

    const openConfigModal = (nodeId) => {
        const node = nodes.find((n) => n.id === nodeId);
        setConfigNodeId(nodeId);
        setConfigNodeState(node.data.state || {});
        setConfigModalVisible(true);
    };

    const handleConfigConfirm = () => {
        updateNodeState(configNodeId, configNodeState);
        setConfigModalVisible(false);
    };

    const handleInputChange = (field, value) => {
        setConfigNodeState(prevState => ({ ...prevState, [field]: value }));
    };

    const renderConfigModalContent = () => {
        switch (nodes.find(node => node.id === configNodeId)?.type) {
            case 'ingredientSearchNode':
                return (
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Ingredient:</label>
                        <input
                            type="text"
                            value={configNodeState.label || ''}
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                        <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Description:</label>
                        <textarea
                            value={configNodeState.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                    </div>
                );
            case 'loopNode':
                return (
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Loop Over:</label>
                        <input
                            type="text"
                            value={configNodeState.label || ''}
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                    </div>
                );
            case 'productChangerNode':
                return (
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Product:</label>
                        <input
                            type="text"
                            value={configNodeState.label || ''}
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                        <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Description:</label>
                        <textarea
                            value={configNodeState.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                    </div>
                );
            case 'conditionalNode':
                return (
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Condition:</label>
                        <input
                            type="text"
                            value={configNodeState.label || ''}
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                        <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Description:</label>
                        <textarea
                            value={configNodeState.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                    </div>
                );
            case 'stateMachineNode':
                return (
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">State Machine Label:</label>
                        <input
                            type="text"
                            value={configNodeState.label || ''}
                            onChange={(e) => handleInputChange('label', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                        <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Description:</label>
                        <textarea
                            value={configNodeState.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                        <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">Outputs:</label>
                        <textarea
                            placeholder="Enter output names, one per line"
                            value={configNodeState.outputs?.join('\n') || ''}
                            onChange={(e) => handleInputChange('outputs', e.target.value.split('\n'))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                    </div>
                );
            default:
                return <div>Unknown node type</div>;
        }
    };

    const nodesWithHandlers = nodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            onDelete: deleteNode,
            onUpdate: updateNodeState,
            onConfig: openConfigModal,
        },
    }));

    const saveFlow = () => {
        const flowData = {
            nodes: nodes.map((node) => ({ id: node.id, type: node.type, data: node.data, position: node.position })),
            edges,
        };
        console.log('Flow Data:', JSON.stringify(flowData, null, 2));
    };

    return (
        <PageLayout>
            <div className="p-4">
                <div className="mt-4 border border-gray-300 rounded-md" style={{ height: '700px' }}>
                    <ReactFlow
                        nodes={nodesWithHandlers}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        fitView
                    >
                        <MiniMap />
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>
            </div>
            <Modal
                show={modalVisible}
                onClose={() => setModalVisible(false)}
                onConfirm={addNode}
                title="Add Node"
                message={
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Select Node Type:</label>
                        <select
                            value={selectedNodeType}
                            onChange={(e) => setSelectedNodeType(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="ingredientSearchNode">Product Search</option>
                            <option value="loopNode">Loop Results</option>
                            <option value="productChangerNode">Product Changer</option>
                            <option value="conditionalNode">Conditional</option>
                            <option value="stateMachineNode">State Machine</option>
                        </select>
                    </div>
                }
            />
            <Modal
                show={configModalVisible}
                onClose={() => setConfigModalVisible(false)}
                onConfirm={handleConfigConfirm}
                title="Configure Node"
                message={renderConfigModalContent()}
            />
            <button
                className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                onClick={saveFlow}
            >
                Save
            </button>
        </PageLayout>
    );
};
