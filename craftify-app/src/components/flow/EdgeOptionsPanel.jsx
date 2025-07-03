import PropTypes from 'prop-types';
import ResizablePanel from './ResizablePanel';

// Custom selector for TemplatesEditorPage
function InputTypeSelector({ onSelect, onClose }) {
    return (
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
}

InputTypeSelector.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

const EdgeOptionsPanel = ({rightDragPanelOpen, setRightDragPanelOpen, onNodeTemplateSelect, customInputSelector}) => {
    if (!rightDragPanelOpen) return null;

    // If a custom selector is provided, use it (for TemplatesEditorPage)
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

    // Default: NodeTemplateSelector (for flows)
    // ... existing code ...
    return null;
};

EdgeOptionsPanel.propTypes = {
    rightDragPanelOpen: PropTypes.bool.isRequired,
    setRightDragPanelOpen: PropTypes.func.isRequired,
    onNodeTemplateSelect: PropTypes.func,
    customInputSelector: PropTypes.func,
};

export default EdgeOptionsPanel; 