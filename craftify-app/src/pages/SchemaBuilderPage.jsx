// pages/SchemaBuilderPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Use or check example here: https://bjdash.github.io/JSON-Schema-Builder/
export const SchemaBuilderPage = () => {
    const navigate = useNavigate();
    const [schema, setSchema] = useState({
        title: '',
        type: 'object',
        properties: {},
        required: [],
    });

    const [newProperty, setNewProperty] = useState({ name: '', type: 'string', required: false });

    // Handle adding a new property
    const handleAddProperty = () => {
        if (!newProperty.name) return;
        const updatedSchema = { ...schema };
        updatedSchema.properties[newProperty.name] = { type: newProperty.type };
        if (newProperty.required) {
            updatedSchema.required.push(newProperty.name);
        }
        setSchema(updatedSchema);
        setNewProperty({ name: '', type: 'string', required: false });
    };

    // Handle property removal
    const handleRemoveProperty = (propertyName) => {
        const updatedSchema = { ...schema };
        delete updatedSchema.properties[propertyName];
        updatedSchema.required = updatedSchema.required.filter((name) => name !== propertyName);
        setSchema(updatedSchema);
    };

    // Handle changing schema title
    const handleChangeTitle = (e) => {
        setSchema({ ...schema, title: e.target.value });
    };

    // Handle exporting schema as JSON
    const handleExportSchema = () => {
        const schemaStr = JSON.stringify(schema, null, 2);
        const blob = new Blob([schemaStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'schema.json';
        link.click();
    };

    return (
        <div className="relative w-full p-6 bg-gray-800 text-white rounded-lg shadow-md mt-8">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-0 right-0 mt-4 mr-4 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                style={{
                    background: 'var(--mandarine-orange-gradient)',
                    fontFamily: 'var(--font-primary)',
                }}
            >
                Close
            </button>
            <h1 className="text-white text-lg font-bold">Schema Builder</h1>
            <div className="mt-4 space-y-4">
                <div>
                    <label className="block text-gray-300">Schema Title:</label>
                    <input
                        type="text"
                        value={schema.title}
                        onChange={handleChangeTitle}
                        className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                </div>
                <div className="bg-gray-700 p-4 rounded space-y-2">
                    <h2 className="text-white font-semibold">Properties</h2>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Property Name"
                            value={newProperty.name}
                            onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                            className="p-2 bg-gray-800 text-white rounded"
                        />
                        <select
                            value={newProperty.type}
                            onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value })}
                            className="p-2 bg-gray-800 text-white rounded"
                        >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object</option>
                        </select>
                        <label className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                checked={newProperty.required}
                                onChange={(e) => setNewProperty({ ...newProperty, required: e.target.checked })}
                                className="mr-2"
                            />
                            Required
                        </label>
                        <button
                            onClick={handleAddProperty}
                            className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-700"
                        >
                            Add Property
                        </button>
                    </div>
                    <ul className="mt-4 space-y-2">
                        {Object.keys(schema.properties).map((propertyName) => (
                            <li
                                key={propertyName}
                                className="flex justify-between items-center bg-gray-800 p-2 rounded"
                            >
                                <span>
                                    {propertyName} ({schema.properties[propertyName].type})
                                </span>
                                <button
                                    onClick={() => handleRemoveProperty(propertyName)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={handleExportSchema}
                        className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
                    >
                        Export Schema
                    </button>
                </div>
            </div>
        </div>
    );
};
