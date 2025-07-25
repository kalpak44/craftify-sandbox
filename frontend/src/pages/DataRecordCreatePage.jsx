// All imports remain the same
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../components/common/Modal";
import { Loader } from "../components/common/Loader";
import { useAuthFetch } from "../hooks/useAuthFetch";
import Editor from "@monaco-editor/react";
import { getDataRecordById, createDataRecord } from "../api/dataStores.js";

export function DataRecordCreatePage() {
    const { dataStoreId, dataRecordId } = useParams();
    const isEdit = !!dataRecordId;

    const authFetch = useAuthFetch();
    const navigate = useNavigate();

    const [recordName, setRecordName] = useState("Untitled Record");
    const [data, setData] = useState({});
    const [isEditingName, setIsEditingName] = useState(!isEdit);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [newFields, setNewFields] = useState({});
    const [arrayItems, setArrayItems] = useState({});

    const fetchExistingRecord = useCallback(async () => {
        if (!isEdit) return;
        setLoading(true);
        try {
            const result = await getDataRecordById(authFetch, dataStoreId, dataRecordId);
            setRecordName(result.name);
            setData(result?.recordData ?? {});
        } catch (err) {
            setError(err.message || "Failed to load data record");
            setShowErrorModal(true);
        }
        setLoading(false);
    }, [authFetch, dataStoreId, dataRecordId, isEdit]);

    useEffect(() => {
        fetchExistingRecord();
    }, [fetchExistingRecord]);

    const handleSave = async () => {
        if (!recordName?.trim()) {
            setError("Record name cannot be empty.");
            setShowErrorModal(true);
            return;
        }

        try {
            const saved = await createDataRecord(authFetch, dataStoreId, recordName.trim(), data);
            navigate(`/data-stores/${dataStoreId}/${saved.id}`);
        } catch (err) {
            setError(err.message || "Failed to save record.");
            setShowErrorModal(true);
        }
    };

    const tryParse = (val) => {
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    };

    const updateValueAtPath = (path, value) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
        ref[path[path.length - 1]] = value;
        setData(newData);
    };

    const deleteKeyAtPath = (path) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
        delete ref[path[path.length - 1]];
        setData(newData);
    };

    const deleteArrayIndex = (path, index) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i++) ref = ref[path[i]];
        ref.splice(index, 1);
        setData(newData);
    };

    const addKeyAtPath = (path, key, type, primitiveValue = "") => {
        if (!key) return;
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i++) ref = ref[path[i]];
        if (type === "object") ref[key] = {};
        else if (type === "array") ref[key] = [];
        else ref[key] = tryParse(primitiveValue);
        setNewFields((prev) => ({
            ...prev,
            [path.join(".")]: { key: "", type: "primitive", value: "" },
        }));
        setData(newData);
    };

    const addToArrayAtPath = (path, value) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i++) ref = ref[path[i]];
        ref.push(tryParse(value));
        setArrayItems((prev) => ({ ...prev, [path.join(".")]: "" }));
        setData(newData);
    };

    const renderEditor = (node, path = []) => {
        const flatPath = path.join(".");
        if (Array.isArray(node)) {
            return (
                <div className="space-y-2 w-full">
                    {node.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <input
                                className="bg-gray-800 border border-gray-700 text-green-300 font-mono rounded-md px-2 py-1 w-full text-sm"
                                value={String(item)}
                                onChange={(e) => {
                                    const newArray = [...node];
                                    newArray[i] = tryParse(e.target.value);
                                    updateValueAtPath(path, newArray);
                                }}
                            />
                            <button
                                onClick={() => deleteArrayIndex(path, i)}
                                className="bg-red-800 hover:bg-red-700 text-red-200 border border-red-700 rounded-md px-3 py-1 text-xs font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <input
                            className="bg-gray-800 border border-gray-700 text-gray-100 text-xs font-mono px-2 py-1 rounded w-full"
                            placeholder="New element"
                            value={arrayItems[flatPath] || ""}
                            onChange={(e) =>
                                setArrayItems((prev) => ({ ...prev, [flatPath]: e.target.value }))
                            }
                        />
                        <button
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded px-3 py-1"
                            onClick={() => addToArrayAtPath(path, arrayItems[flatPath])}
                        >
                            Add
                        </button>
                    </div>
                </div>
            );
        }

        if (typeof node !== "object" || node === null) {
            return (
                <input
                    className="bg-gray-800 border border-gray-700 text-green-300 font-mono rounded-md px-2 py-1 w-full text-sm"
                    value={String(node)}
                    onChange={(e) => updateValueAtPath(path, tryParse(e.target.value))}
                />
            );
        }

        return (
            <div className="ml-4 border-l border-gray-700 pl-4 space-y-3">
                {Object.entries(node).map(([key, value]) => {
                    const subPath = [...path, key];
                    return (
                        <div key={subPath.join(".")} className="flex gap-2 items-start">
                            <label className="text-gray-400 w-40 truncate font-mono pt-1">{key}</label>
                            <div className="flex-1">{renderEditor(value, subPath)}</div>
                            <button
                                onClick={() => deleteKeyAtPath(subPath)}
                                className="bg-red-800 hover:bg-red-700 text-red-200 border border-red-700 rounded-md px-3 py-1 text-xs font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    );
                })}
                <div className="flex gap-2 items-center mt-2">
                    <input
                        placeholder="New Key"
                        className="bg-gray-800 border border-gray-700 text-gray-100 text-xs font-mono px-2 py-1 rounded w-40"
                        value={newFields[flatPath]?.key || ""}
                        onChange={(e) =>
                            setNewFields((prev) => ({
                                ...prev,
                                [flatPath]: { ...prev[flatPath], key: e.target.value },
                            }))
                        }
                    />
                    <select
                        className="bg-gray-800 border border-gray-700 text-gray-100 text-xs font-mono px-2 py-1 rounded w-32"
                        value={newFields[flatPath]?.type || "primitive"}
                        onChange={(e) =>
                            setNewFields((prev) => ({
                                ...prev,
                                [flatPath]: { ...prev[flatPath], type: e.target.value },
                            }))
                        }
                    >
                        <option value="primitive">Primitive</option>
                        <option value="object">Object</option>
                        <option value="array">Array</option>
                    </select>
                    {(newFields[flatPath]?.type ?? "primitive") === "primitive" && (
                        <input
                            placeholder="Value"
                            className="bg-gray-800 border border-gray-700 text-gray-100 text-xs font-mono px-2 py-1 rounded w-40"
                            value={newFields[flatPath]?.value || ""}
                            onChange={(e) =>
                                setNewFields((prev) => ({
                                    ...prev,
                                    [flatPath]: { ...prev[flatPath], value: e.target.value },
                                }))
                            }
                        />
                    )}
                    <button
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded px-3 py-1"
                        onClick={() =>
                            addKeyAtPath(
                                path,
                                newFields[flatPath]?.key,
                                newFields[flatPath]?.type,
                                newFields[flatPath]?.value
                            )
                        }
                    >
                        Add
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                {isEditingName ? (
                    <input
                        type="text"
                        value={recordName}
                        autoFocus
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                        onChange={(e) => setRecordName(e.target.value)}
                        className="bg-gray-900 text-white text-xl font-semibold border border-gray-700 p-2 rounded w-1/2"
                    />
                ) : (
                    <h1
                        onClick={() => setIsEditingName(true)}
                        className="text-xl font-semibold cursor-pointer hover:underline"
                        title="Click to edit"
                    >
                        {recordName}
                    </h1>
                )}
                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={() => navigate(`/data-stores/${dataStoreId}`)}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 text-sm font-medium"
                    >
                        Go back
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader />
                    </div>
                ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-gray-100">
                        <div className="flex gap-2 mb-4 border-b border-gray-800">
                            {["Record Editor", "Raw JSON"].map((label, idx) => (
                                <button
                                    key={label}
                                    className={`px-4 py-2 font-medium transition ${
                                        activeTab === idx
                                            ? "border-b-2 border-blue-500 text-blue-400"
                                            : "text-gray-400 hover:text-blue-400"
                                    }`}
                                    onClick={() => setActiveTab(idx)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {activeTab === 0 ? (
                            <div className="text-sm">{renderEditor(data)}</div>
                        ) : (
                            <Editor
                                height="600px"
                                defaultLanguage="json"
                                value={JSON.stringify(data, null, 2)}
                                onChange={(val) => {
                                    try {
                                        setData(JSON.parse(val || "{}"));
                                    } catch {
                                        // ignore parse error
                                    }
                                }}
                                theme="vs-dark"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Error Modal */}
            {showErrorModal && (
                <Modal
                    title="Error"
                    onCancel={() => {
                        setShowErrorModal(false);
                        setError(null);
                    }}
                    cancelText="Close"
                >
                    <div className="text-red-400">{error ?? "Something went wrong."}</div>
                </Modal>
            )}
        </div>
    );
}
