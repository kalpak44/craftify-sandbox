import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import PropTypes from 'prop-types';

const GenericNode = ({ data, selected }) => {
    const getNodeColor = (type) => {
        switch (type) {
            case 'action':
                return 'bg-blue-600';
            case 'condition':
                return 'bg-yellow-600';
            case 'data':
                return 'bg-green-600';
            case 'output':
                return 'bg-purple-600';
            default:
                return 'bg-gray-600';
        }
    };

    const getNodeIcon = (type) => {
        switch (type) {
            case 'action':
                return '⚡';
            case 'condition':
                return '❓';
            case 'data':
                return '📊';
            case 'output':
                return '📤';
            default:
                return '🔧';
        }
    };

    return (
        <div className={`px-4 py-2 shadow-md rounded-md border-2 ${selected ? 'border-blue-400' : 'border-gray-300'}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />
            
            <div className={`flex items-center space-x-2 ${getNodeColor(data.type)} text-white rounded px-2 py-1`}>
                <span className="text-lg">{getNodeIcon(data.type)}</span>
                <div>
                    <div className="text-sm font-bold">{data.label || data.templateName || 'Node'}</div>
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
        type: PropTypes.string,
        templateId: PropTypes.string,
        templateName: PropTypes.string
    }).isRequired,
    selected: PropTypes.bool
};

export default memo(GenericNode); 