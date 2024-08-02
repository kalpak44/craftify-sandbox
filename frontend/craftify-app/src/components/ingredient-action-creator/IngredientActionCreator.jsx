import React, {useEffect, useState} from "react";
import {getProductsPageable} from "../../services/API.js";
import {Modal} from "../modal/Modal.jsx";

const IngredientActionCreator = ({addAction, onClose, action, accessToken, searchCriteria = {}}) => {
    const [actionType, setActionType] = useState("subtraction");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("");
    const [type, setType] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [availabilityBlockVisible, setAvailabilityBlockVisible] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        if (action) {
            setActionType(action.actionType || "subtraction");
            const amountParam = action.parameters.find(param => param.key === "amount");
            const unitParam = action.parameters.find(param => param.key === "unit");
            const typeParam = action.parameters.find(param => param.key === "type");
            if (amountParam) setAmount(amountParam.value);
            if (unitParam) setUnit(unitParam.value);
            if (typeParam) setType(typeParam.value);
        }
    }, [action]);

    const handleAddAction = () => {
        if (amount.trim() && unit.trim()) {
            addAction({
                actionType,
                parameters: [
                    {key: "type", value: type},
                    {key: "amount", value: amount},
                    {key: "unit", value: unit},
                ],
            });
            onClose();
        } else {
            setShowModal(true);
        }
    };

    const fetchProducts = async (pageNumber) => {
        const {id, name, categories = [], tags = [], attributes = []} = searchCriteria;

        try {
            const response = await getProductsPageable(accessToken, {
                id,
                name,
                categories,
                attributes,
                tags,
                page: pageNumber,
                size: 5
            });

            if (response.totalElements > 0) {
                setProducts(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
                setAvailabilityBlockVisible(true);
            } else {
                setShowModal(true);
            }
        } catch (error) {
            console.error("Error fetching product availability:", error);
            setShowModal(true);
        }
    };

    const handleCheckAvailability = () => {
        fetchProducts(0);
    };

    const handlePageChange = (newPage) => {
        fetchProducts(newPage);
        setPage(newPage);
    };

    const handleModalClose = () => setShowModal(false);

    const handleModalConfirm = () => {
        setShowModal(false);
    };

    return (
        <>
            <div className="p-4 border rounded-lg shadow-md bg-gray-800">
                <div className="mb-4">
                    <label className="block font-medium text-white">Action Type:</label>
                    <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value)}
                        className="w-full p-2 border rounded bg-gray-700 text-white"
                    >
                        <option value="subtraction">Subtraction</option>
                    </select>
                </div>
                <div className="mb-4">
                    <h3 className="font-medium text-white">Parameters</h3>
                    <div className="flex items-center mb-2">
                        <input
                            type="text"
                            value="type"
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                            readOnly
                        />
                        <input
                            type="text"
                            placeholder="Type (e.g., weight)"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        />
                    </div>
                    <div className="flex items-center mb-2">
                        <input
                            type="text"
                            value="amount"
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                            readOnly
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="p-2 border rounded bg-gray-700 text-white"
                        />
                    </div>
                    <div className="flex items-center mb-2">
                        <input
                            type="text"
                            value="unit"
                            className="p-2 border rounded mr-2 bg-gray-700 text-white"
                            readOnly
                        />
                        <input
                            type="text"
                            placeholder="Unit (e.g., kg)"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="p-2 border rounded bg-gray-700 text-white"
                        />
                    </div>
                </div>
                <div className="flex justify-between">
                    <button
                        onClick={handleAddAction}
                        className="p-2 bg-green-500 text-white rounded"
                    >
                        {action ? "Update Action" : "Add Action"}
                    </button>
                    <button
                        onClick={handleCheckAvailability}
                        className="p-2 bg-blue-500 text-white rounded"
                    >
                        Check Availability
                    </button>
                </div>
                <Modal
                    show={showModal}
                    onClose={handleModalClose}
                    onConfirm={handleModalConfirm}
                    title="No Matching Products"
                    message="The current ingredient does not match any products."
                />
            </div>
            {
                availabilityBlockVisible && (
                    <div className="p-4 border rounded-lg shadow-md bg-gray-800 mt-8">
                        <h3 className="font-medium text-white mb-4">Availability</h3>
                        <table className="w-full bg-gray-700 text-white rounded">
                            <thead>
                            <tr>
                                <th className="p-2 border-b">ID</th>
                                <th className="p-2 border-b">Name</th>
                                <th className="p-2 border-b">Availability</th>
                            </tr>
                            </thead>
                            <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="p-2 border-b">{product.id}</td>
                                    <td className="p-2 border-b">{product.name}</td>
                                    <td className="p-2 border-b">{JSON.stringify(product.availability)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="flex justify-between mt-4">
                            <button
                                className={`p-2 rounded ${
                                    page === 0 ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gray-600 text-white'
                                }`}
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                            >
                                Previous
                            </button>
                            <div className="text-white">
                                Page {page + 1} of {totalPages}
                            </div>
                            <button
                                className={`p-2 rounded ${
                                    page >= totalPages - 1 ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-gray-600 text-white'
                                }`}
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages - 1}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default IngredientActionCreator;
