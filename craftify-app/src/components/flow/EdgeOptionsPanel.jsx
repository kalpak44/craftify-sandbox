import { useState } from 'react';
import PropTypes from 'prop-types';
import NodeTemplateSelector from './NodeTemplateSelector';

const EdgeOptionsPanel = ({ rightDragPanelOpen, setRightDragPanelOpen, onNodeTemplateSelect }) => {
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [selectedNodeType, setSelectedNodeType] = useState('');

    if (!rightDragPanelOpen) return null;

    const handleTemplateSelect = (template) => {
        if (onNodeTemplateSelect) {
            onNodeTemplateSelect(template);
        }
        setShowTemplateSelector(false);
    };

    const handleCreateNode = (nodeType) => {
        setSelectedNodeType(nodeType);
        setShowTemplateSelector(true);
    };

    if (showTemplateSelector) {
        return (
            <div className="w-64 bg-gray-900 text-white p-4 border-l border-gray-700 flex flex-col">
                <NodeTemplateSelector
                    nodeType={selectedNodeType}
                    onTemplateSelect={handleTemplateSelect}
                    onClose={() => setShowTemplateSelector(false)}
                />
            </div>
        );
    }

    return (
        <div className="w-64 bg-gray-900 text-white p-4 border-l border-gray-700 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Edge Options</h2>
            
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Create Node</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => handleCreateNode('action')}
                            className="w-full px-3 py-2 text-left bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                        >
                            Action Node
                        </button>
                        <button
                            onClick={() => handleCreateNode('condition')}
                            className="w-full px-3 py-2 text-left bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                        >
                            Condition Node
                        </button>
                        <button
                            onClick={() => handleCreateNode('data')}
                            className="w-full px-3 py-2 text-left bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                        >
                            Data Node
                        </button>
                        <button
                            onClick={() => handleCreateNode('output')}
                            className="w-full px-3 py-2 text-left bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                        >
                            Output Node
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow"/>
            <button
                onClick={() => setRightDragPanelOpen(false)}
                className="mt-auto px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
                Close
            </button>
        </div>
    );
};

EdgeOptionsPanel.propTypes = {
    rightDragPanelOpen: PropTypes.bool.isRequired,
    setRightDragPanelOpen: PropTypes.func.isRequired,
    onNodeTemplateSelect: PropTypes.func
};

export default EdgeOptionsPanel; 