import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AUTO_SAVE_DELAY = 1000; // ms

const SchemaEditor = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [schema, setSchema] = useState("{\n  \"title\": \"New Schema\"\n}");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const saveTimeout = useRef(null);

    // Auto-save effect
    useEffect(() => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        setSaving(true);
        setSaved(false);
        saveTimeout.current = setTimeout(async () => {
            try {
                // TODO: Call API to save schema in folderId
                // await apiSaveSchema(folderId, schema);
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
            } catch (e) {
                setError("Failed to save schema: " + e.message);
                setSaving(false);
            }
        }, AUTO_SAVE_DELAY);
        return () => clearTimeout(saveTimeout.current);
    }, [schema, folderId]);

    return (
        <div className="w-full h-full min-h-screen bg-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <button className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={() => navigate(-1)}>
                        ← Go Back
                    </button>
                    <h1 className="text-2xl text-white font-semibold">Schema Editor</h1>
                    <div className="text-gray-400 text-sm mt-1">Folder: <span className="font-mono">{folderId}</span></div>
                </div>
                <div className="text-sm min-w-[80px] text-right">
                    {saving && <span className="text-yellow-400">Saving...</span>}
                    {!saving && saved && <span className="text-green-400">Saved</span>}
                </div>
            </div>
            {error && <div className="text-red-400 px-8 py-2">{error}</div>}
            <div className="flex-1 flex flex-col">
                <textarea
                    className="flex-1 w-full p-6 bg-gray-900 text-white border-none outline-none resize-none font-mono text-base"
                    value={schema}
                    onChange={e => setSchema(e.target.value)}
                    spellCheck={false}
                    style={{ minHeight: 0 }}
                />
            </div>
        </div>
    );
};

export default SchemaEditor; 