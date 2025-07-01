import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";

export default function FolderDialog({
                                         open,
                                         title,
                                         defaultValue = "",
                                         onConfirm,
                                         onCancel,
                                         confirmLabel = "OK",
                                         loading = false
                                     }) {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef();

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue, open]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" role="dialog"
             aria-modal="true">
            <div className="bg-gray-800 rounded-lg p-6 min-w-[320px] shadow-lg">
                <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
                <input
                    ref={inputRef}
                    className="w-full p-2 rounded bg-gray-700 text-white mb-4 border border-gray-600 focus:outline-none"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500" onClick={onCancel}
                            disabled={loading}>Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
                        onClick={() => onConfirm(value)}
                        disabled={!value.trim() || loading}
                    >
                        {loading ? '...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

FolderDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    defaultValue: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    confirmLabel: PropTypes.string,
    loading: PropTypes.bool
}; 