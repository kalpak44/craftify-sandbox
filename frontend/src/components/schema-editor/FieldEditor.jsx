import { useState } from "react";

const FieldEditor = ({ schema, onSchemaChange }) => {
    const [newKey, setNewKey] = useState("");
    const [newType, setNewType] = useState("string");

    const addField = () => {
        if (!newKey.trim()) return;

        const newField = generateFieldByType(newType);
        onSchemaChange({
            ...schema,
            properties: {
                ...schema.properties,
                [newKey]: newField
            }
        });
        setNewKey("");
    };

    const generateFieldByType = (type) => {
        switch (type) {
            case "string":
                return {
                    type: "string",
                    required: false,
                    minLength: 0,
                    maxLength: 255,
                    regex: ""
                };
            case "number":
                return {
                    type: "number",
                    required: false,
                    minValue: 0,
                    maxValue: 100
                };
            case "boolean":
                return { type: "boolean" };
            case "array":
                return {
                    type: "array",
                    required: false,
                    exactLength: null,
                    notLength: null,
                    items: generateFieldByType("string") // default item type
                };
            case "object":
                return {
                    type: "object",
                    required: false,
                    properties: {}
                };
            default:
                return { type: "string" };
        }
    };

    const updateFieldValue = (key, prop, value) => {
        const updated = {
            ...schema,
            properties: {
                ...schema.properties,
                [key]: {
                    ...schema.properties[key],
                    [prop]: value
                }
            }
        };
        onSchemaChange(updated);
    };

    const updateNestedField = (key, nestedSchema) => {
        onSchemaChange({
            ...schema,
            properties: {
                ...schema.properties,
                [key]: nestedSchema
            }
        });
    };

    const removeField = (key) => {
        const { [key]: _, ...rest } = schema.properties;
        onSchemaChange({
            ...schema,
            properties: rest
        });
    };

    const updateArrayItemType = (key, type) => {
        const baseItem = generateFieldByType(type);
        updateFieldValue(key, "items", baseItem);
    };

    const updateArrayItemValidation = (key, prop, value) => {
        const items = schema.properties[key].items || {};
        updateFieldValue(key, "items", { ...items, [prop]: value });
    };

    const renderValidationControls = (key, field) => {
        if (!field.required) return null;

        switch (field.type) {
            case "string":
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={field.minLength}
                            onChange={(e) => updateFieldValue(key, "minLength", Number(e.target.value))}
                            placeholder="minLength"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                        <input
                            type="number"
                            value={field.maxLength}
                            onChange={(e) => updateFieldValue(key, "maxLength", Number(e.target.value))}
                            placeholder="maxLength"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                        <input
                            type="text"
                            value={field.regex}
                            onChange={(e) => updateFieldValue(key, "regex", e.target.value)}
                            placeholder="regex pattern"
                            className="col-span-2 bg-gray-700 px-2 py-1 rounded"
                        />
                    </div>
                );
            case "number":
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={field.minValue}
                            onChange={(e) => updateFieldValue(key, "minValue", Number(e.target.value))}
                            placeholder="minValue"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                        <input
                            type="number"
                            value={field.maxValue}
                            onChange={(e) => updateFieldValue(key, "maxValue", Number(e.target.value))}
                            placeholder="maxValue"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                    </div>
                );
            case "array":
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={field.exactLength || ""}
                            onChange={(e) => updateFieldValue(key, "exactLength", e.target.value === "" ? null : Number(e.target.value))}
                            placeholder="Exact Length"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                        <input
                            type="number"
                            value={field.notLength || ""}
                            onChange={(e) => updateFieldValue(key, "notLength", e.target.value === "" ? null : Number(e.target.value))}
                            placeholder="Not Length"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                    </div>
                );
            case "object":
                return (
                    <p className="text-sm text-gray-400">
                        Required objects must contain at least one property.
                    </p>
                );
            default:
                return null;
        }
    };

    const renderArrayItemEditor = (key, field) => {
        if (field.type !== "array" || !field.items) return null;

        const itemType = field.items.type;

        return (
            <div className="mt-3 space-y-2">
                <label className="block text-sm font-medium">Array of:</label>
                <select
                    value={itemType}
                    onChange={(e) => updateArrayItemType(key, e.target.value)}
                    className="bg-gray-700 px-2 py-1 rounded"
                >
                    <option value="string">STRING</option>
                    <option value="number">NUMBER</option>
                    <option value="boolean">BOOLEAN</option>
                    <option value="object">OBJECT</option>
                    <option value="array">ARRAY</option>
                </select>

                {/* Primitive item validation */}
                {["string", "number"].includes(itemType) && (
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={field.items.required || false}
                            onChange={(e) => updateArrayItemValidation(key, "required", e.target.checked)}
                        />
                        <span>Required Item</span>
                    </label>
                )}

                {field.items.required && itemType === "string" && (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={field.items.minLength}
                            onChange={(e) => updateArrayItemValidation(key, "minLength", Number(e.target.value))}
                            placeholder="minLength"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                        <input
                            type="number"
                            value={field.items.maxLength}
                            onChange={(e) => updateArrayItemValidation(key, "maxLength", Number(e.target.value))}
                            placeholder="maxLength"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                        <input
                            type="text"
                            value={field.items.regex}
                            onChange={(e) => updateArrayItemValidation(key, "regex", e.target.value)}
                            placeholder="regex pattern"
                            className="col-span-2 bg-gray-700 px-2 py-1 rounded"
                        />
                    </div>
                )}

                {field.items.required && itemType === "number" && (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={field.items.minValue}
                            onChange={(e) => updateArrayItemValidation(key, "minValue", Number(e.target.value))}
                            placeholder="minValue"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                        <input
                            type="number"
                            value={field.items.maxValue}
                            onChange={(e) => updateArrayItemValidation(key, "maxValue", Number(e.target.value))}
                            placeholder="maxValue"
                            className="bg-gray-700 px-2 py-1 rounded"
                        />
                    </div>
                )}

                {(itemType === "object" || itemType === "array") && (
                    <FieldEditor
                        schema={field.items}
                        onSchemaChange={(updated) =>
                            updateFieldValue(key, "items", updated)
                        }
                    />
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {Object.entries(schema.properties).map(([key, field]) => (
                <div key={key} className="border border-gray-700 p-3 rounded bg-gray-800 space-y-2">
                    <div className="flex justify-between items-center">
                        <strong>{key} ({field.type})</strong>
                        <button onClick={() => removeField(key)} className="text-red-400 text-xs">
                            Remove
                        </button>
                    </div>

                    {["string", "number", "array", "object"].includes(field.type) && (
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={field.required || false}
                                onChange={(e) => updateFieldValue(key, "required", e.target.checked)}
                            />
                            <span>Required</span>
                        </label>
                    )}

                    {renderValidationControls(key, field)}

                    {field.type === "array" && renderArrayItemEditor(key, field)}

                    {field.type === "object" && (
                        <FieldEditor
                            schema={field}
                            onSchemaChange={(updated) => updateNestedField(key, updated)}
                        />
                    )}
                </div>
            ))}

            {/* New field input */}
            <div className="flex gap-2 items-end">
                <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Field name"
                    className="px-3 py-1 rounded bg-gray-700 text-white outline-none"
                />
                <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="px-3 py-1 rounded bg-gray-700 text-white outline-none"
                >
                    <option value="string">STRING</option>
                    <option value="number">NUMBER</option>
                    <option value="boolean">BOOLEAN</option>
                    <option value="array">ARRAY</option>
                    <option value="object">OBJECT</option>
                </select>
                <button
                    onClick={addField}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                    Add Field
                </button>
            </div>
        </div>
    );
};

export default FieldEditor;
