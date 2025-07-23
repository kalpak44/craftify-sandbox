import {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Modal} from "../components/common/Modal";
import {Loader} from "../components/common/Loader";
import {useAuthFetch} from "../hooks/useAuthFetch";
import {getDataRecordById} from "../api/dataStores";

function JsonTreeViewer({data, depth = 0}) {
    const [collapsed, setCollapsed] = useState({});

    const toggle = (key) => {
        setCollapsed((prev) => ({...prev, [key]: !prev[key]}));
    };

    if (typeof data !== "object" || data === null) {
        return <span className="text-green-400">{JSON.stringify(data)}</span>;
    }

    return (
        <div className={`ml-${depth * 2}`}>
            {Object.entries(data).map(([key, value]) => {
                const isObject = typeof value === "object" && value !== null;
                const collapseKey = `${depth}-${key}`;

                return (
                    <div key={collapseKey} className="mb-1">
                        <div
                            className="cursor-pointer text-blue-300 hover:underline"
                            onClick={() => isObject && toggle(collapseKey)}
                        >
                            <span className="font-semibold text-gray-300">{key}</span>
                            {isObject && (
                                <span className="ml-1 text-gray-500">
                                    {collapsed[collapseKey] ? "▶" : "▼"}
                                </span>
                            )}
                        </div>
                        {isObject && !collapsed[collapseKey] ? (
                            <div className="ml-4 border-l border-gray-600 pl-4">
                                <JsonTreeViewer data={value} depth={depth + 1}/>
                            </div>
                        ) : !isObject ? (
                            <div className="ml-4 text-green-300">{JSON.stringify(value)}</div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

export function DataRecordDetailsPage() {
    const {dataRecordId, dataStoreId} = useParams();
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const fetchRecord = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getDataRecordById(authFetch, dataStoreId, dataRecordId);
            setRecord(result);
        } catch (err) {
            setError(err.message || "Failed to load data record");
            setShowErrorModal(true);
        }
        setLoading(false);
    }, [authFetch, dataRecordId, dataStoreId]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-white">{record?.name ?? "<record name>"}</h1>
                    <div className="flex items-center gap-6 text-xs text-gray-400 ml-1">
                        <div>
                            <span className="font-semibold text-gray-300">Created:</span>{" "}
                            {record?.createdAt ?? "-"}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-300">Updated:</span>{" "}
                            {record?.updatedAt ?? "-"}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-300">Viewer Type:</span>{" "}
                            {record?.viewerType ?? "-"}
                        </div>
                        <div>
                            <span className="font-semibold text-gray-300">Data Store:</span>{" "}
                            {record?.dataStoreName ?? "-"}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/data-stores/${dataStoreId}/records`)}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                >
                    Go back
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader/>
                </div>
            ) : error ? null : (
                <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-md p-6 text-gray-200">
                    <h2 className="text-lg font-semibold mb-4 text-gray-100">Record Viewer</h2>

                    {record?.viewerType === "JSON" ? (
                        <div className="bg-gray-800 border border-gray-700 rounded p-4 text-sm overflow-x-auto">
                            <JsonTreeViewer data={record?.recordData ?? {}}/>
                        </div>
                    ) : (
                        <div className="text-yellow-400 font-semibold">
                            Unsupported viewer type: {record?.viewerType}
                        </div>
                    )}
                </div>
            )}

            {showErrorModal && (
                <Modal
                    title="Failed to fetch data record"
                    onCancel={() => setShowErrorModal(false)}
                    cancelText="Close"
                >
                    <div className="text-red-400">{error ?? "Unknown error occurred."}</div>
                    <div className="text-gray-400">
                        Please try again later or contact support if the issue persists.
                    </div>
                </Modal>
            )}
        </div>
    );
}
