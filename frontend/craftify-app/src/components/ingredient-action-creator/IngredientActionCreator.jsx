import React, { useState, useEffect } from "react";

const IngredientActionCreator = ({ addAction, onClose, action }) => {
    const [actionType, setActionType] = useState("subtraction");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("");

    // Use effect to populate fields if editing an action
    useEffect(() => {
        if (action) {
            setActionType(action.actionType || "subtraction");
            const amountParam = action.parameters.find(param => param.key === "amount");
            const unitParam = action.parameters.find(param => param.key === "unit");
            if (amountParam) setAmount(amountParam.value);
            if (unitParam) setUnit(unitParam.value);
        }
    }, [action]);

    const handleAddAction = () => {
        if (amount.trim() && unit.trim()) {
            addAction({
                actionType,
                parameters: [
                    { key: "type", value: "quantity" },
                    { key: "amount", value: amount },
                    { key: "unit", value: unit },
                ],
            });
            onClose();
        } else {
            alert("All fields are required.");
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-md bg-gray-800">
            <div className="mb-4">
                <label className="block font-medium text-white">Action Type:</label>
                <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-700 text-white"
                    disabled
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
                        value="quantity"
                        className="p-2 border rounded mr-2 bg-gray-700 text-white"
                        readOnly
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
                        placeholder="Unit (e.g., ml)"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="p-2 border rounded bg-gray-700 text-white"
                    />
                </div>
            </div>
            <button
                onClick={handleAddAction}
                className="mt-4 p-2 bg-green-500 text-white rounded"
            >
                {action ? "Update Action" : "Add Action"}
            </button>
        </div>
    );
};

export default IngredientActionCreator;
