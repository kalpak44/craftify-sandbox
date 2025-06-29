import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import PropTypes from 'prop-types';

const GenericNode = ({ data, selected }) => {
    return (
        <div className={`px-4 py-2 shadow-md rounded-md border-2 ${selected ? 'border-blue-400' : 'border-gray-300'}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            
            <div className="flex items-center space-x-2 bg-blue-600 text-white rounded px-2 py-1">
                <span className="text-lg">⚡</span>
                <div>
                    <div className="text-sm font-bold">{data.label || data.templateName || 'Action Node'}</div>
                    {data.templateName && (
                        <div className="text-xs opacity-75">Template: {data.templateName}</div>
                    )}
                </div>
            </div>
            
            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
};

GenericNode.propTypes = {
    data: PropTypes.shape({
        label: PropTypes.string,
        templateId: PropTypes.string,
        templateName: PropTypes.string
    }).isRequired,
    selected: PropTypes.bool
};

export default memo(GenericNode); 