import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuthFetch} from "../hooks/useAuthFetch";
import {saveForm} from "../api/forms";
import {Modal} from "../components/common/Modal";

const COMPONENT_TYPES = {
    TEXT: "Text Field",
    NUMBER: "Number Field",
    EMAIL: "Email Field",
    TEXTAREA: "Textarea",
    DROPDOWN: "Dropdown",
    RADIO: "Radio Group",
    CHECKBOX: "Checkbox",
    DATE: "Date Picker",
};

let idCounter = 0;

export const FormBuilderPage = () => {
    const authFetch = useAuthFetch();
    const navigate = useNavigate();
    const [formName, setFormName] = useState("Untitled Form");
    const [isEditingName, setIsEditingName] = useState(false);
    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [draggedFieldId, setDraggedFieldId] = useState(null);
    const [dragOverFieldId, setDragOverFieldId] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        const formDefinition = {
            name: formName,
            fields: fields.map(({id, ...rest}) => rest),
        };
        try {
            await saveForm(authFetch, formDefinition);
            navigate("/forms");
        } catch (err) {
            setError(err.message || "Failed to save form");
            setShowErrorModal(true);
        }
    };

    const addField = (type) => {
        const newField = {
            id: ++idCounter,
            type,
            label: COMPONENT_TYPES[type],
            placeholder: "",
            required: false,
            options: ["Option 1", "Option 2"],
        };
        setFields((prev) => [...prev, newField]);
        setSelectedFieldId(newField.id);
    };

    const selectField = (id) => setSelectedFieldId(id);

    const updateField = (key, value) => {
        setFields((prev) =>
            prev.map((f) => (f.id === selectedFieldId ? {...f, [key]: value} : f))
        );
    };

    const updateOption = (index, value) => {
        setFields((prev) =>
            prev.map((f) =>
                f.id === selectedFieldId
                    ? {
                        ...f,
                        options: f.options.map((opt, i) =>
                            i === index ? value : opt
                        ),
                    }
                    : f
            )
        );
    };

    const addOption = () => {
        setFields((prev) =>
            prev.map((f) =>
                f.id === selectedFieldId
                    ? {...f, options: [...f.options, `Option ${f.options.length + 1}`]}
                    : f
            )
        );
    };

    const removeOption = (index) => {
        setFields((prev) =>
            prev.map((f) =>
                f.id === selectedFieldId
                    ? {
                        ...f,
                        options: f.options.filter((_, i) => i !== index),
                    }
                    : f
            )
        );
    };

    const moveField = (direction) => {
        setFields((prev) => {
            const index = prev.findIndex((f) => f.id === selectedFieldId);
            if (index < 0) return prev;

            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const newFields = [...prev];
            const [moved] = newFields.splice(index, 1);
            newFields.splice(newIndex, 0, moved);
            return newFields;
        });
    };

    const deleteField = () => {
        setFields((prev) => prev.filter((f) => f.id !== selectedFieldId));
        setSelectedFieldId(null);
    };

    const handleDragStart = (id) => setDraggedFieldId(id);

    const handleDragOver = (id) => {
        if (id !== draggedFieldId) setDragOverFieldId(id);
    };

    const handleDrop = (targetId) => {
        if (!draggedFieldId || draggedFieldId === targetId) return;

        const draggedIndex = fields.findIndex((f) => f.id === draggedFieldId);
        const targetIndex = fields.findIndex((f) => f.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newFields = [...fields];
        const [draggedField] = newFields.splice(draggedIndex, 1);
        newFields.splice(targetIndex, 0, draggedField);
        setFields(newFields);

        setDraggedFieldId(null);
        setDragOverFieldId(null);
    };

    const selectedField = fields.find((f) => f.id === selectedFieldId);

    const renderField = (field) => (
        <div
            key={field.id}
            className={`bg-gray-700 rounded p-4 mb-3 border transition-all ${
                field.id === selectedFieldId ? "border-blue-400" : "border-gray-600"
            } ${
                dragOverFieldId === field.id ? "shadow-lg ring-2 ring-blue-500" : ""
            } cursor-move`}
            draggable
            onClick={() => selectField(field.id)}
            onDragStart={() => handleDragStart(field.id)}
            onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(field.id);
            }}
            onDrop={() => handleDrop(field.id)}
        >
            <label className="block font-medium mb-1">
                {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            {["TEXT", "NUMBER", "EMAIL", "DATE", "TEXTAREA"].includes(field.type) && (
                <input
                    type={field.type === "TEXTAREA" ? "text" : field.type.toLowerCase()}
                    placeholder={field.placeholder}
                    disabled
                    className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"
                />
            )}
            {field.type === "DROPDOWN" && (
                <select disabled className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600">
                    {field.options.map((opt, idx) => (
                        <option key={idx}>{opt}</option>
                    ))}
                </select>
            )}
            {field.type === "RADIO" && (
                <div className="space-y-1">
                    {field.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center">
                            <input type="radio" disabled className="mr-2"/>
                            <label>{opt}</label>
                        </div>
                    ))}
                </div>
            )}
            {field.type === "CHECKBOX" && (
                <div className="flex items-center">
                    <input type="checkbox" disabled className="mr-2"/>
                    <label>{field.placeholder || "I agree"}</label>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-950 px-6 py-3 border-b border-gray-800">
                {isEditingName ? (
                    <input
                        type="text"
                        value={formName}
                        autoFocus
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") setIsEditingName(false);
                        }}
                        onChange={(e) => setFormName(e.target.value)}
                        className="bg-gray-900 text-white text-xl font-semibold border border-gray-700 p-2 rounded w-1/2"
                    />
                ) : (
                    <h1
                        onClick={() => setIsEditingName(true)}
                        className="text-xl font-semibold text-white cursor-pointer hover:underline"
                        title="Click to edit"
                    >
                        {formName}
                    </h1>
                )}
                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={() => navigate("/forms")}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
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

            {/* Layout */}
            <div className="flex h-[calc(100vh-4rem)] bg-gray-900 text-white">
                {/* Sidebar Left */}
                <aside className="w-64 border-r border-gray-700 p-4">
                    <h2 className="text-lg font-bold mb-4">Add Components</h2>
                    <div className="space-y-2">
                        {Object.entries(COMPONENT_TYPES).map(([key, label]) => (
                            <button
                                key={key}
                                className="w-full bg-gray-800 hover:bg-gray-700 p-2 rounded text-left"
                                onClick={() => addField(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Canvas */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <h1 className="text-2xl font-semibold mb-4">Form Canvas</h1>
                    <div className="bg-gray-800 p-6 rounded-lg min-h-[400px] border border-gray-700">
                        {fields.length === 0 ? (
                            <p className="text-gray-400">Add any components to build your form.</p>
                        ) : (
                            fields.map(renderField)
                        )}
                    </div>
                </main>

                {/* Sidebar Right */}
                <aside className="w-80 border-l border-gray-700 p-4">
                    <h2 className="text-lg font-bold mb-4">Field Settings</h2>
                    {!selectedField ? (
                        <p className="text-gray-400">Select a field to edit its properties.</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Label</label>
                                <input
                                    type="text"
                                    value={selectedField.label}
                                    onChange={(e) => updateField("label", e.target.value)}
                                    className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Placeholder</label>
                                <input
                                    type="text"
                                    value={selectedField.placeholder}
                                    onChange={(e) => updateField("placeholder", e.target.value)}
                                    className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={selectedField.required}
                                    onChange={(e) => updateField("required", e.target.checked)}
                                    className="form-checkbox bg-gray-700 border-gray-600 rounded"
                                />
                                <label className="text-sm">Required</label>
                            </div>
                            {(selectedField.type === "RADIO" || selectedField.type === "DROPDOWN") && (
                                <div className="pt-2 space-y-2">
                                    <h4 className="text-sm font-semibold">Options</h4>
                                    {selectedField.options.map((opt, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                value={opt}
                                                onChange={(e) => updateOption(index, e.target.value)}
                                                className="flex-1 bg-gray-800 text-white p-2 rounded border border-gray-600"
                                            />
                                            <button
                                                onClick={() => removeOption(index)}
                                                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-sm rounded"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addOption}
                                        className="w-full text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded"
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-2 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => moveField("up")}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-sm px-3 py-2 rounded"
                                >
                                    Move Up
                                </button>
                                <button
                                    onClick={() => moveField("down")}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-sm px-3 py-2 rounded"
                                >
                                    Move Down
                                </button>
                                <button
                                    onClick={deleteField}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-sm px-3 py-2 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Error Modal */}
            {showErrorModal && (
                <Modal
                    title="Failed to save form"
                    onCancel={() => setShowErrorModal(false)}
                    cancelText="Close"
                >
                    <div className="text-red-400">{error ?? "Unknown error occurred while saving the form."}</div>
                    <div className="text-gray-400">
                        Please try again later, or contact your administrator if this issue persists.
                    </div>
                </Modal>
            )}
        </>
    );
};
