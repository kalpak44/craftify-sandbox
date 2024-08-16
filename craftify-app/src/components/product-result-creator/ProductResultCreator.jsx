import React, {useEffect, useState} from "react";
import {getProductsPageable} from "../../services/API.js";
import {Modal} from "../modal/Modal.jsx";

const ProductResultCreator = ({addProductResult, onClose, productResult, accessToken}) => {
    const [mode, setMode] = useState("CREATE_NEW");
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [attributes, setAttributes] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [tags, setTags] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [categories, setCategories] = useState([]);
    const [nameMergeStrategy, setNameMergeStrategy] = useState("KEEP_ORIGINAL");
    const [attributeMergeStrategy, setAttributeMergeStrategy] = useState("KEEP_ORIGINAL");
    const [tagMergeStrategy, setTagMergeStrategy] = useState("KEEP_ORIGINAL");
    const [measurementMergeStrategy, setMeasurementMergeStrategy] = useState("KEEP_ORIGINAL");
    const [availabilityMergeStrategy, setAvailabilityMergeStrategy] = useState("KEEP_ORIGINAL");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [modalContent, setModalContent] = useState({title: "", message: "", onConfirm: null});
    const [searchResults, setSearchResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");

    useEffect(() => {
        if (productResult) {
            setMode(productResult.mode || "CREATE_NEW");
            setId(productResult.id || "");
            setName(productResult.name || "");
            setAttributes(Object.entries(productResult.attributes || {}).map(([key, value]) => ({key, value})));
            setMeasurements(Object.entries(productResult.measurements || {}).map(([key, {value, unit}]) => ({
                key,
                value,
                unit,
            })));
            setTags(Object.entries(productResult.tags || {}).map(([key, value]) => ({key, value})));
            setAvailability(Object.entries(productResult.availability || {}).map(([key, {value, unit}]) => ({
                key,
                value,
                unit,
            })));
            setCategories(productResult.categories || []);
            setNameMergeStrategy(productResult.nameMergeStrategy?.strategy || "KEEP_ORIGINAL");
            setAttributeMergeStrategy(productResult.attributeMergeStrategy?.strategy || "KEEP_ORIGINAL");
            setTagMergeStrategy(productResult.tagMergeStrategy?.strategy || "KEEP_ORIGINAL");
            setMeasurementMergeStrategy(productResult.measurementMergeStrategy?.strategy || "KEEP_ORIGINAL");
            setAvailabilityMergeStrategy(productResult.availabilityMergeStrategy?.strategy || "KEEP_ORIGINAL");
        }
    }, [productResult]);

    const addRow = (setter) => () => setter((prev) => [...prev, {key: "", value: "", unit: ""}]);
    const removeRow = (setter, index) => () => setter((prev) => prev.filter((_, i) => i !== index));
    const updateRow = (setter, index, field, value) => {
        setter((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleSave = () => {
        if (mode === "REPLACE_EXISTING" && !id.trim()) {
            setModalContent({
                title: "Error",
                message: "ID is required when replacing an existing product.",
                onConfirm: () => setModalContent(null),
            });
            setShowSearchModal(false);
            return;
        }

        if ((mode === "CREATE_NEW" || nameMergeStrategy === "OVERRIDE") && !name.trim()) {
            setModalContent({
                title: "Error",
                message: "Product name is required.",
                onConfirm: () => setModalContent(null),
            });
            setShowSearchModal(false);
            return;
        }

        const product = {
            mode,
            id: mode === "REPLACE_EXISTING" ? id : undefined,
            name: name,
            attributes: Object.fromEntries(attributes.map(({key, value}) => [key, value])),
            measurements: Object.fromEntries(
                measurements.map(({key, value, unit}) => [key, {value, unit}])
            ),
            tags: Object.fromEntries(tags.map(({key, value}) => [key, value])),
            availability: Object.fromEntries(
                availability.map(({key, value, unit}) => [key, {value, unit}])
            ),
            categories,
            nameMergeStrategy: {strategy: nameMergeStrategy},
            attributeMergeStrategy: {strategy: attributeMergeStrategy},
            tagMergeStrategy: {strategy: tagMergeStrategy},
            measurementMergeStrategy: {strategy: measurementMergeStrategy},
            availabilityMergeStrategy: {strategy: availabilityMergeStrategy},
        };
        addProductResult(product);
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await getProductsPageable(accessToken, {
                id: "",
                name,
                page: currentPage,
                size: 10,
            });
            setSearchResults(response.content || []);
            setTotalPages(response.totalPages || 1);
            setShowSearchModal(true);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelection = () => {
        if (selectedProductId) {
            const selectedProduct = searchResults.find(product => product.id === selectedProductId);
            setId(selectedProductId);
            setName(selectedProduct.name);
            setAttributes(Object.entries(selectedProduct.attributes || {}).map(([key, value]) => ({key, value})));
            setMeasurements(Object.entries(selectedProduct.measurements || {}).map(([key, {value, unit}]) => ({
                key,
                value,
                unit,
            })));
            setTags(Object.entries(selectedProduct.tags || {}).map(([key, value]) => ({key, value})));
            setAvailability(Object.entries(selectedProduct.availability || {}).map(([key, {value, unit}]) => ({
                key,
                value,
                unit,
            })));
            setCategories(selectedProduct.categories || []);
            setShowSearchModal(false);
        } else {
            setModalContent({
                title: "Error",
                message: "Please select a product before confirming.",
                onConfirm: () => setModalContent(null),
            });
        }
    };

    return (
        <>
            <div className="p-4 border rounded-lg shadow-md bg-gray-800 mb-5">
                <div className="mb-4">
                    <label className="block font-medium text-white">Mode:</label>
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full p-2 border rounded bg-gray-700 text-white"
                    >
                        <option value="CREATE_NEW">Create New</option>
                        <option value="REPLACE_EXISTING">Replace Existing</option>
                        <option value="MERGE">Merge</option>
                    </select>
                </div>
            </div>
            <div className="p-4 border rounded-lg shadow-md bg-gray-800">
                {mode === "MERGE" && (
                    <>
                        <div className="mb-4">
                            <label className="block font-medium text-white">Merge Name Strategy:</label>
                            <select
                                value={nameMergeStrategy}
                                onChange={(e) => setNameMergeStrategy(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white"
                            >
                                <option value="KEEP_ORIGINAL">Keep Original</option>
                                <option value="OVERRIDE">Override</option>
                            </select>
                        </div>
                        {["OVERRIDE"].includes(nameMergeStrategy) && (
                            <div className="mb-4">
                                <label className="block font-medium text-white">Name:</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 border rounded bg-gray-700 text-white"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block font-medium text-white">Merge Attributes Strategy:</label>
                            <select
                                value={attributeMergeStrategy}
                                onChange={(e) => setAttributeMergeStrategy(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white"
                            >
                                <option value="KEEP_ORIGINAL">Keep Original</option>
                                <option value="OVERRIDE">Override</option>
                                <option value="APPEND_MISSING">Append Missing</option>
                            </select>
                        </div>
                        {["OVERRIDE", "APPEND_MISSING"].includes(attributeMergeStrategy) && (
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
                                        <button
                                            onClick={removeRow(setAttributes, index)}
                                            className="p-2 bg-red-500 text-white rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addRow(setAttributes)}
                                    className="p-2 bg-blue-500 text-white rounded"
                                >
                                    Add Attribute
                                </button>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block font-medium text-white">Merge Tags Strategy:</label>
                            <select
                                value={tagMergeStrategy}
                                onChange={(e) => setTagMergeStrategy(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white"
                            >
                                <option value="KEEP_ORIGINAL">Keep Original</option>
                                <option value="OVERRIDE">Override</option>
                                <option value="APPEND_MISSING">Append Missing</option>
                            </select>
                        </div>
                        {["OVERRIDE", "APPEND_MISSING"].includes(tagMergeStrategy) && (
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
                                        <button
                                            onClick={removeRow(setTags, index)}
                                            className="p-2 bg-red-500 text-white rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addRow(setTags)}
                                    className="p-2 bg-blue-500 text-white rounded"
                                >
                                    Add Tag
                                </button>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block font-medium text-white">Merge Measurements Strategy:</label>
                            <select
                                value={measurementMergeStrategy}
                                onChange={(e) => setMeasurementMergeStrategy(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white"
                            >
                                <option value="KEEP_ORIGINAL">Keep Original</option>
                                <option value="OVERRIDE">Override</option>
                                <option value="APPEND_MISSING">Append Missing</option>
                                <option value="SUM">Sum</option>
                            </select>
                        </div>
                        {["OVERRIDE", "APPEND_MISSING", "SUM"].includes(measurementMergeStrategy) && (
                            <div className="mb-4">
                                <h3 className="font-medium text-white">Measurements</h3>
                                {measurements.map((measurement, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            placeholder="Measurement Key"
                                            value={measurement.key}
                                            onChange={(e) => updateRow(setMeasurements, index, "key", e.target.value)}
                                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Value"
                                            value={measurement.value}
                                            onChange={(e) =>
                                                updateRow(setMeasurements, index, "value", e.target.value)
                                            }
                                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unit"
                                            value={measurement.unit}
                                            onChange={(e) =>
                                                updateRow(setMeasurements, index, "unit", e.target.value)
                                            }
                                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                        />

                                        <button
                                            onClick={removeRow(setMeasurements, index)}
                                            className="p-2 bg-red-500 text-white rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addRow(setMeasurements)}
                                    className="p-2 bg-blue-500 text-white rounded"
                                >
                                    Add Measurement
                                </button>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block font-medium text-white">Merge Availability Strategy:</label>
                            <select
                                value={availabilityMergeStrategy}
                                onChange={(e) => setAvailabilityMergeStrategy(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white"
                            >
                                <option value="KEEP_ORIGINAL">Keep Original</option>
                                <option value="OVERRIDE">Override</option>
                                <option value="APPEND_MISSING">Append Missing</option>
                                <option value="SUM">Sum</option>
                            </select>
                        </div>
                        {["OVERRIDE", "APPEND_MISSING", "SUM"].includes(availabilityMergeStrategy) && (
                            <div className="mb-4">
                                <h3 className="font-medium text-white">Availability</h3>
                                {availability.map((avail, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            placeholder="Availability Key"
                                            value={avail.key}
                                            onChange={(e) => updateRow(setAvailability, index, "key", e.target.value)}
                                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                        />


                                        <input
                                            type="number"
                                            placeholder="Value"
                                            value={avail.value}
                                            onChange={(e) =>
                                                updateRow(setAvailability, index, "value", e.target.value)
                                            }
                                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unit"
                                            value={avail.unit}
                                            onChange={(e) =>
                                                updateRow(setAvailability, index, "unit", e.target.value)
                                            }
                                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                        />


                                        <button
                                            onClick={removeRow(setAvailability, index)}
                                            className="p-2 bg-red-500 text-white rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addRow(setAvailability)}
                                    className="p-2 bg-blue-500 text-white rounded"
                                >
                                    Add Availability
                                </button>
                            </div>
                        )}
                    </>
                )}
                {mode === "REPLACE_EXISTING" && (
                    <div className="mb-4">
                        <label className="block font-medium text-white">Product ID:</label>
                        <div className="flex">
                            <input
                                type="text"
                                value={id}
                                readOnly
                                className="flex-grow p-2 border rounded bg-gray-700 text-white mr-2"
                            />
                            <button
                                onClick={handleSearch}
                                className="p-2 bg-blue-500 text-white rounded"
                            >
                                Select Product
                            </button>
                        </div>
                    </div>
                )}

                {(mode === "CREATE_NEW" || (mode === "REPLACE_EXISTING" && id)) && (
                    <>
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
                                    <button
                                        onClick={removeRow(setAttributes, index)}
                                        className="p-2 bg-red-500 text-white rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addRow(setAttributes)}
                                className="p-2 bg-blue-500 text-white rounded"
                            >
                                Add Attribute
                            </button>
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
                                        type="number"
                                        placeholder="Value"
                                        value={measurement.value}
                                        onChange={(e) => updateRow(setMeasurements, index, "value", e.target.value)}
                                        className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Unit"
                                        value={measurement.unit}
                                        onChange={(e) => updateRow(setMeasurements, index, "unit", e.target.value)}
                                        className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                    />
                                    <button
                                        onClick={removeRow(setMeasurements, index)}
                                        className="p-2 bg-red-500 text-white rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addRow(setMeasurements)}
                                className="p-2 bg-blue-500 text-white rounded"
                            >
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
                                    <button
                                        onClick={removeRow(setTags, index)}
                                        className="p-2 bg-red-500 text-white rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addRow(setTags)}
                                className="p-2 bg-blue-500 text-white rounded"
                            >
                                Add Tag
                            </button>
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
                                        type="number"
                                        placeholder="Value"
                                        value={avail.value}
                                        onChange={(e) => updateRow(setAvailability, index, "value", e.target.value)}
                                        className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Unit"
                                        value={avail.unit}
                                        onChange={(e) => updateRow(setAvailability, index, "unit", e.target.value)}
                                        className="p-2 border rounded mr-2 bg-gray-700 text-white"
                                    />
                                    <button
                                        onClick={removeRow(setAvailability, index)}
                                        className="p-2 bg-red-500 text-white rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addRow(setAvailability)}
                                className="p-2 bg-blue-500 text-white rounded"
                            >
                                Add Availability
                            </button>
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
                                    <button
                                        onClick={removeRow(setCategories, index)}
                                        className="p-2 bg-red-500 text-white rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setCategories([...categories, ""])}
                                className="p-2 bg-blue-500 text-white rounded"
                            >
                                Add Category
                            </button>
                        </div>
                    </>
                )}

                <button onClick={handleSave} className="mt-4 p-2 bg-green-500 text-white rounded">
                    Save Product Result
                </button>

                {/* Modal for selecting product ID */}
                {showSearchModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4 text-white">Select Product</h2>
                            {loading ? (
                                <p className="text-white">Loading...</p>
                            ) : searchResults.length > 0 ? (
                                <>
                                    <table className="min-w-full bg-gray-800 text-white">
                                        <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b border-gray-700"></th>
                                            <th className="py-2 px-4 border-b border-gray-700">Id</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Name</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Attributes</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Tags</th>
                                            <th className="py-2 px-4 border-b border-gray-700">Categories</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {searchResults.map((product) => (
                                            <tr key={product.id}>
                                                <td className="py-2 px-4 border-b border-gray-700">
                                                    <input
                                                        type="radio"
                                                        value={product.id}
                                                        checked={selectedProductId === product.id}
                                                        onChange={() => setSelectedProductId(product.id)}
                                                    />
                                                </td>
                                                <td className="py-2 px-4 border-b border-gray-700">{product.id}</td>
                                                <td className="py-2 px-4 border-b border-gray-700">{product.name}</td>
                                                <td className="py-2 px-4 border-b border-gray-700">{JSON.stringify(product.attributes)}</td>
                                                <td className="py-2 px-4 border-b border-gray-700">{JSON.stringify(product.tags)}</td>
                                                <td className="py-2 px-4 border-b border-gray-700">{product.categories.join(', ')}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                    <div className="flex justify-between items-center py-4">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                            disabled={currentPage === 0}
                                            className="py-2 px-4 bg-blue-500 text-white rounded disabled:bg-gray-600"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-white">Page {currentPage + 1} of {totalPages}</span>
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                                            disabled={currentPage === totalPages - 1}
                                            className="py-2 px-4 bg-blue-500 text-white rounded disabled:bg-gray-600"
                                        >
                                            Next
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={handleProductSelection}
                                            className="p-2 bg-green-500 text-white rounded"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setShowSearchModal(false)}
                                            className="ml-2 p-2 bg-red-500 text-white rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-white">No results found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {modalContent?.title && modalContent?.message &&  (
                <Modal
                    show={!!modalContent}
                    onClose={() => setModalContent(null)}
                    onConfirm={modalContent.onConfirm}
                    title={modalContent.title}
                    message={modalContent.message}
                />
            )}
        </>
    );
};

export default ProductResultCreator;
