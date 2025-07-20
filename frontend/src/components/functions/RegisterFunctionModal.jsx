import {useEffect, useState} from "react";
import PropTypes from "prop-types";

export function RegisterFunctionModal({onClose}) {
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("");

    // Escape key close
    useEffect(() => {
        if (!onClose) return;
        const handler = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleSave = () => {
        alert(
            `Repo: ${repo}\nBranch: ${branch}`
        );
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto border border-gray-700"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h2 id="modal-title" className="text-lg font-semibold mb-4 text-white">
                    Register Function
                </h2>

                <div className="text-sm text-gray-200 space-y-4">
                    <div>
                        <label className="block mb-2 text-gray-300 font-medium" htmlFor="repo-name">
                            Repo name
                        </label>
                        <input
                            id="repo-name"
                            type="text"
                            value={repo}
                            onChange={e => setRepo(e.target.value)}
                            placeholder="my-org/my-repo"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-gray-300 font-medium" htmlFor="branch">
                            Branch
                        </label>
                        <input
                            id="branch"
                            type="text"
                            value={branch}
                            onChange={e => setBranch(e.target.value)}
                            placeholder="main"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

RegisterFunctionModal.propTypes = {
    onClose: PropTypes.func,
};
