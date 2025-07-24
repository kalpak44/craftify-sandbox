import PropTypes from 'prop-types';
import {useEffect, useRef} from 'react';

export const Modal = ({
                          title,
                          children,
                          onCancel,
                          onConfirm,
                          confirmText = 'Save',
                          cancelText = 'Cancel',
                      }) => {
    const modalRef = useRef();

    useEffect(() => {
        if (!onCancel) return;

        const handleKey = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onCancel]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onCancel?.();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onCancel]);

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
                    {title}
                </h2>

                <div className="text-sm text-gray-200 space-y-4">{children}</div>

                {(onCancel || onConfirm) && (
                    <div className="flex justify-end gap-2 mt-6">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                            >
                                {cancelText}
                            </button>
                        )}
                        {onConfirm && (
                            <button
                                type="button"
                                onClick={onConfirm}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                            >
                                {confirmText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

Modal.propTypes = {
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
    ]).isRequired,
    children: PropTypes.node,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
};
