import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRecord, createRecord, updateRecord } from "../api/records";
import { Modal } from "../components/common/Modal";

export const RecordEditPage = () => {
    const { id: schemaId, recordId } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createdAt, setCreatedAt] = useState(null);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const isEdit = !!recordId;

    useEffect(() => {
        const fetch = async () => {
            if (!isEdit) {
                setLoading(false);
                return;
            }

            try {
                const record = await getRecord(schemaId, recordId);
                setName(record.name || "");
                setDescription(record.description || "");
                setCreatedAt(record.createdAt);
                setUpdatedAt(record.updatedAt);
            } catch (err) {
                setError("Failed to load record: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [schemaId, recordId]);

    const handleSave = async () => {
        try {
            const payload = {
                name,
                description,
                data: {}, // Ignored for now
            };

            if (isEdit) {
                await updateRecord(schemaId, recordId, payload);
            } else {
                const created = await createRecord(schemaId, payload);
                navigate(`/schemas/${schemaId}/records/${created.id}/edit`);
                return;
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError("Failed to save record: " + err.message);
        }
    };


    const handleCancel = () => {
        navigate(`/schemas/${schemaId}/records`);
    };

    return (
        <div className="p-8 text-white flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold">
                    {isEdit ? "Edit Record" : "Add Record"}
                </h1>
                <div className="space-x-2">
                    <button
                        onClick={handleCancel}
                        className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium"
                    >
                        ← Go Back
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium"
                    >
                        Save
                    </button>

                </div>
            </div>

            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Form Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-2 bg-gray-800 text-white border border-gray-600 rounded"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="bg-gray-900 p-4 rounded border border-gray-700">
                        <h2 className="text-lg font-semibold mb-4 text-white">Record Info</h2>
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
{`{
  "name": "${name}",
  "description": "${description}",${createdAt ? `
  "createdAt": "${createdAt}",` : ""}${updatedAt ? `
  "updatedAt": "${updatedAt}"` : ""}
}`}
                        </pre>
                        {saved && (
                            <p className="text-green-400 mt-4 text-sm">✔ Saved successfully</p>
                        )}
                    </div>
                </div>
            )}

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
