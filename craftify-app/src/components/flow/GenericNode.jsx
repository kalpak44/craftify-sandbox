import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import PropTypes from 'prop-types';

const GenericNode = ({ data, selected }) => {
    return (
        <div className="border border-green-500 rounded-lg p-4 bg-green-900 relative">
            <div className="absolute top-1 right-1 flex gap-2">
                <button 
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    onClick={data.onRemove}
                >
                    ✕
                </button>
            </div>
            <div className="text-white font-medium mt-4">Action Node</div>
            <div className="text-green-300 text-xs mt-1">
                {data.templateName ? `Template: ${data.templateName}` : 'Action node'}
            </div>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
};

GenericNode.propTypes = {
    data: PropTypes.shape({
        label: PropTypes.string,
        templateId: PropTypes.string,
        templateName: PropTypes.string,
        onRemove: PropTypes.func
    }).isRequired,
    selected: PropTypes.bool
};

export default memo(GenericNode); 