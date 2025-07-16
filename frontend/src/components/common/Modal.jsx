import PropTypes from 'prop-types';
import { useEffect } from 'react';

export const Modal = ({
                          title,
                          children,
                          onCancel,
                          onConfirm,
                          confirmText = 'Save',
                          cancelText = 'Cancel',
                      }) => {
    useEffect(() => {
        if (!onCancel) return;

        const handler = (e) => {
            if (e.key === 'Escape') onCancel();
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            onClick={onCancel ?? undefined}
        >
            <div
                className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto border border-gray-600"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h2 id="modal-title" className="text-lg font-semibold mb-4 text-white">
                    {title}
                </h2>

                <div className="text-sm text-gray-200 space-y-4">{children}</div>

                {(onCancel || onConfirm) && (
                    <div className="flex justify-end space-x-2 mt-6">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="px-4 py-1 bg-gray-600 rounded hover:bg-gray-500 text-white text-sm"
                            >
                                {cancelText}
                            </button>
                        )}
                        {onConfirm && (
                            <button
                                onClick={onConfirm}
                                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
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
