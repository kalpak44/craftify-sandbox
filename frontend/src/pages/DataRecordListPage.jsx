import {useCallback, useEffect, useRef, useState} from "react";
import {Modal} from "../components/common/Modal";
import {Loader} from "../components/common/Loader";
import {useAuthFetch} from "../hooks/useAuthFetch";
import {listDataStoresRecords} from "../api/dataStores.js";
import {DataRecordsTable} from "../components/data-records/DataRecordsTable.jsx";
import {useNavigate, useParams} from "react-router-dom";

const INITIAL_PAGE_SIZE = 5;

export function DataRecordListPage() {
    const { id: dataStoreId, type: dataStoreType } = useParams();
    const authFetch = useAuthFetch();
    const [page, setPage] = useState(0);
    const [dataRecords, setDataRecords] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const popoverRef = useRef();
    const navigate = useNavigate();

    const fetchDataStores = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listDataStoresRecords(authFetch, dataStoreId, 0, (page + 1) * INITIAL_PAGE_SIZE);
            setDataRecords(data.content);
            setTotalElements(data.totalElements);
        } catch (err) {
            setError(err.message || "Failed to load data store records");
            setShowErrorModal(true);
        }
        setLoading(false);
    }, [authFetch, page, dataStoreId]);

    useEffect(() => {
        fetchDataStores();
    }, [fetchDataStores]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setShowSettings(false);
            }
        }
        if (showSettings) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSettings]);

    const handleShowMore = () => setPage(prev => prev + 1);

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
            {/* Top Action Buttons */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">
                    {dataRecords?.length ? "Data Records" : ""}
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/data-stores")}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                    >
                        Go back
                    </button>
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                            onClick={() => setShowSettings((v) => !v)}
                        >
                            Settings
                        </button>
                        {showSettings && (
                            <div
                                ref={popoverRef}
                                className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-4 z-20"
                            >
                                <div className="text-gray-200 mb-2">Settings panel content</div>

                                <button
                                    className="w-full bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-md px-3 py-2 text-sm font-medium"
                                    onClick={() => {
                                        setShowSettings(false);
                                        navigate(`/data-stores/${dataStoreId}/${dataStoreType}/new`)
                                    }}
                                >
                                    ➕ Create New Record
                                </button>

                            </div>

                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader />
                </div>
            ) : !dataRecords.length ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                    <span className="text-gray-500 text-sm">No records created yet.</span>
                </div>
            ) : (
                <DataRecordsTable dataRecords={dataRecords} />
            )}

            {dataRecords.length < totalElements && !loading && (
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
                    title="Failed to fetch data store records"
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
