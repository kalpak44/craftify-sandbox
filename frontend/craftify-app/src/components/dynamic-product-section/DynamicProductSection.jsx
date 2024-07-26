import React from "react";

export const DynamicProductSection = ({ sectionName, sectionKey, fields, handleNestedChange, handleAddField, handleRemoveField, isMeasurement, isCategory }) => (
    <div className="space-y-2">
        <h3 className="font-semibold">{sectionName}</h3>
        {fields.map((field, index) => (
            <div key={index} className="flex items-center space-x-2">
                {!isCategory && (
                    <>
                        <input
                            type="text"
                            placeholder="Key"
                            value={field.key || ""}
                            onChange={(e) => handleNestedChange(e, sectionKey, index, "key")}
                            className="w-1/3 p-2 border border-gray-300 rounded text-black"
                        />
                        {isMeasurement && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Value"
                                    value={field.value || ""}
                                    onChange={(e) => handleNestedChange(e, sectionKey, index, "value")}
                                    className="w-1/3 p-2 border border-gray-300 rounded text-black"
                                />
                                <input
                                    type="text"
                                    placeholder="Unit"
                                    value={field.unit || ""}
                                    onChange={(e) => handleNestedChange(e, sectionKey, index, "unit")}
                                    className="w-1/3 p-2 border border-gray-300 rounded text-black"
                                />
                            </>
                        )}
                        {!isMeasurement && (
                            <input
                                type="text"
                                placeholder="Value"
                                value={field.value || ""}
                                onChange={(e) => handleNestedChange(e, sectionKey, index, "value")}
                                className="w-2/3 p-2 border border-gray-300 rounded text-black"
                            />
                        )}
                    </>
                )}
                {isCategory && (
                    <input
                        type="text"
                        placeholder="Category"
                        value={field.value || ""}
                        onChange={(e) => handleNestedChange(e, sectionKey, index, "value")}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                    />
                )}
                <button
                    type="button"
                    onClick={() => handleRemoveField(sectionKey, index)}
                    className="py-2 px-4 rounded bg-red-500 text-white font-bold hover:bg-red-700"
                >
                    Remove
                </button>
            </div>
        ))}
        <button
            type="button"
            onClick={() => handleAddField(sectionKey, isMeasurement ? { key: "", value: "", unit: "" } : isCategory ? { value: "" } : { key: "", value: "" })}
            className="py-2 px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-700"
        >
            Add {sectionName.slice(0, -1)}
        </button>
    </div>
);
