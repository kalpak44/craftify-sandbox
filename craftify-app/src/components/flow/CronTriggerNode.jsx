import PropTypes from 'prop-types';
import {Handle} from 'reactflow';

const CronTriggerNode = ({data, isConnectable}) => (
    <div className="border border-purple-500 rounded-lg p-4 bg-purple-900 relative">
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
        <div className="text-white font-medium mt-4">CRON Trigger</div>
        <div className="text-purple-300 text-xs">CRON: {data.cron || 'Not set'}</div>
        <input
            type="text"
            placeholder="0 0 * * *"
            value={data.cron || ''}
            onChange={(e) => data.onCronChange?.(e.target.value)}
            className="mt-2 w-full text-sm px-2 py-1 rounded bg-purple-700 text-white border border-purple-400"
        />
        {/* Single output handle */}
        <Handle
            type="source"
            position="bottom"
            id="success"
            className="w-3 h-3 bg-purple-400"
            isConnectable={isConnectable}
        />
    </div>
);

CronTriggerNode.propTypes = {
    data: PropTypes.object.isRequired,
    isConnectable: PropTypes.bool
};

export default CronTriggerNode; 