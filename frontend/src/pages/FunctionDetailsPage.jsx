import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {FunctionHeader} from "../components/functions/FunctionHeader.jsx";
import {Tabs} from "../components/functions/Tabs.jsx";
import {InvocationList} from "../components/functions/InvocationList.jsx";
import {ParameterViewer} from "../components/functions/ParameterViewer.jsx";

// Stub data
const demoFunction = {
    name: "order-confirmation",
    status: "Active",
    type: "Event",
    executionMode: "Service",
    repoUrl: "https://github.com/your-org/order-confirmation",
    commitHash: "c1a2b3c4d5e6f7g8h9i0",
};

function getRepoName(repoUrl) {
    if (!repoUrl) return "";
    try {
        const parts = repoUrl.split("/");
        return parts.slice(-2).join("/");
    } catch (e) {
        return repoUrl;
    }
}

export function FunctionDetailsPage() {
    const {id} = useParams();
    const [showSettings, setShowSettings] = useState(false);
    const [active, setActive] = useState(demoFunction.status === "Active");
    const popoverRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        function handleClick(e) {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setShowSettings(false);
            }
        }

        if (showSettings) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showSettings]);

    // Get repo name and commit message
    const repoName = getRepoName(demoFunction.repoUrl);
    const commitMsg = demoFunction.commitMessage;

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            {/* Top panel with FunctionHeader and consistent styled actions */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-2">
                    <FunctionHeader func={{...demoFunction, status: active ? "Active" : "Disabled"}}/>
                    {/* Repo name and commit message section */}
                    <div className="flex items-center gap-6 text-xs text-gray-400 ml-1">
                        <div>
                            <span className="font-semibold text-gray-300">Repo:</span>{" "}
                            <a
                                href={demoFunction.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-400"
                            >
                                {repoName}
                            </a>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-300">Commit:</span>{" "}
                            <span title={commitMsg}>{demoFunction.commitHash.slice(0, 8)}</span>
                            <span className="ml-2 italic text-gray-500 truncate max-w-[200px]" title={commitMsg}>
                                {commitMsg}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/functions")}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                    >
                        Go back
                    </button>
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700 rounded-xl px-4 py-2 shadow transition text-sm font-medium"
                            onClick={() => setShowSettings((v) => !v)}
                        >
                            Settings
                        </button>
                        {showSettings && (
                            <div
                                ref={popoverRef}
                                className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-4 z-20"
                            >
                                <div className="flex items-center justify-between">
                                    <span>Enable function</span>
                                    <label className="inline-flex items-center cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-blue-500 transition"
                                            checked={active}
                                            onChange={() => setActive((v) => !v)}
                                        />
                                        <span className="ml-2 text-gray-200">{active ? "Enabled" : "Disabled"}</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Tabs
                tabs={[
                    {label: "Invocations", content: <InvocationList/>},
                    {label: "Parameters", content: <ParameterViewer/>},
                ]}
            />
        </div>
    );
}
