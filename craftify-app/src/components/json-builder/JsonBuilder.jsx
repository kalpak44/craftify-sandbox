import {useEffect, useState} from "react";

const SYSTEM_FIELDS = [
    {
        key: "name",
        label: "Name",
        type: "string",
        required: true,
        validations: {minLength: 3},
        editable: false,
        description: ""
    },
    {
        key: "description",
        label: "Description",
        type: "string",
        required: false,
        editable: true,
        description: ""
    },
    {
        key: "createdAt",
        label: "Created At",
        type: "date",
        required: true,
        editable: false,
        description: ""
    },
    {
        key: "updatedAt",
        label: "Updated At",
        type: "date",
        required: true,
        editable: false,
        description: ""
    }
];

function getDefaultField(type = "string") {
    if (type === "object") return {type, required: false, fields: {}, description: ""};
    if (type === "array") return {
        type,
        required: false,
        item: getDefaultField(),
        validations: {notEmpty: false},
        description: ""
    };
    const base = {type, required: false, validations: {}, description: ""};
    if (type === "string") base.validations = {minLength: 0, maxLength: 255, regex: ""};
    if (type === "number") base.validations = {min: 0, max: 100};
    return base;
}

function FieldOptions({type, validations = {}, onChange, disabled = false}) {
    if (type === "string") {
        return (
            <div className="flex gap-4 items-center text-sm text-gray-300 mt-1">
                <label>Min Length: <input type="number"
                                          className="w-20 h-9 bg-gray-900 border border-gray-700 rounded px-2 text-base"
                                          value={validations.minLength || 0} min={0}
                                          onChange={disabled ? undefined : e => onChange({
                                              ...validations,
                                              minLength: Number(e.target.value)
                                          })} disabled={disabled}/></label>
                <label>Max Length: <input type="number"
                                          className="w-20 h-9 bg-gray-900 border border-gray-700 rounded px-2 text-base"
                                          value={validations.maxLength || 255} min={1}
                                          onChange={disabled ? undefined : e => onChange({
                                              ...validations,
                                              maxLength: Number(e.target.value)
                                          })} disabled={disabled}/></label>
                <label>Regex: <input type="text"
                                     className="w-40 h-9 bg-gray-900 border border-gray-700 rounded px-2 text-base"
                                     value={validations.regex || ""} onChange={disabled ? undefined : e => onChange({
                    ...validations,
                    regex: e.target.value
                })} disabled={disabled}/></label>
            </div>
        );
    }
    if (type === "number") {
        return (
            <div className="flex gap-4 items-center text-sm text-gray-300 mt-1">
                <label>Min: <input type="number"
                                   className="w-20 h-9 bg-gray-900 border border-gray-700 rounded px-2 text-base"
                                   value={validations.min || 0} onChange={disabled ? undefined : e => onChange({
                    ...validations,
                    min: Number(e.target.value)
                })} disabled={disabled}/></label>
                <label>Max: <input type="number"
                                   className="w-20 h-9 bg-gray-900 border border-gray-700 rounded px-2 text-base"
                                   value={validations.max || 100} onChange={disabled ? undefined : e => onChange({
                    ...validations,
                    max: Number(e.target.value)
                })} disabled={disabled}/></label>
            </div>
        );
    }
    return null;
}

function generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now();
}

