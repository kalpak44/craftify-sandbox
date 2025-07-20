import PropTypes from "prop-types";
import {useEffect, useRef, useState} from "react";
import {useAuthFetch} from "../../hooks/useAuthFetch.js";
import {registerFunction} from "../../api/function.js";

export function RegisterFunctionModal({onClose, onRegistered}) {
    const [type, setType] = useState("Service");
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [registrationId, setRegistrationId] = useState(null);
    const [logs, setLogs] = useState([]); // Logs as array of strings
    const [status, setStatus] = useState("idle"); // idle | registering | in-progress | success | error
    const [error, setError] = useState(null);

    const authFetch = useAuthFetch();
    const wsRef = useRef(null);
    const modalRef = useRef();
    const logsEndRef = useRef();

    // Scroll log to bottom as new logs appear
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [logs]);

    // ESC and click outside to close
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

    // Open websocket on registrationId set
    useEffect(() => {
        if (!registrationId) return;

        setStatus("in-progress");
        setLogs(["Connecting to log server..."]);

        // Example: ws://localhost:8080/function/registration-status/{registrationId}
        const wsUrl = `${import.meta.env.VITE_WS_API_HOST || 'ws://localhost:8080'}/function/registration-status/${registrationId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setLogs(prev => [...prev, "[connected]"]);
        };

        ws.onmessage = (event) => {
            try {
                // Try parsing as JSON, fallback to string
                let msg = event.data;
                if (event.data && event.data[0] === "{") {
                    const parsed = JSON.parse(event.data);
                    if (parsed.message) msg = parsed.message;
                    else if (parsed.log) msg = parsed.log;
                    else if (parsed.step) msg = parsed.step;
                    if (parsed.status) {
                        if (parsed.status === "success") {
                            setStatus("success");
                            setLogs(prev => [...prev, "[success] Registration complete!"]);
                            if (onRegistered) onRegistered();
                        } else if (parsed.status === "error") {
                            setStatus("error");
                            setLogs(prev => [...prev, "[error] Registration failed"]);
                            setError(parsed.error || "Registration failed");
                        }
                    }
                }
                setLogs(prev => [...prev, msg]);
            } catch (e) {
                setLogs(prev => [...prev, event.data]);
            }
        };

        ws.onerror = () => {
            setStatus("error");
            setLogs(prev => [...prev, "[error] WebSocket error"]);
            setError("WebSocket error.");
        };
        ws.onclose = () => {
            setLogs(prev => [...prev, "[connection closed]"]);
        };

        return () => {
            ws.close();
        };
    }, [registrationId, onRegistered]);

    const handleSave = async () => {
        setError(null);
        setSubmitting(true);
        setStatus("registering");
        setLogs([]);
        if (!repo.trim() || !branch.trim()) {
            setError("Repository name and branch are required.");
            setSubmitting(false);
            setStatus("idle");
            return;
        }
        try {
            const response = await registerFunction(authFetch, {type, repo, branch});
            setRegistrationId(response.registrationId || response.id);
            setLogs(["Registration request sent. Waiting for logs..."]);
        } catch (e) {
            let errorMsg = e.message || "Failed to register function.";
            try {
                const parsed = JSON.parse(e.message);
                if (parsed.message) errorMsg = parsed.message;
            } catch (e) {
                console.error(e)
            }
            setError(errorMsg);
            setStatus("error");
            setLogs([`[error] ${errorMsg}`]);
        } finally {
            setSubmitting(false);
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

                {status === "idle" || status === "registering" ? (
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
                                <option value="Service">Service</option>
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
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                            >
                                {submitting ? "Submitting..." : "Save"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="mb-3">
                            <span className="text-gray-300 font-medium">Registration Logs:</span>
                        </div>
                        <div
                            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 max-h-60 overflow-y-auto text-sm font-mono text-gray-300 space-y-1">
                            {logs.map((line, idx) => (
                                <div key={idx}>{line}</div>
                            ))}
                            <div ref={logsEndRef}/>
                        </div>
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
                )}
            </div>
        </div>
    );
}

RegisterFunctionModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onRegistered: PropTypes.func,
};
