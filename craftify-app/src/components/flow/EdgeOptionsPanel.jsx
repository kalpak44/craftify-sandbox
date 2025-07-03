import PropTypes from 'prop-types';
import NodeTemplateSelector from './NodeTemplateSelector';
import ResizablePanel from './ResizablePanel';

const EdgeOptionsPanel = ({rightDragPanelOpen, setRightDragPanelOpen, onNodeTemplateSelect}) => {
    if (!rightDragPanelOpen) return null;

    const handleTemplateSelect = (template) => {
        if (onNodeTemplateSelect) {
            onNodeTemplateSelect(template);
        }
        setRightDragPanelOpen(false);
    };

    return (
        <ResizablePanel
            isOpen={rightDragPanelOpen}
            onClose={() => setRightDragPanelOpen(false)}
            minWidth={200}
            maxWidth={600}
            defaultWidth={256}
        >
            <NodeTemplateSelector
                nodeType="action"
                onTemplateSelect={handleTemplateSelect}
                onClose={() => setRightDragPanelOpen(false)}
            />
        </ResizablePanel>
    );
};

EdgeOptionsPanel.propTypes = {
    rightDragPanelOpen: PropTypes.bool.isRequired,
    setRightDragPanelOpen: PropTypes.func.isRequired,
    onNodeTemplateSelect: PropTypes.func
};

export default EdgeOptionsPanel; 