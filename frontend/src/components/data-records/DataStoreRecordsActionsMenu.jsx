import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Modal } from '../common/Modal';
import { useAuthFetch } from '../../hooks/useAuthFetch';
import { deleteDataRecord } from '../../api/dataStores';

export function DataStoreRecordsActionsMenu({ dataStoreId, dataRecordId, onDeleted }) {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const buttonRef = useRef();
    const menuRef = useRef();
    const navigate = useNavigate();
    const authFetch = useAuthFetch();

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        if (!open || !buttonRef.current) return;
        const btnRect = buttonRef.current.getBoundingClientRect();
        const menuHeight = 96;
        let top = btnRect.bottom + 8;
        let left = btnRect.right - 130;
        if (window.innerHeight - btnRect.bottom < menuHeight + 12) {
            top = btnRect.top - menuHeight - 8;
        }
        setMenuStyle({
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 1000,
            minWidth: '130px'
        });
    }, [open]);

    const handleDelete = async () => {
        try {
            await deleteDataRecord(authFetch, dataStoreId, dataRecordId);
            setShowConfirmModal(false);
            if (onDeleted) onDeleted(); // Refresh parent
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete the record');
            setShowConfirmModal(false);
            setShowErrorModal(true);
        }
    };

    const menu = open ? createPortal(
        <div
            ref={menuRef}
            style={menuStyle}
            className="bg-gray-900 border border-gray-700 rounded-lg shadow"
        >
            <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-800 text-gray-100"
                onClick={() => {
                    navigate(`/data-stores/${dataStoreId}/${dataRecordId}`);
                    setOpen(false);
                }}
            >
                View Record
            </button>
            <button
                className="block w-full px-4 py-2 text-left hover:bg-red-900 text-red-400"
                onClick={() => {
                    setOpen(false);
                    setShowConfirmModal(true);
                }}
            >
                Delete Record
            </button>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setOpen((o) => !o)}
                className="rounded px-2 py-1 hover:bg-gray-800 text-gray-400"
                aria-label="Actions"
            >
                <span className="text-xl font-bold">⋯</span>
            </button>
            {menu}

            {showConfirmModal && (
                <Modal
                    title="Delete Record"
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={handleDelete}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                >
                    <div className="text-gray-300">
                        Are you sure you want to delete this record? This action cannot be undone.
                    </div>
                </Modal>
            )}

            {showErrorModal && (
                <Modal
                    title="Failed to delete record"
                    onCancel={() => setShowErrorModal(false)}
                    cancelText="Close"
                >
                    <div className="text-red-400">
                        {deleteError ?? "Unknown error occurred while deleting the record."}
                    </div>
                    <div className="text-gray-400 mt-2">
                        Please try again or contact support.
                    </div>
                </Modal>
            )}
        </>
    );
}
