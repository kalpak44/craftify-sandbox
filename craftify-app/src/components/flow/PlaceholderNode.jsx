import PropTypes from 'prop-types';

const PlaceholderNode = ({data}) => (
    <div
        className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-800 text-center cursor-pointer hover:bg-gray-700 transition"
        onClick={data.onClick}
    >
        <div className="text-gray-300 font-medium text-lg">+ Add First Node</div>
        <div className="text-gray-500 text-xs mt-1">Click to create a trigger</div>
    </div>
);

PlaceholderNode.propTypes = {
    data: PropTypes.object.isRequired,
    isConnectable: PropTypes.bool
};

export default PlaceholderNode; 