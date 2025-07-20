import {useState} from 'react';
import {FunctionTable} from "../components/functions/FunctionTable.jsx";
import {RegisterFunctionModal} from "../components/functions/RegisterFunctionModal.jsx";

// Demo data — replace with API in real app
const DEMO_FUNCTIONS = [
    {id: 1, name: 'user-handler', status: 'Building...', type: 'HTTP', executionMode: 'Job'},
    {id: 2, name: 'order-confirmation', status: 'Active', type: 'Event', executionMode: 'Service'},
    {id: 3, name: 'process-payment', status: 'Active', type: 'Event', executionMode: 'Job'},
    {id: 4, name: 'sync-data', status: 'Active', type: 'Event', executionMode: 'Service'},
    {id: 5, name: 'send-email', status: 'Disabled', type: 'HTTP', executionMode: 'Job'},
    {id: 6, name: 'generate-invoice', status: 'Active', type: 'HTTP', executionMode: 'Service'},
    {id: 7, name: 'customer-export', status: 'Building...', type: 'Event', executionMode: 'Job'},
    {id: 8, name: 'event-webhook', status: 'Active', type: 'Event', executionMode: 'Service'},
    // ...add more if needed for testing
];

const INITIAL_COUNT = 5;

export function FunctionsListPage() {
    const [showRegister, setShowRegister] = useState(false);
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
    const [functions] = useState(DEMO_FUNCTIONS);

    const visibleFunctions = functions.slice(0, visibleCount);

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">{(visibleFunctions?.length ? "Functions" : "")}</h1>
                <button
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                    onClick={() => setShowRegister(true)}
                >
                    Register Function
                </button>
            </div>

            {!visibleFunctions.length ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                    <span className="text-gray-400 text-lg mb-2">No functions registered yet</span>
                    <span className="text-gray-500 text-sm">Get started by registering your first function.</span>
                </div>
            ) : (
                <FunctionTable functions={visibleFunctions}/>
            )}

            {visibleCount < functions.length && visibleFunctions.length > 0 && (
                <div className="flex justify-center mt-6">
                    <button
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition"
                        onClick={() => setVisibleCount(v => Math.min(v + INITIAL_COUNT, functions.length))}
                    >
                        Show more
                    </button>
                </div>
            )}

            {showRegister && (
                <RegisterFunctionModal onClose={() => setShowRegister(false)}/>
            )}
        </div>
    );
}