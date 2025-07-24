import PropTypes from "prop-types";
import {useEffect, useRef, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {useAuthFetch} from "../../hooks/useAuthFetch.js";
import {registerFunction} from "../../api/function.js";
import {useRegistrationLogs} from "../../hooks/useRegistrationLogs.js";

export function RegisterFunctionModal({onClose, onRegistered}) {
    const [type, setType] = useState("Service");
    const [repo, setRepo] = useState("https://github.com/kalpak44/craftify-event-function.git");
    const [branch, setBranch] = useState("main");
    const [inputError, setInputError] = useState(null);
    const [registrationId, setRegistrationId] = useState(null);
    const [showLogs, setShowLogs] = useState(false);

    const {getAccessTokenSilently} = useAuth0();
    const authFetch = useAuthFetch();
    const modalRef = useRef();
    const logsEndRef = useRef();

    const {logs, status, error: logsError, reset: resetLogs, connectLogs} = useRegistrationLogs({
        getToken: getAccessTokenSilently,
        onRegistered
    });

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [logs]);

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

    useEffect(() => {
        if (status === 'success') {
            if (onRegistered) onRegistered();
            onClose();
        }
    }, [status, onRegistered, onClose]);

    const handleSave = async () => {
        setInputError(null);
        resetLogs();
        setShowLogs(true);
        setRegistrationId(null);
        if (!repo.trim() || !branch.trim()) {
            setInputError("Repository name and branch are required.");
            setShowLogs(false);
            return;
        }
        try {
            const response = await registerFunction(authFetch, {type, repo, branch});
            const regId = response.registrationId || response.id;
            setRegistrationId(regId);
            connectLogs(regId);
        } catch (e) {
            let errorMsg = e.message || "Failed to register function.";
            try {
                const parsed = JSON.parse(e.message);
                if (parsed.message) errorMsg = parsed.message;
            } catch (err) {
                console.warn(err);
            }
            setInputError(errorMsg);
            setShowLogs(false);
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
                    Register Function
                </h2>

                {showLogs ? (
                    <div>
                        <div className="mb-3">
                            <span className="text-gray-300 font-medium">Registration Logs:</span>
                        </div>
                        <div
                            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 max-h-60 overflow-y-auto text-sm font-mono text-gray-300 space-y-1"
                            style={{minHeight: 120}}>
                            {!registrationId && (
                                <div>Starting registration, waiting for registration ID...</div>
                            )}
                            {registrationId && logs.length === 0 && (
                                <div>Waiting for logs...</div>
                            )}
                            {logs.map((line, idx) => (
                                <div key={idx}>{line}</div>
                            ))}
                            <div ref={logsEndRef}/>
                        </div>
                        {(inputError || logsError) && (
                            <div className="text-red-400 text-sm mt-2">{inputError || logsError}</div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <form
                        className="text-sm text-gray-200 space-y-4"
                        onSubmit={e => {
                            e.preventDefault();
                            handleSave();
                        }}
                        autoComplete="off"
                    >
                        <div>
                            <label className="block mb-2 text-gray-300 font-medium" htmlFor="function-type">
                                Function type
                            </label>
                            <select
                                id="function-type"
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="Job">Job</option>
                            </select>
                        </div>
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
                                required
                                autoFocus
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
                                required
                            />
                        </div>
                        {(inputError || logsError) && (
                            <div className="text-red-400 text-sm">{inputError || logsError}</div>
                        )}
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
                )}
            </div>
        </div>
    );
}

RegisterFunctionModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onRegistered: PropTypes.func,
};
