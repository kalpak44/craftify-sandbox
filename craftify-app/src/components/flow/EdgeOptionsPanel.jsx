import PropTypes from 'prop-types';

const EdgeOptionsPanel = ({rightDragPanelOpen, setRightDragPanelOpen}) => {
    if (!rightDragPanelOpen) return null;

    return (
        <div className="w-64 bg-gray-900 text-white p-4 border-l border-gray-700 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Edge Options</h2>
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
    setRightDragPanelOpen: PropTypes.func.isRequired
};

export default EdgeOptionsPanel; 