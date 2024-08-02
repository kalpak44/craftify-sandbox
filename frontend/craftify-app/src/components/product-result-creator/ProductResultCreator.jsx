import React, { useState, useEffect } from "react";

const ProductResultCreator = ({ addProductResult, onClose, productResult }) => {
    const [name, setName] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [tags, setTags] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (productResult) {
            setName(productResult.name || "");
            setAttributes(Object.entries(productResult.attributes || {}).map(([key, value]) => ({ key, value })));
            setMeasurements(Object.entries(productResult.measurements || {}).map(([key, value]) => ({ key, value })));
            setTags(Object.entries(productResult.tags || {}).map(([key, value]) => ({ key, value })));
            setAvailability(Object.entries(productResult.availability || {}).map(([key, value]) => ({ key, value })));
            setCategories(productResult.categories || []);
        }
    }, [productResult]);

    const addRow = (setter) => () => setter((prev) => [...prev, { key: "", value: "" }]);
    const removeRow = (setter, index) => () => setter((prev) => prev.filter((_, i) => i !== index));
    const updateRow = (setter, index, field, value) => {
        setter((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleSave = () => {
        const product = {
            name,
            attributes: Object.fromEntries(attributes.map(({ key, value }) => [key, value])),
            measurements: Object.fromEntries(measurements.map(({ key, value }) => [key, value])),
            tags: Object.fromEntries(tags.map(({ key, value }) => [key, value])),
            availability: Object.fromEntries(availability.map(({ key, value }) => [key, value])),
            categories
        };
        addProductResult(product);
    };

    return (
        <div className="p-4 border rounded-lg shadow-md bg-gray-800">
            <div className="mb-4">
                <label className="block font-medium text-white">Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                />
            </div>
            <div className="mb-4">
                <h3 className="font-medium text-white">Attributes</h3>
                {attributes.map((attr, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            placeholder="Key"
                            value={attr.key}
                            onChange={(e) => updateRow(setAttributes, index, "key", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={attr.value}
                            onChange={(e) => updateRow(setAttributes, index, "value", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <button onClick={removeRow(setAttributes, index)} className="p-2 bg-red-500 text-white rounded">
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={addRow(setAttributes)} className="p-2 bg-blue-500 text-white rounded">Add Attribute</button>
            </div>
            <div className="mb-4">
                <h3 className="font-medium text-white">Measurements</h3>
                {measurements.map((measurement, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            placeholder="Type (e.g., weight)"
                            value={measurement.key}
                            onChange={(e) => updateRow(setMeasurements, index, "key", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={measurement.value}
                            onChange={(e) => updateRow(setMeasurements, index, "value", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <button onClick={removeRow(setMeasurements, index)} className="p-2 bg-red-500 text-white rounded">
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={addRow(setMeasurements)} className="p-2 bg-blue-500 text-white rounded">Add Measurement</button>
            </div>
            <div className="mb-4">
                <h3 className="font-medium text-white">Tags</h3>
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            placeholder="Tag Key"
                            value={tag.key}
                            onChange={(e) => updateRow(setTags, index, "key", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Tag Value"
                            value={tag.value}
                            onChange={(e) => updateRow(setTags, index, "value", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <button onClick={removeRow(setTags, index)} className="p-2 bg-red-500 text-white rounded">
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={addRow(setTags)} className="p-2 bg-blue-500 text-white rounded">Add Tag</button>
            </div>
            <div className="mb-4">
                <h3 className="font-medium text-white">Availability</h3>
                {availability.map((avail, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            placeholder="Type (e.g., weight)"
                            value={avail.key}
                            onChange={(e) => updateRow(setAvailability, index, "key", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={avail.value}
                            onChange={(e) => updateRow(setAvailability, index, "value", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <button onClick={removeRow(setAvailability, index)} className="p-2 bg-red-500 text-white rounded">
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={addRow(setAvailability)} className="p-2 bg-blue-500 text-white rounded">Add Availability</button>
            </div>
            <div className="mb-4">
                <h3 className="font-medium text-white">Categories</h3>
                {categories.map((category, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            placeholder="Category"
                            value={category}
                            onChange={(e) => {
                                const newCategories = [...categories];
                                newCategories[index] = e.target.value;
                                setCategories(newCategories);
                            }}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <button onClick={removeRow(setCategories, index)} className="p-2 bg-red-500 text-white rounded">
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={() => setCategories([...categories, ""])} className="p-2 bg-blue-500 text-white rounded">Add Category</button>
            </div>
            <button onClick={handleSave} className="mt-4 p-2 bg-green-500 text-white rounded">Save Product Result</button>
        </div>
    );
};

export default ProductResultCreator;
