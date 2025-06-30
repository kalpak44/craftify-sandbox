import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { saveSchemaFile, listSchemaFiles } from "../services/API";

const AUTO_SAVE_DELAY = 1000; // ms

const SchemaEditor = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const { user, getAccessTokenSilently } = useAuth0();
    const [schema, setSchema] = useState("{\n  \"title\": \"New Schema\"\n}");
    const [schemaId, setSchemaId] = useState(null);
    const [fileBaseName, setFileBaseName] = useState("Schema");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [nameError, setNameError] = useState("");
    const saveTimeout = useRef(null);
    const [loading, setLoading] = useState(true);
    const [allSchemaNames, setAllSchemaNames] = useState([]);

    // Fetch existing schema for this folder/user on mount
    useEffect(() => {
        let isMounted = true;
        async function fetchSchema() {
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                const schemas = await listSchemaFiles(accessToken, folderId);
                if (isMounted) {
                    setAllSchemaNames(schemas.map(s => ({ id: s.id, name: (s.name || "Schema.json").toLowerCase() })));
                }
                if (schemas && schemas.length > 0) {
                    if (isMounted) {
                        setSchema(schemas[0].content);
                        setSchemaId(schemas[0].id);
                        // Remove .json extension for input
                        const name = schemas[0].name || "Schema.json";
                        setFileBaseName(name.endsWith('.json') ? name.slice(0, -5) : name);
                    }
                } else {
                    if (isMounted) {
                        setSchema("{\n  \"title\": \"New Schema\"\n}");
                        setSchemaId(null);
                        setFileBaseName("Schema");
                    }
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchSchema();
        return () => { isMounted = false; };
    }, [folderId, getAccessTokenSilently]);

    // Check for duplicate name
    useEffect(() => {
        if (!fileBaseName.trim()) return;
        const fullName = fileBaseName.trim().toLowerCase() + ".json";
        const duplicate = allSchemaNames.find(s => s.name === fullName && s.id !== schemaId);
        if (duplicate) {
            setNameError("A schema with this name already exists in this folder.");
        } else if (nameError === "A schema with this name already exists in this folder.") {
            setNameError("");
        }
    }, [fileBaseName, allSchemaNames, schemaId]);

    // Auto-save effect
    useEffect(() => {
        if (loading) return;
        if (!fileBaseName.trim()) {
            setNameError("File name is required");
            setSaving(false);
            return;
        } else if (fileBaseName.includes('.')) {
            setNameError("File name cannot contain '.'");
            setSaving(false);
            return;
        } else if (nameError) {
            setSaving(false);
            return;
        } else {
            setNameError("");
        }
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        setSaving(true);
        setSaved(false);
        saveTimeout.current = setTimeout(async () => {
            try {
                const accessToken = await getAccessTokenSilently();
                const schemaFile = {
                    id: schemaId,
                    name: fileBaseName.trim() + ".json",
                    content: schema,
                    folderId: folderId,
                    userId: user?.sub,
                };
                const savedSchema = await saveSchemaFile(accessToken, schemaFile);
                setSchemaId(savedSchema.id);
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
            } catch (e) {
                setError("Failed to save schema: " + e.message);
                setSaving(false);
            }
        }, AUTO_SAVE_DELAY);
        return () => clearTimeout(saveTimeout.current);
    }, [schema, fileBaseName, folderId, nameError]);

    const handleGoBack = () => {
        navigate('/data-modeler', { state: { folderId } });
    };

    return (
        <div className="w-full h-full min-h-screen bg-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <button className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={handleGoBack}>
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
            <div className="flex flex-col px-8 pt-6 gap-2">
                <label className="text-white text-sm font-semibold" htmlFor="schema-file-name">File Name <span className="text-red-400">*</span></label>
                <div className="flex items-center gap-2">
                    <input
                        id="schema-file-name"
                        className="w-full max-w-md p-2 rounded bg-gray-900 text-white border border-gray-700 focus:border-blue-500 outline-none"
                        value={fileBaseName}
                        onChange={e => setFileBaseName(e.target.value.replace(/\./g, ""))}
                        disabled={loading}
                        placeholder="Enter file name (e.g. Schema)"
                        required
                    />
                    <span className="text-white text-base">.json</span>
                </div>
                {nameError && <div className="text-red-400 text-xs mt-1">{nameError}</div>}
            </div>
            {error && <div className="text-red-400 px-8 py-2">{error}</div>}
            <div className="flex-1 flex flex-col">
                <textarea
                    className="flex-1 w-full p-6 bg-gray-900 text-white border-none outline-none resize-none font-mono text-base"
                    value={schema}
                    onChange={e => setSchema(e.target.value)}
                    spellCheck={false}
                    style={{ minHeight: 0 }}
                    disabled={loading}
                />
            </div>
        </div>
    );
};

export default SchemaEditor; 