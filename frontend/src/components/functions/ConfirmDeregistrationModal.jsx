import {Modal} from "../common/Modal";

export function ConfirmDeregistrationModal({onConfirm, onCancel}) {
    return (
        <Modal
            title="Confirm Deregistration"
            onCancel={onCancel}
            onConfirm={onConfirm}
            confirmText="Deregister"
            cancelText="Cancel"
        >
            <div className="text-gray-300 mb-2">
                Are you sure you want to deregister this function?
            </div>
            <div className="text-sm text-gray-500">
                This action cannot be undone.
            </div>
        </Modal>
    );
}
