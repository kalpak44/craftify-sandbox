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

export function FunctionDetailsPage() {
    const {id} = useParams();
    const [showSettings, setShowSettings] = useState(false);
    const [active, setActive] = useState(demoFunction.status === "Active");
    const popoverRef = useRef();
    const navigate = useNavigate();

    // Close popover when clicking outside
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

    return (
        <div className="w-full max-w-5xl mx-auto py-8 px-4">
            {/* Top panel with FunctionHeader and consistent styled actions */}
            <div className="flex items-center justify-between mb-6">
                <FunctionHeader func={{...demoFunction, status: active ? "Active" : "Disabled"}}/>
                <div className="flex items-center gap-3">
                    {/* ...Go back and Settings buttons... */}
                </div>
            </div>

            {/* Details section */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                    <div>
                        <span className="text-gray-400">Repo: </span>
                        <a
                            href={demoFunction.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline break-all"
                        >
                            {demoFunction.repoUrl}
                        </a>
                    </div>
                    <div>
                        <span className="text-gray-400">Commit: </span>
                        <span className="inline-block font-mono bg-gray-900 border border-gray-700 px-2 py-0.5 rounded">
                            {demoFunction.commitHash}
                        </span>
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