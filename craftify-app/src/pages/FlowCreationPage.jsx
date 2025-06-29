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
import {createFlow, updateFlow} from '../services/API';

import {
    PlaceholderNode,
    ManualTriggerNode,
    CronTriggerNode,
    LeftPanel,
    TriggerSelectionPanel,
    EdgeOptionsPanel,
    useFlowCreation
} from '../components/flow';

const nodeTypes = {
    placeholder: PlaceholderNode,
    manualTrigger: ManualTriggerNode,
    cronTrigger: CronTriggerNode,
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

        const onExecute = () => alert(`${type.toUpperCase()} triggered`);
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
    }, [placeholderId, resetToPlaceholder, setNodes]);

    const hydrateNode = (node) => {
        const base = {...node};
        if (node.type === 'placeholder') {
            base.data = {onClick: () => handlePlaceholderClick(node.id)};
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
                            n.id === node.id ? {...n, data: {...n.data, cron}} : n
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
        const newNode = {id: `${Date.now()}`, type, position, data: {label: `${type} node`}};
        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes]);

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

    return (
        <div className="h-screen flex overflow-hidden">
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

            <div className="flex-1 bg-gray-800 relative" ref={reactFlowWrapper}>
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
                    >
                        <Background variant="dots" gap={12} size={1}/>
                    </ReactFlow>
                )}
            </div>

            <TriggerSelectionPanel
                rightPanelOpen={rightPanelOpen}
                applyTriggerNode={applyTriggerNode}
                setRightPanelOpen={setRightPanelOpen}
            />

            <EdgeOptionsPanel
                rightDragPanelOpen={rightDragPanelOpen}
                setRightDragPanelOpen={setRightDragPanelOpen}
            />
        </div>
    );
};
