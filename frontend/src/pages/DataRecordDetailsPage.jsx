import {useCallback, useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Modal} from "../components/common/Modal";
import {Loader} from "../components/common/Loader";
import {useAuthFetch} from "../hooks/useAuthFetch";
import {getDataRecordById, updateDataRecord} from "../api/dataStores";
import Editor from "@monaco-editor/react";

export function DataRecordDetailsPage() {
    const {dataRecordId, dataStoreId} = useParams();
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    const [record, setRecord] = useState(null);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newFields, setNewFields] = useState({});
    const [arrayItems, setArrayItems] = useState({});
    const [activeIdx, setActiveIdx] = useState(0);

    const saveTimeout = useRef(null);

    const fetchRecord = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getDataRecordById(authFetch, dataStoreId, dataRecordId);
            setRecord(result);
            setData(result?.recordData ?? {});
        } catch (err) {
            setFetchError(err.message || "Failed to load data record");
            setShowModal(true);
        }
        setLoading(false);
    }, [authFetch, dataRecordId, dataStoreId]);

    const handleDataChange = async (newData) => {
        setData(newData);
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            try {
                await updateDataRecord(authFetch, dataStoreId, dataRecordId, newData);
            } catch (err) {
                setSaveError(err.message || "Failed to update data record");
                setShowModal(true);
            }
        }, 600);
    };

    const updateValueAtPath = (path, value) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
        ref[path[path.length - 1]] = value;
        handleDataChange(newData);
    };

    const deleteKeyAtPath = (path) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
        delete ref[path[path.length - 1]];
        handleDataChange(newData);
    };

    const deleteArrayIndex = (path, index) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i++) ref = ref[path[i]];
        ref.splice(index, 1);
        handleDataChange(newData);
    };

    const addKeyAtPath = (path, key, type, primitiveValue = "") => {
        if (!key) return;
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i++) ref = ref[path[i]];
        if (type === "object") ref[key] = {};
        else if (type === "array") ref[key] = [];
        else ref[key] = tryParse(primitiveValue);
        setNewFields((prev) => ({...prev, [path.join(".")]: {key: "", type: "primitive", value: ""}}));
        handleDataChange(newData);
    };

    const addToArrayAtPath = (path, value) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i++) ref = ref[path[i]];
        ref.push(tryParse(value));
        setArrayItems((prev) => ({...prev, [path.join(".")]: ""}));
        handleDataChange(newData);
    };

    const tryParse = (val) => {
        try {
            return JSON.parse(val);
        } catch {
            return val;
        }
    };

    const renderEditor = (node, path = []) => {
        const flatPath = path.join(".");

        if (Array.isArray(node)) {
            return (
                <div className="space-y-2 w-full">
                    {node.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <div className="flex-1">
                                <input
                                    className="bg-gray-800 border border-gray-700 text-green-300 font-mono rounded-md px-2 py-1 w-full text-sm"
                                    value={String(item)}
                                    onChange={(e) => {
                                        const newArray = [...node];
                                        newArray[i] = tryParse(e.target.value);
                                        updateValueAtPath(path, newArray);
                                    }}
                                />
                            </div>
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
                            onChange={(e) => setArrayItems((prev) => ({...prev, [flatPath]: e.target.value}))}
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
                                [flatPath]: {...prev[flatPath], key: e.target.value},
                            }))
                        }
                    />
                    <select
                        className="bg-gray-800 border border-gray-700 text-gray-100 text-xs font-mono px-2 py-1 rounded w-32"
                        value={newFields[flatPath]?.type || "primitive"}
                        onChange={(e) =>
                            setNewFields((prev) => ({
                                ...prev,
                                [flatPath]: {...prev[flatPath], type: e.target.value},
                            }))
                        }
                    >
                        <option value="primitive">Primitive</option>
                        <option value="object">Object</option>
                        <option value="array">Array</option>
                    </select>
                    {newFields[flatPath]?.type === "primitive" && (
                        <input
                            placeholder="Value"
                            className="bg-gray-800 border border-gray-700 text-gray-100 text-xs font-mono px-2 py-1 rounded w-40"
                            value={newFields[flatPath]?.value || ""}
                            onChange={(e) =>
                                setNewFields((prev) => ({
                                    ...prev,
                                    [flatPath]: {...prev[flatPath], value: e.target.value},
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

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-6">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-white">{record?.name ?? "<record name>"}</h1>
                    <div className="text-xs text-gray-400 font-mono space-x-4">
                        <span><strong className="text-gray-300">Store:</strong> {record?.dataStoreName ?? "-"}</span>
                        <span><strong className="text-gray-300">Viewer:</strong> {record?.viewerType ?? "-"}</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/data-stores/${dataStoreId}/records`)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 rounded-md px-4 py-1.5 text-sm font-medium"
                >
                    Go back
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader/>
                </div>
            ) : fetchError ? null : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-gray-100">
                    <div className="flex gap-2 mb-4 border-b border-gray-800">
                        {["Record Editor", "Raw Data"].map((label, idx) => (
                            <button
                                key={label}
                                className={`px-4 py-2 font-medium transition ${
                                    activeIdx === idx
                                        ? "border-b-2 border-blue-500 text-blue-400"
                                        : "text-gray-400 hover:text-blue-400"
                                }`}
                                onClick={() => setActiveIdx(idx)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {activeIdx === 0 ? (
                        <div className="text-sm">{renderEditor(data)}</div>
                    ) : (
                        <Editor
                            height="600px"
                            defaultLanguage="json"
                            value={JSON.stringify(data, null, 2)}
                            onChange={(val) => {
                                try {
                                    const parsed = JSON.parse(val || "{}");
                                    handleDataChange(parsed);
                                } catch {}
                            }}
                            theme="vs-dark"
                        />
                    )}
                </div>
            )}

            {showModal && (
                <Modal
                    title="Error"
                    onCancel={() => {
                        setShowModal(false);
                        setSaveError(null);
                        setFetchError(null);
                    }}
                    cancelText="Close"
                >
                    <div className="text-red-400 text-sm">
                        {fetchError || saveError || "An error occurred."}
                    </div>
                </Modal>
            )}
        </div>
    );
}
