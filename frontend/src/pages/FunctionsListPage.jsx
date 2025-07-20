import {useCallback, useEffect, useState} from "react";
import {FunctionTable} from "../components/functions/FunctionTable.jsx";
import {RegisterFunctionModal} from "../components/functions/RegisterFunctionModal.jsx";
import {Modal} from "../components/common/Modal";
import {Loader} from "../components/common/Loader";
import {listFunctions} from "../api/function";
import {useAuthFetch} from "../hooks/useAuthFetch";

const INITIAL_PAGE_SIZE = 5;

export function FunctionsListPage() {
    const authFetch = useAuthFetch();
    const [showRegister, setShowRegister] = useState(false);
    const [page, setPage] = useState(0);
    const [functions, setFunctions] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Error Modal Control
    const [showErrorModal, setShowErrorModal] = useState(false);

    // Fetch functions from backend
    const fetchFunctions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listFunctions(authFetch, 0, (page + 1) * INITIAL_PAGE_SIZE);
            setFunctions(data.content);
            setTotalElements(data.totalElements);
        } catch (err) {
            setError(err.message || "Failed to load functions");
            setShowErrorModal(true); // Show the modal
        }
        setLoading(false);
    }, [authFetch, page]);

    useEffect(() => {
        fetchFunctions();
    }, [fetchFunctions]);

    // Show more handler
    const handleShowMore = () => setPage(prev => prev + 1);

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                    {functions?.length ? "Functions" : ""}
                </h1>
                <button
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                    onClick={() => setShowRegister(true)}
                >
                    Register Function
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader />
                </div>
            ) : !functions.length ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                    <span className="text-gray-400 text-lg mb-2">No functions registered yet</span>
                    <span className="text-gray-500 text-sm">Get started by registering your first function.</span>
                </div>
            ) : (
                <FunctionTable functions={functions}/>
            )}

            {functions.length < totalElements && !loading && (
                <div className="flex justify-center mt-6">
                    <button
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition"
                        onClick={handleShowMore}
                        disabled={loading}
                    >
                        Show more
                    </button>
                </div>
            )}

            {showRegister && (
                <RegisterFunctionModal
                    onClose={() => setShowRegister(false)}
                    onRegistered={fetchFunctions}
                />
            )}

            {/* ERROR MODAL */}
            {showErrorModal && (
                <Modal
                    title="Failed to fetch functions"
                    onCancel={() => setShowErrorModal(false)}
                    cancelText="Close"
                >
                    <div className="text-red-400">
                        {error ?? "Unknown error occurred while fetching data from backend."}
                    </div>
                    <div className="text-gray-400">
                        Please try again later, or contact your administrator if this issue persists.
                    </div>
                </Modal>
            )}
        </div>
    );
}
