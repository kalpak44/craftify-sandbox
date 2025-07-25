import {useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Modal} from "../components/common/Modal";
import {Loader} from "../components/common/Loader";
import {useAuthFetch} from "../hooks/useAuthFetch";
import {createDataRecord} from "../api/dataStores";
import Editor from "@monaco-editor/react";

export function DataRecordCreatePage() {
    const {id: dataStoreId, type: dataStoreType} = useParams();
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    const [name, setName] = useState("");
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newFields, setNewFields] = useState({});
    const [arrayItems, setArrayItems] = useState({});
    const [activeIdx, setActiveIdx] = useState(0);
    const saveTimeout = useRef(null);

    // Debounced save: sends the new record to the server after a short delay.
    const handleDataChange = (newData) => {
        setData(newData);
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            try {
                setLoading(true);
                const created = await createDataRecord(authFetch, dataStoreId, {
                    name,
                    recordData: newData,
                });
                navigate(`/data-stores/${dataStoreId}/${dataStoreType}/${created.id}`);
            } catch (err) {
                setSaveError(err.message || "Failed to create data record");
                setShowModal(true);
            } finally {
                setLoading(false);
            }
        }, 600);
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
        for (let i = 0; i < path.length - 1; i) ref = ref[path[i]];
        ref[path[path.length - 1]] = value;
        handleDataChange(newData);
    };

    const deleteKeyAtPath = (path) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length - 1; i) ref = ref[path[i]];
        delete ref[path[path.length - 1]];
        handleDataChange(newData);
    };

    const deleteArrayIndex = (path, index) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i) ref = ref[path[i]];
        ref.splice(index, 1);
        handleDataChange(newData);
    };

    const addKeyAtPath = (path, key, type, primitiveValue = "") => {
        if (!key) return;
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i) ref = ref[path[i]];
        if (type === "object") ref[key] = {};
        else if (type === "array") ref[key] = [];
        else ref[key] = tryParse(primitiveValue);
        setNewFields((prev) => ({...prev, [path.join(".")]: {key: "", type: "primitive", value: ""}}));
        handleDataChange(newData);
    };

    const addToArrayAtPath = (path, value) => {
        const newData = structuredClone(data);
        let ref = newData;
        for (let i = 0; i < path.length; i) ref = ref[path[i]];
        ref.push(tryParse(value));
        setArrayItems((prev) => ({...prev, [path.join(".")]: ""}));
        handleDataChange(newData);
    };

    const renderEditor = (node, path = []) => {
        const flatPath = path.join(".");
        if (Array.isArray(node)) {
            return (
                <div className="ml-4 border-l border-gray-700 pl-4 mt-2">
                    {node.map((item, i) => (
                        <div key={i} className="mb-2">
                            {renderEditor(item, [...path, i])}
                            <button
                                onClick={() => deleteArrayIndex(path, i)}
                                className="bg-red-800 hover:bg-red-700 text-red-200 border border-red-700 rounded-md px-3 py-1 text-xs font-medium ml-2"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center mt-2 gap-2">
                        <input
                            type="text"
                            className="bg-gray-800 text-gray-100 border border-gray-700 rounded-md px-2 py-1 text-sm flex-1"
                            value={arrayItems[flatPath] ?? ""}
                            onChange={(e) =>
                                setArrayItems((prev) => ({...prev, [flatPath]: e.target.value}))
                            }
                        />
                        <button
                            onClick={() => addToArrayAtPath(path, arrayItems[flatPath])}
                            className="bg-green-800 hover:bg-green-700 text-green-200 border border-green-700 rounded-md px-3 py-1 text-xs font-medium"
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
                    type="text"
                    className="bg-gray-800 text-gray-100 border border-gray-700 rounded-md px-2 py-1 text-sm w-full"
                    value={node ?? ""}
                    onChange={(e) => updateValueAtPath(path, tryParse(e.target.value))}
                />
            );
        }
        return (
            <div className="ml-4 border-l border-gray-700 pl-4 mt-2">
                {Object.entries(node).map(([key, value]) => {
                    const subPath = [...path, key];
                    return (
                        <div key={key} className="mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300">{key}</span>
                                <button
                                    onClick={() => deleteKeyAtPath(subPath)}
                                    className="bg-red-800 hover:bg-red-700 text-red-200 border border-red-700 rounded-md px-3 py-1 text-xs font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                            {renderEditor(value, subPath)}
                        </div>
                    );
                })}
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Key"
                            className="bg-gray-800 text-gray-100 border border-gray-700 rounded-md px-2 py-1 text-sm"
                            value={newFields[flatPath]?.key ?? ""}
                            onChange={(e) =>
                                setNewFields((prev) => ({
                                    ...prev,
                                    [flatPath]: {...prev[flatPath], key: e.target.value},
                                }))
                            }
                        />
                        <select
                            className="bg-gray-800 text-gray-100 border border-gray-700 rounded-md px-2 py-1 text-sm"
                            value={newFields[flatPath]?.type ?? "primitive"}
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
                                type="text"
                                placeholder="Value"
                                className="bg-gray-800 text-gray-100 border border-gray-700 rounded-md px-2 py-1 text-sm"
                                value={newFields[flatPath]?.value ?? ""}
                                onChange={(e) =>
                                    setNewFields((prev) => ({
                                        ...prev,
                                        [flatPath]: {...prev[flatPath], value: e.target.value},
                                    }))
                                }
                            />
                        )}
                        <button
                            onClick={() =>
                                addKeyAtPath(
                                    path,
                                    newFields[flatPath]?.key,
                                    newFields[flatPath]?.type,
                                    newFields[flatPath]?.value
                                )
                            }
                            className="bg-green-800 hover:bg-green-700 text-green-200 border border-green-700 rounded-md px-3 py-1 text-xs font-medium"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
            <div className="px-4 flex gap-2">
                <h2 className="flex-1 text-gray-100 text-xl font-semibold">Create New Record</h2>
                <button
                    onClick={() => navigate(`/data-stores/${dataStoreId}/records`)}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600 rounded-md px-4 py-1.5 text-sm font-medium"
                >
                    Go back
                </button>
            </div>
            <div className="mt-4 mb-4">
                <label className="block text-sm text-gray-400 mb-1">Record Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-800 text-gray-100 border border-gray-700 rounded-md px-2 py-1 text-sm"
                    placeholder="Enter record name"
                />
            </div>
            {loading ? (
                <div className="mt-4">
                    <Loader/>
                </div>
            ) : (
                <div className="mt-4">
                    <div className="flex gap-4 mb-4">
                        {['Record Editor', 'Raw Data'].map((label, idx) => (
                            <button
                                key={label}
                                onClick={() => setActiveIdx(idx)}
                                className={`px-3 py-1 rounded-md ${
                                    activeIdx === idx
                                        ? 'bg-gray-700 text-gray-100'
                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {activeIdx === 0 ? (
                        <div>{renderEditor(data)}</div>
                    ) : (
                        <Editor
                            height="50vh"
                            defaultLanguage="json"
                            value={JSON.stringify(data, null, 2)}
                            onChange={(val) => {
                                try {
                                    const parsed = JSON.parse(val || '{}');
                                    handleDataChange(parsed);
                                } catch {
                                }
                            }}
                            theme="vs-dark"
                        />
                    )}
                </div>
            )}
            {showModal && (
                <Modal
                    onClose={() => {
                        setShowModal(false);
                        setSaveError(null);
                    }}
                    cancelText="Close"
                >
                    <div className="text-red-400">{saveError || 'An error occurred.'}</div>
                </Modal>
            )}
        </div>
    );
}