import {useCallback, useEffect, useState} from "react";
import {Modal} from "../components/common/Modal";
import {Loader} from "../components/common/Loader";
import {useAuthFetch} from "../hooks/useAuthFetch";
import {FormsTable} from "../components/forms/FormsTable.jsx";
import {useNavigate} from "react-router-dom";
import {listForms} from "../api/forms.js";

const INITIAL_PAGE_SIZE = 5;

export function FormListPage() {
    const authFetch = useAuthFetch();

    const [page, setPage] = useState(0);
    const [forms, setForms] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const navigate = useNavigate();


    const fetchFunctions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listForms(authFetch, 0, (page + 1) * INITIAL_PAGE_SIZE);
            setForms(data.content);
            setTotalElements(data.totalElements);
        } catch (err) {
            setError(err.message || "Failed to load forms");
            setShowErrorModal(true);
        }
        setLoading(false);
    }, [authFetch, page]);

    useEffect(() => {
        fetchFunctions();
    }, [fetchFunctions]);

    const handleShowMore = () => setPage(prev => prev + 1);

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                    {forms?.length ? "Forms" : ""}
                </h1>
                <button
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                    onClick={() => navigate("/forms-builder/new")}
                >
                    Form Builder
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader />
                </div>
            ) : !forms.length ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                    <span className="text-gray-400 text-lg mb-2">No forms created yet</span>
                    <span className="text-gray-500 text-sm">Get started by creating your first form.</span>
                </div>
            ) : (
                <FormsTable forms={forms} onRefresh={fetchFunctions} />
            )}

            {forms.length < totalElements && !loading && (
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


            {showErrorModal && (
                <Modal
                    title="Failed to fetch forms"
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