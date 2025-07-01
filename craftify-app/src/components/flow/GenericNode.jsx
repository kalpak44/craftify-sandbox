import {memo} from 'react';
import {Handle, Position} from 'reactflow';
import PropTypes from 'prop-types';
import loader from '../../assets/loader.svg';

const GenericNode = ({data, selected, executing}) => {
    // Parse configuration to get docker image and timeout
    let dockerImage = '';
    let command = '';
    let timeout = '';
    try {
        if (data.configuration) {
            const config = JSON.parse(data.configuration);
            dockerImage = config.dockerImage || '';
            command = config.command || '';
            timeout = config.timeout || '';
        }
    } catch (e) {
        console.warn('Failed to parse node configuration:', e);
    }

    return (
        <div
            className={`border border-green-500 rounded-lg p-4 bg-green-900 relative transition-shadow duration-200 ${selected ? 'ring-4 ring-green-400 shadow-2xl z-10' : ''}`}
        >
            <div className="absolute top-1 right-1 flex gap-2">
                <button
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    onClick={data.onRemove}
                >
                    ✕
                </button>
            </div>
            {executing && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-20 rounded-lg pointer-events-none">
                    <img src={loader} alt="Loading..." className="w-8 h-8 animate-spin"/>
                </div>
            )}
            <div className="text-white font-medium mt-4">Action Node</div>
            <div className="text-green-300 text-xs mt-1">
                {data.templateName ? `Template: ${data.templateName}` : 'Action node'}
            </div>
            {dockerImage && (
                <div className="text-green-200 text-xs mt-1">
                    🐳 {dockerImage}
                </div>
            )}
            {command && (
                <div className="text-green-200 text-xs">
                    💻 {command}
                </div>
            )}
            {timeout && (
                <div className="text-green-200 text-xs">
                    ⏱️ {timeout}s timeout
                </div>
            )}
            <Handle type="target" position={Position.Top} className="w-3 h-3"/>
            {/* Success output handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="success"
                className="w-4 h-4 bg-green-400 border-2 border-green-300"
                style={{left: '25%'}}
            />
            {/* Failure output handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="failure"
                className="w-4 h-4 bg-red-400 border-2 border-red-300"
                style={{left: '75%'}}
            />
        </div>
    );
};

GenericNode.propTypes = {
    data: PropTypes.shape({
        label: PropTypes.string,
        templateId: PropTypes.string,
        templateName: PropTypes.string,
        configuration: PropTypes.string,
        onRemove: PropTypes.func
    }).isRequired,
    selected: PropTypes.bool,
    executing: PropTypes.bool
};

export default memo(GenericNode); 