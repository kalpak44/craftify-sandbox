import React from 'react';

export const Modal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
                <div className="px-4 py-2 bg-gray-100 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                </div>
                <div className="p-4">
                    <p className="text-gray-700">{message}</p>
                </div>
                <div className="flex justify-end px-4 py-2 bg-gray-100 border-t">
                    <button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};