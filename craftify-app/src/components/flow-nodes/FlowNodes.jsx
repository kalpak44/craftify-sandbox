import PropTypes from 'prop-types';
import { Handle } from 'reactflow';

export const PlaceholderNode = ({data}) => (
    <div
        className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-800 text-center cursor-pointer hover:bg-gray-700 transition"
        onClick={data.onClick}
    >
        <div className="text-gray-300 font-medium text-lg">+ Add First Node</div>
        <div className="text-gray-500 text-xs mt-1">Click to create a trigger</div>
    </div>
);

export const ManualTriggerNode = ({data, isConnectable}) => (
    <div className="border border-blue-500 rounded-lg p-4 bg-blue-900 relative">
        <div className="absolute top-1 right-1 flex gap-2">
            <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500"
                    onClick={data.onExecute}>▶
            </button>
            <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    onClick={data.onRemove}>✕
            </button>
        </div>
        <div className="text-white font-medium mt-4">Manual Trigger</div>
        <div className="text-blue-300 text-xs mt-1">Triggered manually by user</div>
        <Handle type="source" position="bottom" id="a" isConnectable={isConnectable}/>
    </div>
);

export const CronTriggerNode = ({data, isConnectable}) => (
    <div className="border border-purple-500 rounded-lg p-4 bg-purple-900 relative">
        <div className="absolute top-1 right-1 flex gap-2">
            <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500"
                    onClick={data.onExecute}>▶
            </button>
            <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                    onClick={data.onRemove}>✕
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
        <Handle type="source" position="bottom" id="a" isConnectable={isConnectable}/>
    </div>
);

PlaceholderNode.propTypes = {data: PropTypes.object.isRequired, isConnectable: PropTypes.bool};
ManualTriggerNode.propTypes = {data: PropTypes.object.isRequired, isConnectable: PropTypes.bool};
CronTriggerNode.propTypes = {data: PropTypes.object.isRequired, isConnectable: PropTypes.bool};