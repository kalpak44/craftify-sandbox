import {useState} from 'react';

const DEMO_INVOCATIONS = [
    {date: '2024-04-24T14:32:40Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:31:05Z', status: 'Failed', error: 'Error: order not found'},
    {date: '2024-04-24T14:29:02Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:28:13Z', status: 'Failed', error: 'Timeout'},
    {date: '2024-04-24T14:27:51Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:27:51Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:27:51Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:27:51Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:27:51Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:27:51Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:27:51Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:27:51Z', status: 'Succeeded', error: null},
    {date: '2024-04-24T14:25:22Z', status: 'Succeeded', error: null},
    // ...add more if needed for testing
];

const INITIAL_COUNT = 5;

export function InvocationList() {
    const [expandedIdx, setExpandedIdx] = useState(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

    const isEmpty = !Array.isArray(DEMO_INVOCATIONS) || DEMO_INVOCATIONS.length === 0;
    const visibleInvocations = DEMO_INVOCATIONS.slice(0, visibleCount);

    return (
        <div className="bg-gray-950 rounded-xl shadow p-4 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Invocations</h3>
            {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <span className="text-gray-400 text-lg mb-1">This function has not been invoked yet</span>
                    <span className="text-gray-600 text-sm">Invocation logs will appear here after the first run</span>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {visibleInvocations.map((inv, idx) => (
                            <div
                                key={inv.date + idx}
                                className="bg-gray-900 rounded-lg px-4 py-3 border border-gray-800 shadow flex flex-col"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-400">Date</div>
                                        <div className="text-base text-white">{inv.date}</div>
                                    </div>
                                    <div>
                                        {inv.status === 'Failed' ? (
                                            <span className="text-red-400 font-medium">{inv.status}</span>
                                        ) : (
                                            <span className="text-green-400 font-medium">{inv.status}</span>
                                        )}
                                    </div>
                                    <button
                                        className="text-blue-400 underline text-sm"
                                        onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                                    >
                                        {expandedIdx === idx ? 'Hide' : 'Details'}
                                    </button>
                                </div>
                                {expandedIdx === idx && (
                                    <div className="mt-3 bg-gray-800 rounded p-3">
                                        {inv.error ? (
                                            <span className="text-red-300">{inv.error}</span>
                                        ) : (
                                            <span className="text-green-300">No errors. Invocation succeeded.</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {visibleCount < DEMO_INVOCATIONS.length && (
                        <div className="flex justify-center mt-6">
                            <button
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition"
                                onClick={() => setVisibleCount(v => Math.min(v + INITIAL_COUNT, DEMO_INVOCATIONS.length))}
                            >
                                Show more
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
