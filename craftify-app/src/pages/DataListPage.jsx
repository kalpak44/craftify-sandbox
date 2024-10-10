// pages/DataListPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DataListPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-full p-6 bg-gray-800 text-white rounded-lg shadow-md mt-8">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-0 right-0 mt-4 mr-4 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                style={{
                    background: 'var(--mandarine-orange-gradient)',
                    fontFamily: 'var(--font-primary)',
                }}
            >
                Close
            </button>
            <h1 className="text-white text-lg font-bold">Data List</h1>
            <p className="text-gray-400 mt-4">Data list functionality will be added here.</p>
        </div>
    );
};
