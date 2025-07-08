import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listRecords, deleteRecord } from "../api/records";
import { Modal } from "../components/common/Modal";

export const RecordsPage = () => {
    const { id: schemaId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState({ content: [], page: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState(null);

    const PAGE_SIZE = 10;

    const fetchPage = async (pageIndex) => {
        setLoading(true);
        try {
            const result = await listRecords(schemaId, pageIndex, PAGE_SIZE);
            setData(result);
        } catch (err) {
            setError("Failed to load records: " + err.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPage(0);
    }, [schemaId]);

    const handleAddRecord = () => {
        setError("Record creation modal coming soon...");
    };

    const handleEditRecord = (record) => {
        setError(`Editing record ${record.id} – feature coming soon.`);
    };

    const handleDeleteRecord = (record) => {
        setRecordToDelete(record);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteRecord(schemaId, recordToDelete.id);
            await fetchPage(data.page);
        } catch (e) {
            setError("Failed to delete record: " + e.message);
        }
        setRecordToDelete(null);
        setShowDeleteModal(false);
    };

    const goBack = () => {
        navigate("/schemas");
    };

    return (
        <div className="p-8 text-white">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-semibold">Records</h1>
                    <p className="text-sm text-gray-400">
                        Schema ID: <span className="font-mono">{schemaId}</span>
                    </p>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={goBack}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium"
                    >
                        ← Go Back
                    </button>
                    <button
                        onClick={handleAddRecord}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium"
                    >
                        + Add Record
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-gray-400">Loading records...</div>
            ) : data.content.length === 0 ? (
                <div className="text-gray-400">No records available.</div>
            ) : (
                <>
                    <table className="w-full text-sm border-collapse mb-6">
                        <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                            <th className="text-left px-3 py-2 font-medium">ID</th>
                            <th className="text-left px-3 py-2 font-medium">Name</th>
                            <th className="text-left px-3 py-2 font-medium">Description</th>
                            <th className="text-left px-3 py-2 font-medium">Created</th>
                            <th className="text-left px-3 py-2 font-medium">Updated</th>
                            <th className="text-right px-3 py-2 font-medium">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.content.map((record) => {
                            const name = record.data?.name || record.data?.firstName || "-";
                            const description = record.data?.description || record.data?.lastName || "-";
                            const created = record.data?.createdAt || "-";
                            const updated = record.data?.updatedAt || "-";

                            return (
                                <tr key={record.id} className="hover:bg-gray-800 border-b border-gray-800">
                                    <td className="px-3 py-2 font-mono">{record.id}</td>
                                    <td className="px-3 py-2">{name}</td>
                                    <td className="px-3 py-2">{description}</td>
                                    <td className="px-3 py-2">{created}</td>
                                    <td className="px-3 py-2">{updated}</td>
                                    <td className="px-3 py-2 text-right space-x-2">
                                        <button
                                            onClick={() => handleEditRecord(record)}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRecord(record)}
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <div className="inline-flex rounded overflow-hidden border border-gray-700 bg-gray-800 text-sm">
                            {Array.from({ length: data.totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => fetchPage(i)}
                                    className={`px-4 py-2 border-r border-gray-700 last:border-r-0 transition ${
                                        data.page === i
                                            ? "bg-blue-600 text-white"
                                            : "text-gray-300 hover:bg-gray-700"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <Modal
                    title="Delete Record"
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setRecordToDelete(null);
                    }}
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                >
                    Are you sure you want to delete{" "}
                    <strong className="font-mono">{recordToDelete?.id}</strong>?
                </Modal>
            )}

            {/* Error Modal */}
            {error && (
                <Modal
                    title="Error"
                    onCancel={() => setError(null)}
                    onConfirm={() => setError(null)}
                    confirmText="OK"
                >
                    <p className="text-red-400 whitespace-pre-line">{error}</p>
                </Modal>
            )}
        </div>
    );
};
