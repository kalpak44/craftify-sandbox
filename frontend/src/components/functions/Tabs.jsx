import {useState} from 'react';

export function Tabs({tabs}) {
    const [activeIdx, setActiveIdx] = useState(0);

    return (
        <div>
            <div className="flex gap-2 mb-4 border-b border-gray-800">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.label}
                        className={`px-4 py-2 font-medium transition
                            ${activeIdx === idx
                            ? 'border-b-2 border-blue-500 text-blue-400'
                            : 'text-gray-400 hover:text-blue-400'}
                        `}
                        onClick={() => setActiveIdx(idx)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div>{tabs[activeIdx].content}</div>
        </div>
    );
}
