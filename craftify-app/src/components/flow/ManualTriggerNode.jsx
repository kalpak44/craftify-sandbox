import PropTypes from 'prop-types';
import {Handle} from 'reactflow';

const ManualTriggerNode = ({data, isConnectable}) => (
    <div className="border border-blue-500 rounded-lg p-4 bg-blue-900 relative">
        <div className="absolute top-1 right-1 flex gap-2">
            <button 
                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500"
                onClick={data.onExecute}
            >
                ▶
            </button>
            <button 
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                onClick={data.onRemove}
            >
                ✕
            </button>
        </div>
        <div className="text-white font-medium mt-4">Manual Trigger</div>
        <div className="text-blue-300 text-xs mt-1">Triggered manually by user</div>
        <Handle type="source" position="bottom" id="a" isConnectable={isConnectable}/>
    </div>
);

ManualTriggerNode.propTypes = {
    data: PropTypes.object.isRequired,
    isConnectable: PropTypes.bool
};

export default ManualTriggerNode; 