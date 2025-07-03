import PropTypes from 'prop-types';
import ResizablePanel from './ResizablePanel';

const TemplateEdgePanel = ({rightDragPanelOpen, setRightDragPanelOpen, onNodeTemplateSelect, customInputSelector}) => {
    if (!rightDragPanelOpen) return null;

    if (customInputSelector) {
        return (
            <ResizablePanel
                isOpen={rightDragPanelOpen}
                onClose={() => setRightDragPanelOpen(false)}
                minWidth={200}
                maxWidth={600}
                defaultWidth={256}
            >
                {customInputSelector({
                    onSelect: onNodeTemplateSelect,
                    onClose: () => setRightDragPanelOpen(false),
                })}
            </ResizablePanel>
        );
    }

    // Default fallback (empty)
    return null;
};

TemplateEdgePanel.propTypes = {
    rightDragPanelOpen: PropTypes.bool.isRequired,
    setRightDragPanelOpen: PropTypes.func.isRequired,
    onNodeTemplateSelect: PropTypes.func,
    customInputSelector: PropTypes.func,
};

export default TemplateEdgePanel; 