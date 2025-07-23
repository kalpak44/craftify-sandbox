import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import {createDataStores} from "../../api/dataStores.js";
import {useAuthFetch} from "../../hooks/useAuthFetch.js";

export function CreateDataStoreModal({ onClose, onCreated }) {
    const [formData, setFormData] = useState({
        type: "JSON",
        name: "",
        description: ""
    });

    const modalRef = useRef();
    const authFetch = useAuthFetch();
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const handleSave = async () => {
        try {
            let created = await createDataStores(authFetch, formData);
            onCreated?.(created);
        } catch (e) {
            setErrorMsg(e.message || "Failed to create data store");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div
                ref={modalRef}
                className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto border border-gray-700"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                tabIndex={-1}
            >
                <h2 id="modal-title" className="text-lg font-semibold mb-4 text-white">
                    Create Data Store
                </h2>

                <form
                    className="text-sm text-gray-200 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                    autoComplete="off"
                >
                    {/* Data Type Select */}
                    <div>
                        <label className="block mb-2 text-gray-300 font-medium" htmlFor="data-type">
                            Data Type
                        </label>
                        <select
                            id="data-type"
                            value={formData.type}
                            onChange={handleChange("dataType")}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="Service">JSON</option>
                        </select>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block mb-2 text-gray-300 font-medium">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange("name")}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <label htmlFor="description" className="block mb-2 text-gray-300 font-medium">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange("description")}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {(errorMsg) && (
                        <div className="text-red-400 text-sm mt-2">{errorMsg}</div>
                    )}
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CreateDataStoreModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onCreated: PropTypes.func,
};
