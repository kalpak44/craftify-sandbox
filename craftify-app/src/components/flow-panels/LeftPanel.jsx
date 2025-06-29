import PropTypes from 'prop-types';

export const LeftPanel = ({ 
  flowName, 
  setFlowName, 
  flowDescription, 
  setFlowDescription, 
  flowActive, 
  setFlowActive, 
  onSave, 
  onCancel, 
  isEditing,
  leftPanelOpen,
  setLeftPanelOpen
}) => {
  return (
    <div
      className={`transition-all bg-gray-900 text-white p-4 ${leftPanelOpen ? 'w-80' : 'w-12'} flex flex-col`}
    >
      <button 
        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        className="text-gray-400 hover:text-white self-end mb-4"
      >
        {leftPanelOpen ? '←' : '→'}
      </button>
      {leftPanelOpen && (
        <>
          <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Flow' : 'Create Flow'}</h2>
          <label className="text-sm font-medium mb-1">Name</label>
          <input 
            value={flowName} 
            onChange={(e) => setFlowName(e.target.value)}
            className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded"
          />
          <label className="text-sm font-medium mb-1">Description</label>
          <textarea 
            value={flowDescription} 
            onChange={(e) => setFlowDescription(e.target.value)} 
            rows="2"
            className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded"
          />
          <label className="flex items-center mb-4">
            <input 
              type="checkbox" 
              checked={flowActive}
              onChange={(e) => setFlowActive(e.target.checked)} 
              className="mr-2"
            />
            Active
          </label>
          <button 
            onClick={onCancel}
            className="w-full border border-gray-600 px-3 py-2 rounded hover:bg-gray-700 mb-2"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="w-full bg-blue-600 px-3 py-2 rounded text-white hover:bg-blue-500"
          >
            Save
          </button>
        </>
      )}
    </div>
  );
};

LeftPanel.propTypes = {
  flowName: PropTypes.string.isRequired,
  setFlowName: PropTypes.func.isRequired,
  flowDescription: PropTypes.string.isRequired,
  setFlowDescription: PropTypes.func.isRequired,
  flowActive: PropTypes.bool.isRequired,
  setFlowActive: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  leftPanelOpen: PropTypes.bool.isRequired,
  setLeftPanelOpen: PropTypes.func.isRequired
};