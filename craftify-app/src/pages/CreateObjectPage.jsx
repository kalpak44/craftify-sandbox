import React, { useState } from "react";

const MinimalLeftPanel = ({ leftPanelOpen, setLeftPanelOpen }) => (
    <div className={`transition-all bg-gray-900 text-white p-4 ${leftPanelOpen ? 'w-80' : 'w-12'} flex flex-col`}>
        <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="text-gray-400 hover:text-white self-end mb-4"
        >
            {leftPanelOpen ? '←' : '→'}
        </button>
        {leftPanelOpen && (
            <h2 className="text-xl font-bold mb-4">Data Menu</h2>
        )}
    </div>
);

export const CreateObjectPage = () => {
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    return (
        <div className="flex h-full min-h-screen bg-gray-900">
            <MinimalLeftPanel leftPanelOpen={leftPanelOpen} setLeftPanelOpen={setLeftPanelOpen} />
            <div className="flex-1 flex items-center justify-center" style={{ background: '#1F2836', height: '100vh' }}>
                <h1 className="text-3xl font-bold text-white">Create Object</h1>
            </div>
        </div>
    );
}; 