import PropTypes from 'prop-types';
import { useRef } from 'react';

export const RightEdgePanel = ({ onClose }) => {
  const dragMenuRef = useRef(null);
  
  return (
    <div
      ref={dragMenuRef}
      className="w-64 bg-gray-900 text-white p-4 border-l border-gray-700 flex flex-col"
    >
      <h2 className="text-lg font-semibold mb-4">Edge Options</h2>
      <div className="flex-grow"/>
      <button
        onClick={onClose}
        className="mt-auto px-4 py-2 text-sm text-gray-400 hover:text-white"
      >
        Close
      </button>
    </div>
  );
};

RightEdgePanel.propTypes = {
  onClose: PropTypes.func.isRequired
};