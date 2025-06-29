import PropTypes from 'prop-types';
import NodeTemplateSelector from './NodeTemplateSelector';

const EdgeOptionsPanel = ({ rightDragPanelOpen, setRightDragPanelOpen, onNodeTemplateSelect }) => {
    if (!rightDragPanelOpen) return null;

    const handleTemplateSelect = (template) => {
        if (onNodeTemplateSelect) {
            onNodeTemplateSelect(template);
        }
        setRightDragPanelOpen(false);
    };

    return (
        <div className="w-64 bg-gray-900 text-white p-4 border-l border-gray-700 flex flex-col">
            <NodeTemplateSelector
                nodeType="action"
                onTemplateSelect={handleTemplateSelect}
                onClose={() => setRightDragPanelOpen(false)}
            />
        </div>
    );
};

EdgeOptionsPanel.propTypes = {
    rightDragPanelOpen: PropTypes.bool.isRequired,
    setRightDragPanelOpen: PropTypes.func.isRequired,
    onNodeTemplateSelect: PropTypes.func
};

export default EdgeOptionsPanel; 