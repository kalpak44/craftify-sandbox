import React, { useState, useEffect } from "react";
import { getProductsPageable } from "../../services/API";

const IngredientCreator = ({ addIngredient, accessToken }) => {
    const [name, setName] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const addRow = (setter) => () => setter((prev) => [...prev, { key: "", value: "" }]);
    const removeRow = (setter, index) => () => setter((prev) => prev.filter((_, i) => i !== index));
    const updateRow = (setter, index, field, value) => {
        setter((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleValidation = async () => {
        try {
            setLoading(true);
            const categoryNames = categories.map(c => c.value).filter(c => c); // Extract non-empty category names
            const response = await getProductsPageable(accessToken, { name, categories: categoryNames, page: currentPage, size: 10 });
            setSearchResults(response.content || []);
            setTotalPages(response.totalPages || 1);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddIngredient = () => {
        addIngredient({ name, attributes, measurements, tags, categories });
        resetFields();
    };

    const resetFields = () => {
        setName("");
        setAttributes([]);
        setMeasurements([]);
        setTags([]);
        setCategories([]);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSearchResults([]);
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            handleValidation();
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            handleValidation();
        }
    };

    useEffect(() => {
        if (showModal) {
            handleValidation();
        }
    }, [currentPage]);

    return (
        <div className="p-4 border rounded-lg shadow-md bg-gray-800">
            <h2 className="text-xl font-bold mb-4 text-white">Products Search</h2>
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
                <button onClick={addRow(setAttributes)} className="p-2 bg-blue-500 text-white rounded">
                    Add Attribute
                </button>
            </div>
            <div className="mb-4">
                <h3 className="font-medium text-white">Measurements</h3>
                {measurements.map((measurement, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            placeholder="Type (e.g., volume)"
                            value={measurement.key}
                            onChange={(e) => updateRow(setMeasurements, index, "key", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={measurement.amount}
                            onChange={(e) => updateRow(setMeasurements, index, "amount", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <input
                            type="text"
                            placeholder="Unit (e.g., ml)"
                            value={measurement.unit}
                            onChange={(e) => updateRow(setMeasurements, index, "unit", e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <button onClick={removeRow(setMeasurements, index)} className="p-2 bg-red-500 text-white rounded">
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={addRow(setMeasurements)} className="p-2 bg-blue-500 text-white rounded">
                    Add Measurement
                </button>
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
                <button onClick={addRow(setTags)} className="p-2 bg-blue-500 text-white rounded">
                    Add Tag
                </button>
            </div>
            <div className="mb-4">
                <h3 className="font-medium text-white">Categories</h3>
                {categories.map((category, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <input
                            type="text"
                            placeholder="Category"
                            value={category.value}
                            onChange={(e) => {
                                const newCategories = [...categories];
                                newCategories[index].value = e.target.value;
                                setCategories(newCategories);
                            }}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                        <button onClick={removeRow(setCategories, index)} className="p-2 bg-red-500 text-white rounded">
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={() => setCategories([...categories, { value: "" }])} className="p-2 bg-blue-500 text-white rounded">
                    Add Category
                </button>
            </div>
            <div className="flex justify-between">
                <button onClick={handleValidation} className="p-2 bg-green-500 text-white rounded">
                    Search
                </button>
                <button onClick={handleAddIngredient} className="p-2 bg-blue-500 text-white rounded">
                    Add Ingredient
                </button>
            </div>
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-white">Search Results</h2>
                        {loading ? (
                            <p className="text-white">Loading...</p>
                        ) : searchResults.length > 0 ? (
                            <>
                                <table className="min-w-full bg-gray-800 text-white">
                                    <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b border-gray-700">Name</th>
                                        <th className="py-2 px-4 border-b border-gray-700">Attributes</th>
                                        <th className="py-2 px-4 border-b border-gray-700">Measurements</th>
                                        <th className="py-2 px-4 border-b border-gray-700">Categories</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {searchResults.map((product) => (
                                        <tr key={product.id}>
                                            <td className="py-2 px-4 border-b border-gray-700">{product.name}</td>
                                            <td className="py-2 px-4 border-b border-gray-700">{JSON.stringify(product.attributes)}</td>
                                            <td className="py-2 px-4 border-b border-gray-700">{JSON.stringify(product.measurements)}</td>
                                            <td className="py-2 px-4 border-b border-gray-700">{product.categories.join(', ')}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div className="flex justify-between items-center py-4">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 0}
                                        className="py-2 px-4 bg-blue-500 text-white rounded disabled:bg-gray-600"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-white">Page {currentPage + 1} of {totalPages}</span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages - 1}
                                        className="py-2 px-4 bg-blue-500 text-white rounded disabled:bg-gray-600"
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-white">No results found.</p>
                        )}
                        <div className="flex justify-end mt-4">
                            <button onClick={handleModalClose} className="ml-2 p-2 bg-red-500 text-white rounded">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IngredientCreator;
