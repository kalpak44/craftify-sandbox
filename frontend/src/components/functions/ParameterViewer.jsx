import {useState} from "react";

export function ParameterViewer() {
    const [params, setParams] = useState([
        {key: "RETRY_COUNT", value: "3"},
        {key: "REGION", value: "eu-west-1"},
        {key: "EMAIL_FROM", value: "noreply@example.com"},
    ]);
    const [editingIdx, setEditingIdx] = useState(null);
    const [edit, setEdit] = useState({key: "", value: ""});

    const [adding, setAdding] = useState(false);
    const [newParam, setNewParam] = useState({key: "", value: ""});

    // Начать редактировать строку
    const startEdit = (idx) => {
        setEditingIdx(idx);
        setEdit({...params[idx]});
    };

    // Сохранить редактирование
    const saveEdit = (idx) => {
        const updated = [...params];
        updated[idx] = {...edit};
        setParams(updated);
        setEditingIdx(null);
    };

    // Удалить параметр
    const removeParam = (idx) => {
        setParams(params.filter((_, i) => i !== idx));
        if (editingIdx === idx) setEditingIdx(null);
    };

    // Добавить новый параметр
    const addParam = () => {
        if (!newParam.key) return;
        setParams([...params, {...newParam}]);
        setNewParam({key: "", value: ""});
        setAdding(false);
    };

    return (
        <div className="bg-gray-950 rounded-xl shadow p-4 border border-gray-800 w-full">
            <div className="flex justify-between items-center mb-3">
                <div className="text-lg font-semibold text-gray-200">Parameters</div>
                {!adding && (
                    <button
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        onClick={() => setAdding(true)}
                    >
                        Add
                    </button>
                )}
            </div>
            <table className="min-w-full text-gray-100">
                <thead>
                <tr className="text-gray-400">
                    <th className="pb-2 text-left">Key</th>
                    <th className="pb-2 text-left">Value</th>
                    <th className="pb-2"></th>
                </tr>
                </thead>
                <tbody>
                {/* Форма добавления */}
                {adding && (
                    <tr>
                        <td className="py-2 pr-4">
                            <input
                                autoFocus
                                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-full text-sm text-gray-100"
                                placeholder="KEY"
                                value={newParam.key}
                                onChange={(e) => setNewParam({...newParam, key: e.target.value})}
                            />
                        </td>
                        <td className="py-2 pr-4">
                            <input
                                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-full text-sm text-gray-100"
                                placeholder="Value"
                                value={newParam.value}
                                onChange={(e) => setNewParam({...newParam, value: e.target.value})}
                            />
                        </td>
                        <td className="py-2">
                            <button
                                className="mr-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                onClick={addParam}
                            >
                                Save
                            </button>
                            <button
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs"
                                onClick={() => {
                                    setAdding(false);
                                    setNewParam({key: "", value: ""});
                                }}
                            >
                                Cancel
                            </button>
                        </td>
                    </tr>
                )}
                {/* Список параметров */}
                {params.map((param, idx) =>
                    editingIdx === idx ? (
                        <tr key={idx} className="group hover:bg-gray-900 transition">
                            <td className="py-2 pr-4">
                                <input
                                    autoFocus
                                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-full text-sm text-gray-100"
                                    value={edit.key}
                                    onChange={e => setEdit({...edit, key: e.target.value})}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") saveEdit(idx);
                                        if (e.key === "Escape") setEditingIdx(null);
                                    }}
                                />
                            </td>
                            <td className="py-2 pr-4">
                                <input
                                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 w-full text-sm text-gray-100"
                                    value={edit.value}
                                    onChange={e => setEdit({...edit, value: e.target.value})}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") saveEdit(idx);
                                        if (e.key === "Escape") setEditingIdx(null);
                                    }}
                                />
                            </td>
                            <td className="py-2">
                                <button
                                    className="mr-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                    onClick={() => saveEdit(idx)}
                                >
                                    Save
                                </button>
                                <button
                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs"
                                    onClick={() => setEditingIdx(null)}
                                >
                                    Cancel
                                </button>
                            </td>
                        </tr>
                    ) : (
                        <tr key={idx} className="group hover:bg-gray-900 transition">
                            <td
                                className="py-2 pr-4 font-mono text-gray-400 cursor-pointer group-hover:underline group-hover:text-blue-400"
                                title="Click to edit"
                                onClick={() => startEdit(idx)}
                            >
                                {param.key}
                            </td>
                            <td
                                className="py-2 pr-4 font-mono cursor-pointer group-hover:underline group-hover:text-blue-400"
                                title="Click to edit"
                                onClick={() => startEdit(idx)}
                            >
                                {param.value}
                            </td>
                            <td className="py-2">
                                <button
                                    onClick={() => removeParam(idx)}
                                    className="px-2 py-1 text-xs rounded bg-red-800 hover:bg-red-700 text-red-200"
                                    title="Delete parameter"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    )
                )}
                {params.length === 0 && !adding && (
                    <tr>
                        <td colSpan={3} className="text-gray-500 italic py-6 text-center">
                            No parameters set
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
