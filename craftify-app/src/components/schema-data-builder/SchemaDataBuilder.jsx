import React, { useState, useEffect, useRef, useCallback } from 'react';

const SchemaDataBuilder = ({ schema, value, onChange, onValidationChange, onValidateAll }) => {
    const [validationErrors, setValidationErrors] = useState({});
    const [expandedFields, setExpandedFields] = useState({});
    const [schemaFields, setSchemaFields] = useState([]);
    const validationFunctionRef = useRef(null);

    useEffect(() => {
        if (schema) {
            // Convert schema object to fields array
            const fields = convertSchemaToFields(schema);
            setSchemaFields(fields);
            
            // Initialize expanded fields recursively
            const initialExpanded = {};
            const expandFieldsRecursively = (fieldList, parentPath = '') => {
                fieldList.forEach(field => {
                    const fullFieldName = parentPath ? `${parentPath}.${field.name}` : field.name;
                    // Expand all fields by default
                    initialExpanded[fullFieldName] = true;
                    console.log(`Expanding field: ${fullFieldName}`);
                    
                    // Also expand nested fields recursively
                    if (field.type === 'object' && field.fields) {
                        expandFieldsRecursively(field.fields, fullFieldName);
                    }
                });
            };
            
            expandFieldsRecursively(fields);
            console.log('All expanded fields:', initialExpanded);
            setExpandedFields(initialExpanded);
        }
    }, [schema]);

    // Separate useEffect to handle initial value setting
    useEffect(() => {
        if (schemaFields.length > 0) {
            console.log('Setting initial values for fields:', schemaFields);
            const initialValue = {};
            schemaFields.forEach(field => {
                if (value[field.name] === undefined) {
                    initialValue[field.name] = getDefaultValue(field);
                } else {
                    initialValue[field.name] = value[field.name];
                }
            });
            console.log('Initial value object:', initialValue);
            onChange(initialValue);
        }
    }, [schemaFields, onChange]);

    // Separate useEffect to handle validation state changes
    useEffect(() => {
        if (onValidationChange) {
            const hasErrors = Object.values(validationErrors).some(errors => errors && errors.length > 0);
            onValidationChange(hasErrors);
        }
    }, [validationErrors, onValidationChange]);

    const validateAllFields = useCallback(() => {
        const allErrors = {};
        let hasAnyErrors = false;

        const validateFieldRecursively = (fields, parentPath = '') => {
            fields.forEach(field => {
                const fullFieldName = parentPath ? `${parentPath}.${field.name}` : field.name;
                const fieldValue = getNestedValue(value, fullFieldName);
                const errors = validateField(field, fieldValue);
                
                if (errors.length > 0) {
                    allErrors[fullFieldName] = errors;
                    hasAnyErrors = true;
                }
                
                // Validate nested object fields
                if (field.type === 'object' && field.fields) {
                    validateFieldRecursively(field.fields, fullFieldName);
                }
            });
        };

        validateFieldRecursively(schemaFields);
        
        // Update validation errors state
        setValidationErrors(allErrors);
        
        return {
            isValid: !hasAnyErrors,
            errors: allErrors
        };
    }, [schemaFields, value]);

    // Store the validation function in ref and notify parent
    useEffect(() => {
        console.log("SchemaDataBuilder: Setting validation function");
        console.log("validateAllFields:", validateAllFields);
        console.log("onValidateAll:", onValidateAll);
        
        validationFunctionRef.current = validateAllFields;
        if (onValidateAll) {
            console.log("Calling onValidateAll with function");
            onValidateAll(validateAllFields);
        }
    }, [validateAllFields, onValidateAll]);

    const convertSchemaToFields = (schemaObj) => {
        const fields = [];
        
        Object.keys(schemaObj).forEach(key => {
            const fieldDef = schemaObj[key];
            if (fieldDef && typeof fieldDef === 'object' && fieldDef.type) {
                const field = {
                    name: key,
                    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
                    type: fieldDef.type,
                    required: fieldDef.required || false,
                    description: fieldDef.description || "",
                    ...fieldDef.validations
                };
                
                // Handle nested object fields
                if (fieldDef.type === 'object' && fieldDef.fields) {
                    field.fields = convertSchemaToFields(fieldDef.fields);
                }
                
                fields.push(field);
            }
        });
        
        return fields;
    };

    const getDefaultValue = (field) => {
        switch (field.type) {
            case 'number': return '';
            case 'boolean': return false;
            case 'date': return new Date().toISOString().split('T')[0]; // Today's date
            case 'array': return [];
            case 'object': return {};
            default: return '';
        }
    };

    const validateField = (field, value) => {
        const errors = [];
        
        // Required validation
        if (field.required && (value === undefined || value === null || value === '')) {
            errors.push("This field is required");
        }
        
        // Type validation
        if (value !== undefined && value !== null && value !== '') {
            if (field.type === "number" && isNaN(Number(value))) {
                errors.push("Must be a valid number");
            }
            if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push("Must be a valid email address");
            }
            if (field.type === "url" && !/^https?:\/\/.+/.test(value)) {
                errors.push("Must be a valid URL");
            }
            if (field.type === "date" && isNaN(Date.parse(value))) {
                errors.push("Must be a valid date");
            }
        }
        
        // Min/Max length validation
        if (field.minLength && value && value.length < field.minLength) {
            errors.push(`Minimum length is ${field.minLength} characters`);
        }
        if (field.maxLength && value && value.length > field.maxLength) {
            errors.push(`Maximum length is ${field.maxLength} characters`);
        }
        
        // Min/Max value validation for numbers
        if (field.min !== undefined && value && Number(value) < field.min) {
            errors.push(`Minimum value is ${field.min}`);
        }
        if (field.max !== undefined && value && Number(value) > field.max) {
            errors.push(`Maximum value is ${field.max}`);
        }
        
        // Pattern validation
        if (field.regex && value && !new RegExp(field.regex).test(value)) {
            errors.push(field.patternMessage || "Invalid format");
        }
        
        return errors;
    };

    const handleFieldChange = (fieldName, newValue, parentPath = '') => {
        const fullFieldName = parentPath ? `${parentPath}.${fieldName}` : fieldName;
        const newData = { ...value };
        
        // Handle nested object updates
        if (parentPath) {
            const pathParts = parentPath.split('.');
            let current = newData;
            for (let i = 0; i < pathParts.length; i++) {
                if (i === pathParts.length - 1) {
                    current[pathParts[i]] = { ...current[pathParts[i]], [fieldName]: newValue };
                } else {
                    current[pathParts[i]] = { ...current[pathParts[i]] };
                    current = current[pathParts[i]];
                }
            }
        } else {
            newData[fieldName] = newValue;
        }
        
        onChange(newData);
        
        // Validate the field
        const field = findFieldByName(fieldName, parentPath);
        if (field) {
            const errors = validateField(field, newValue);
            setValidationErrors(prev => ({
                ...prev,
                [fullFieldName]: errors
            }));
        }
    };

    const findFieldByName = (fieldName, parentPath = '') => {
        if (!parentPath) {
            return schemaFields.find(f => f.name === fieldName);
        }
        
        // Navigate to the nested field
        const pathParts = parentPath.split('.');
        let currentFields = schemaFields;
        
        for (const part of pathParts) {
            const parentField = currentFields.find(f => f.name === part);
            if (parentField && parentField.fields) {
                currentFields = parentField.fields;
            } else {
                return null;
            }
        }
        
        return currentFields.find(f => f.name === fieldName);
    };

    const toggleFieldExpansion = (fieldName) => {
        setExpandedFields(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const renderField = (field, level = 0, parentPath = '') => {
        const fullFieldName = parentPath ? `${parentPath}.${field.name}` : field.name;
        const fieldValue = getNestedValue(value, fullFieldName);
        const errors = validationErrors[fullFieldName] || [];
        const isExpanded = expandedFields[fullFieldName];
        
        // Debug logging
        console.log(`Rendering field: ${fullFieldName}, isExpanded: ${isExpanded}, expandedFields:`, expandedFields);
        
        return (
            <div key={fullFieldName} className="mb-4" style={{ marginLeft: `${level * 20}px` }}>
                <div className="flex items-center mb-2">
                    <button
                        type="button"
                        onClick={() => toggleFieldExpansion(fullFieldName)}
                        className="mr-2 text-gray-400 hover:text-white"
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                    <label className="text-sm font-medium text-gray-300 flex items-center">
                        {field.label || field.name}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                </div>
                
                {isExpanded && (
                    <div className="ml-6">
                        {field.type === 'textarea' ? (
                            <textarea
                                className={`w-full p-2 border rounded bg-gray-700 text-gray-200 focus:border-blue-500 outline-none ${
                                    errors.length > 0 ? "border-red-500" : "border-gray-600"
                                }`}
                                value={fieldValue || ""}
                                onChange={e => handleFieldChange(field.name, e.target.value, parentPath)}
                                rows={field.rows || 4}
                                placeholder={field.placeholder || `Enter ${field.label || field.name}`}
                            />
                        ) : field.type === 'select' ? (
                            <select
                                className={`w-full p-2 border rounded bg-gray-700 text-gray-200 focus:border-blue-500 outline-none ${
                                    errors.length > 0 ? "border-red-500" : "border-gray-600"
                                }`}
                                value={fieldValue || ""}
                                onChange={e => handleFieldChange(field.name, e.target.value, parentPath)}
                            >
                                <option value="">Select {field.label || field.name}</option>
                                {field.options?.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : field.type === 'boolean' ? (
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={fieldValue || false}
                                onChange={e => handleFieldChange(field.name, e.target.checked, parentPath)}
                            />
                        ) : field.type === 'number' ? (
                            <input
                                type="number"
                                className={`w-full p-2 border rounded bg-gray-700 text-gray-200 focus:border-blue-500 outline-none ${
                                    errors.length > 0 ? "border-red-500" : "border-gray-600"
                                }`}
                                value={fieldValue || ""}
                                onChange={e => handleFieldChange(field.name, e.target.value, parentPath)}
                                placeholder={field.placeholder || `Enter ${field.label || field.name}`}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                            />
                        ) : field.type === 'date' ? (
                            <input
                                type="date"
                                className={`w-full p-2 border rounded bg-gray-700 text-gray-200 focus:border-blue-500 outline-none ${
                                    errors.length > 0 ? "border-red-500" : "border-gray-600"
                                }`}
                                value={fieldValue || ""}
                                onChange={e => handleFieldChange(field.name, e.target.value, parentPath)}
                                placeholder={field.placeholder || `Enter ${field.label || field.name}`}
                            />
                        ) : field.type === 'email' ? (
                            <input
                                type="email"
                                className={`w-full p-2 border rounded bg-gray-700 text-gray-200 focus:border-blue-500 outline-none ${
                                    errors.length > 0 ? "border-red-500" : "border-gray-600"
                                }`}
                                value={fieldValue || ""}
                                onChange={e => handleFieldChange(field.name, e.target.value, parentPath)}
                                placeholder={field.placeholder || `Enter ${field.label || field.name}`}
                            />
                        ) : field.type === 'url' ? (
                            <input
                                type="url"
                                className={`w-full p-2 border rounded bg-gray-700 text-gray-200 focus:border-blue-500 outline-none ${
                                    errors.length > 0 ? "border-red-500" : "border-gray-600"
                                }`}
                                value={fieldValue || ""}
                                onChange={e => handleFieldChange(field.name, e.target.value, parentPath)}
                                placeholder={field.placeholder || `Enter ${field.label || field.name}`}
                            />
                        ) : field.type === 'object' ? (
                            <div className="border border-gray-600 rounded p-3 bg-gray-800">
                                <div className="text-sm text-gray-400 mb-2">Object: {field.label || field.name}</div>
                                {field.fields && field.fields.map(subField => 
                                    renderField(subField, level + 1, fullFieldName)
                                )}
                            </div>
                        ) : (
                            <input
                                type="text"
                                className={`w-full p-2 border rounded bg-gray-700 text-gray-200 focus:border-blue-500 outline-none ${
                                    errors.length > 0 ? "border-red-500" : "border-gray-600"
                                }`}
                                value={fieldValue || ""}
                                onChange={e => handleFieldChange(field.name, e.target.value, parentPath)}
                                placeholder={field.placeholder || `Enter ${field.label || field.name}`}
                            />
                        )}
                        
                        {errors.length > 0 && (
                            <div className="text-red-400 text-sm mt-1">
                                {errors.map((error, index) => (
                                    <div key={index}>{error}</div>
                                ))}
                            </div>
                        )}
                        
                        {field.description && (
                            <div className="text-gray-400 text-sm mt-1">{field.description}</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const getNestedValue = (obj, path) => {
        const pathParts = path.split('.');
        let current = obj;
        
        for (const part of pathParts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return undefined;
            }
        }
        
        return current;
    };

    if (!schema || schemaFields.length === 0) {
        return <div className="text-gray-400">No schema fields defined.</div>;
    }

    return (
        <div className="schema-data-builder">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Data Builder</h3>
                <p className="text-gray-400 text-sm">Build data records based on your schema definition.</p>
            </div>
            
            <div className="space-y-2">
                {schemaFields.map(field => renderField(field))}
            </div>
        </div>
    );
};

export default SchemaDataBuilder; 