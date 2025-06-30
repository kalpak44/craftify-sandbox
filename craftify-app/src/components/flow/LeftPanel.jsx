import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InlineEditable = ({ value, onChange, type = 'text', className = '' }) => {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    return editing ? (
        type === 'textarea' ? (
            <textarea
                className={`w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded ${className}`}
                value={editValue}
                autoFocus
                rows={2}
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => { setEditing(false); onChange(editValue); }}
                onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onChange(editValue); } }}
            />
        ) : (
            <input
                className={`w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded ${className}`}
                value={editValue}
                autoFocus
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => { setEditing(false); onChange(editValue); }}
                onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onChange(editValue); } }}
            />
        )
    ) : (
        <div
            className={`w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded cursor-pointer ${className}`}
            onDoubleClick={() => setEditing(true)}
            title="Double-click to edit"
        >
            {value || <span className="text-gray-500">Double-click to edit</span>}
        </div>
    );
};

const LeftPanel = ({
    leftPanelOpen,
    setLeftPanelOpen,
    id,
    flowName,
    setFlowName,
    flowDescription,
    setFlowDescription,
    flowActive,
    setFlowActive
}) => {
    const navigate = useNavigate();
    return (
        <div className={`transition-all bg-gray-900 text-white p-4 ${leftPanelOpen ? 'w-80' : 'w-12'} flex flex-col`}>
            <button 
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="text-gray-400 hover:text-white self-end mb-4"
            >
                {leftPanelOpen ? '←' : '→'}
            </button>
            {leftPanelOpen && (
                <>
                    <h2 className="text-xl font-bold mb-4">{id ? 'Edit Flow' : 'Create Flow'}</h2>
                    <label className="text-sm font-medium mb-1">Name</label>
                    <InlineEditable value={flowName} onChange={setFlowName} />
                    <label className="text-sm font-medium mb-1">Description</label>
                    <InlineEditable value={flowDescription} onChange={setFlowDescription} type="textarea" />
                    <label className="flex items-center mb-4">
                        <input 
                            type="checkbox" 
                            checked={flowActive}
                            onChange={e => setFlowActive(e.target.checked)} 
                            className="mr-2"
                        />
                        Active
                    </label>
                    <button 
                        onClick={() => navigate('/flows')}
                        className="w-full border border-gray-600 px-3 py-2 rounded hover:bg-gray-700 mb-2"
                    >
                        Back
                    </button>
                </>
            )}
        </div>
    );
};

LeftPanel.propTypes = {
    leftPanelOpen: PropTypes.bool.isRequired,
    setLeftPanelOpen: PropTypes.func.isRequired,
    id: PropTypes.string,
    flowName: PropTypes.string.isRequired,
    setFlowName: PropTypes.func.isRequired,
    flowDescription: PropTypes.string.isRequired,
    setFlowDescription: PropTypes.func.isRequired,
    flowActive: PropTypes.bool.isRequired,
    setFlowActive: PropTypes.func.isRequired
};

export default LeftPanel; 