import React from 'react';

export const Notification = ({ show, message, onClose }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed bottom-0 right-0 m-6 w-full max-w-sm bg-red-500 text-white rounded-lg shadow-lg z-50">
            <div className="flex justify-between items-center px-4 py-2">
                <span>{message}</span>
                <button onClick={onClose} className="text-xl font-bold">&times;</button>
            </div>
        </div>
    );
};