function EditableField({
                           fieldId,
                           fieldKey,
                           field,
                           onChange,
                           onRemove,
                           isSystem = false,
                           systemMeta = {},
                           siblingKeys = [],
                       }) {
    const {type, required, validations, description, fields, item, propertyKey} = field;
    const editable = !isSystem;
    const [keyInput, setKeyInput] = useState(propertyKey || fieldKey || "");
    const [keyError, setKeyError] = useState("");

    useEffect(() => {
        setKeyInput(propertyKey || fieldKey || "");
    }, [propertyKey, fieldKey]);

    const handleKeyInputChange = (e) => {
        setKeyInput(e.target.value);
        if (siblingKeys.includes(e.target.value)) {
            setKeyError("Duplicate property key at this level");
        } else if (!e.target.value.trim()) {
            setKeyError("Property key is required");
        } else {
            setKeyError("");
        }
    };

    const commitKeyChange = () => {
        if (
            keyInput !== propertyKey &&
            keyInput.trim() &&
            !siblingKeys.includes(keyInput)
        ) {
            onChange(fieldId, {...field, propertyKey: keyInput});
        }
    };

    const handleKeyInputKeyDown = (e) => {
        if (e.key === "Enter") {
            commitKeyChange();
            e.target.blur();
        }
    };

    const handleNestedFieldsChange = (newFields) => {
        onChange(fieldId, {...field, fields: newFields});
    };

    const handleArrayItemChange = (newItem) => {
        onChange(fieldId, {...field, item: newItem});
    };

    const handleArrayNotEmptyChange = (checked) => {
        onChange(fieldId, {...field, validations: {...field.validations, notEmpty: checked}});
    };

    const safeFields = typeof fields === 'object' && fields !== null ? fields : {};
    const safeItem = typeof item === 'object' && item !== null ? item : getDefaultField();

    return (
        <div className="flex flex-col gap-2 mb-4 ml-4 border-l-2 border-gray-700 pl-4 py-2">
            <div className="flex items-center gap-4 mb-1">
                <input
                    className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 mr-3 text-base h-10 min-w-[120px]"
                    value={keyInput}
                    disabled={!editable}
                    onChange={handleKeyInputChange}
                    onBlur={commitKeyChange}
                    onKeyDown={handleKeyInputKeyDown}
                    placeholder="Field name (property key)"
                />
                <select
                    value={type}
                    disabled={!editable}
                    onChange={editable ? e => onChange(fieldId, {
                        ...getDefaultField(e.target.value),
                        propertyKey: keyInput,
                        required,
                        description,
                        id: fieldId
                    }) : undefined}
                    className="bg-gray-700 text-white rounded px-2 py-2 mr-3 text-base h-10 min-w-[120px]"
                >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="object">object</option>
                    <option value="array">array</option>
                    <option value="date">date</option>
                </select>
                <label className="flex items-center gap-2 text-base">
                    <input
                        type="checkbox"
                        checked={!!required}
                        disabled={!editable}
                        onChange={editable ? e => onChange(fieldId, {...field, required: e.target.checked}) : undefined}
                        className="w-5 h-5"
                    /> Mandatory
                </label>
                {!isSystem && (
                    <button onClick={onRemove}
                            className="text-red-400 ml-4 px-3 py-2 rounded text-base h-10">Remove</button>
                )}
            </div>
            {keyError && <div className="text-red-400 text-sm ml-1">{keyError}</div>}
            {(type === "string" || type === "number") ? (
                <FieldOptions
                    type={type}
                    validations={validations}
                    onChange={editable ? v => onChange(fieldId, {...field, validations: v}) : undefined}
                    disabled={!editable}
                />
            ) : null}
            {type === "object" && (
                <div className="ml-2 mt-2">
                    <div className="text-gray-300 text-base mb-2">Object Fields:</div>
                    <JsonBuilder value={safeFields} onChange={handleNestedFieldsChange} showSystemFields={false}/>
                </div>
            )}
            {type === "array" && (
                <div className="ml-2 mt-2">
                    <div className="text-gray-300 text-base mb-2">Array Item Schema:</div>
                    <JsonBuilder value={safeItem} onChange={handleArrayItemChange} showSystemFields={false}/>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            className="w-5 h-5"
                            checked={!!(validations && validations.notEmpty)}
                            disabled={!editable}
                            onChange={editable ? e => handleArrayNotEmptyChange(e.target.checked) : undefined}
                        />
                        <span className="text-gray-300 text-base">Array must not be empty</span>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2 text-base mt-1">
                <label>Description: </label>
                <input
                    className="bg-gray-900 text-white border border-gray-700 rounded px-3 py-2 flex-1 text-base h-10"
                    value={description || ""}
                    disabled={!editable}
                    onChange={editable ? e => onChange(fieldId, {...field, description: e.target.value}) : undefined}
                    placeholder="Description (optional)"
                />
            </div>
        </div>
    );
}

export default function JsonBuilder({value, onChange, showSystemFields = true}) {
    let schema = {...value};
    if (showSystemFields) {
        SYSTEM_FIELDS.forEach(sys => {
            if (!schema[sys.key]) {
                schema[sys.key] = {
                    type: sys.type,
                    required: sys.required,
                    validations: sys.validations || {},
                    description: sys.description || "",
                };
            }
        });
    }
    const customFields = Object.entries(schema)
        .filter(([k]) => !SYSTEM_FIELDS.some(sys => sys.key === k))
        .map(([k, v]) => {
            if (!v || typeof v !== 'object') v = getDefaultField();
            if (!v.id) v.id = generateId();
            if (!v.propertyKey) v.propertyKey = k;
            return {id: v.id, propertyKey: v.propertyKey, field: v, origKey: k};
        });
    const customFieldKeys = customFields.map(f => f.propertyKey);

    const handleFieldChange = (id, updatedField) => {
        let newSchema = {...schema};
        let oldKey = null;
        Object.entries(schema).forEach(([k, v]) => {
            if (v.id === id) oldKey = k;
        });
        if (!oldKey) return;
        const newKey = updatedField.propertyKey;
        if (newKey && newKey !== oldKey && !Object.keys(schema).includes(newKey)) {
            delete newSchema[oldKey];
            newSchema[newKey] = {...updatedField};
        } else {
            newSchema[oldKey] = {...updatedField};
        }
        onChange(newSchema);
    };

    const handleFieldRemove = id => {
        let newSchema = {...schema};
        Object.entries(schema).forEach(([k, v]) => {
            if (v.id === id) delete newSchema[k];
        });
        onChange(newSchema);
    };

    const handleAddField = () => {
        const id = generateId();
        onChange({...schema, [id]: {...getDefaultField(), id, propertyKey: ""}});
    };

    useEffect(() => {
        if (!showSystemFields) return; // <-- prevent injecting in nested JsonBuilder
        const fullSchema = {...value};
        let changed = false;
        SYSTEM_FIELDS.forEach(sys => {
            if (!fullSchema[sys.key]) {
                fullSchema[sys.key] = {
                    type: sys.type,
                    required: sys.required,
                    validations: sys.validations || {},
                    description: sys.description || "",
                };
                changed = true;
            }
        });
        if (changed) onChange(fullSchema);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <div className="bg-gray-800 p-8 rounded">
            {showSystemFields && (
                <div className="mb-6">
                    <div className="font-semibold text-white text-xl mb-4">System Fields</div>
                    {SYSTEM_FIELDS.map(sys => (
                        <EditableField
                            key={sys.key}
                            fieldId={sys.key}
                            fieldKey={sys.key}
                            field={schema[sys.key]}
                            onChange={handleFieldChange}
                            isSystem={true}
                            systemMeta={sys}
                        />
                    ))}
                </div>
            )}
            <div className="mb-4 flex items-center justify-between">
                <div className="font-semibold text-white text-xl">Custom Fields</div>
                <button className="bg-blue-700 text-white rounded px-4 py-2 text-base h-10" onClick={handleAddField}>+
                    Add field
                </button>
            </div>
            {customFields.length === 0 && <div className="text-gray-400 text-base ml-4">No custom fields yet.</div>}
            {customFields.map(({id, propertyKey, field}) => (
                <EditableField
                    key={id}
                    fieldId={id}
                    fieldKey={propertyKey}
                    field={field}
                    onChange={handleFieldChange}
                    onRemove={() => handleFieldRemove(id)}
                    siblingKeys={customFieldKeys.filter(key => key !== propertyKey)}
                />
            ))}
        </div>
    );
}
