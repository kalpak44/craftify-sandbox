import PropTypes from 'prop-types';

const TriggerSelectionPanel = ({rightPanelOpen, applyTriggerNode, setRightPanelOpen}) => {
    if (!rightPanelOpen) return null;

    return (
        <div className="w-64 bg-gray-900 text-white p-4 border-l border-gray-700 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Choose Trigger</h2>
            <button
                onClick={() => applyTriggerNode('manual')}
                className="mb-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 text-white"
            >
                Manual Trigger
            </button>
            <button
                onClick={() => applyTriggerNode('cron')}
                className="mb-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 text-white"
            >
                CRON Trigger
            </button>
            <button
                onClick={() => setRightPanelOpen(false)}
                className="mt-auto px-4 py-2 text-sm text-gray-400 hover:text-white"
            >
                Close
            </button>
        </div>
    );
};

TriggerSelectionPanel.propTypes = {
    rightPanelOpen: PropTypes.bool.isRequired,
    applyTriggerNode: PropTypes.func.isRequired,
    setRightPanelOpen: PropTypes.func.isRequired
};

export default TriggerSelectionPanel; 