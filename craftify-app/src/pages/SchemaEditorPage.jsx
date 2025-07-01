import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { saveSchemaFile, listSchemaFiles } from "../services/API";
import JsonBuilder from "../components/json-builder/JsonBuilder";

const SchemaEditorPage = () => {
    const { folderId } = useParams();
    const [searchParams] = useSearchParams();
    const schemaIdParam = searchParams.get('schemaId');
    const navigate = useNavigate();
    const { user, getAccessTokenSilently } = useAuth0();
    const [schemaObject, setSchemaObject] = useState({});
    const [schemaId, setSchemaId] = useState(schemaIdParam || null);
    const [fileBaseName, setFileBaseName] = useState("Schema");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [nameError, setNameError] = useState("");
    const [loading, setLoading] = useState(true);
    const [allSchemaNames, setAllSchemaNames] = useState([]);
    const [schemaInitialized, setSchemaInitialized] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function fetchSchema() {
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                if (schemaIdParam) {
                    const { getSchemaFile, listSchemaFiles } = await import("../services/API");
                    const schema = await getSchemaFile(accessToken, schemaIdParam);
                    if (isMounted) {
                        let parsed = {};
                        try {
                            parsed = JSON.parse(schema.content);
                        } catch (e) {
                            setError("Invalid JSON in schema file.");
                        }
                        setSchemaObject({ ...parsed });
                        setSchemaId(schema.id);
                        const name = schema.name || "Schema.json";
                        setFileBaseName(name.endsWith('.json') ? name.slice(0, -5) : name);
                        const schemas = await listSchemaFiles(accessToken, folderId);
                        setAllSchemaNames(schemas.map(s => ({ id: s.id, name: (s.name || "Schema.json").toLowerCase() })));
                        setSchemaInitialized(true);
                    }
                } else {
                    const { listSchemaFiles } = await import("../services/API");
                    const schemas = await listSchemaFiles(accessToken, folderId);
                    if (isMounted) {
                        setAllSchemaNames(schemas.map(s => ({ id: s.id, name: (s.name || "Schema.json").toLowerCase() })));
                        setSchemaObject({});
                        setSchemaId(null);
                        setFileBaseName("Schema");
                        setSchemaInitialized(true);
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
    }, [folderId, getAccessTokenSilently, schemaIdParam]);

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

    const handleSave = async () => {
        if (!fileBaseName.trim()) {
            setNameError("File name is required");
            return;
        } else if (fileBaseName.includes('.')) {
            setNameError("File name cannot contain '.'");
            return;
        }
        const fullName = fileBaseName.trim().toLowerCase() + ".json";
        const duplicate = allSchemaNames.find(s => s.name === fullName && s.id !== schemaId);
        if (duplicate) {
            setNameError("A schema with this name already exists in this folder.");
            return;
        }
        if (nameError) return;
        setSaving(true);
        setSaved(false);
        try {
            const accessToken = await getAccessTokenSilently();
            const schemaFile = {
                id: schemaIdParam || schemaId,
                name: fileBaseName.trim() + ".json",
                content: JSON.stringify(schemaObject, null, 2),
                folderId: folderId,
                userId: user?.sub,
            };
            const { saveSchemaFile } = await import("../services/API");
            const savedSchema = await saveSchemaFile(accessToken, schemaFile);
            setSchemaId(savedSchema.id);
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
        } catch (e) {
            setError("Failed to save schema: " + e.message);
            setSaving(false);
        }
    };

    const handleGoBack = () => {
        navigate('/data-modeler');
    };

    return (
        <div className="w-full h-full min-h-screen bg-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <button className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={handleGoBack}>← Go Back</button>
                    <h1 className="text-2xl text-white font-semibold">Schema Editor</h1>
                    <div className="text-gray-400 text-sm mt-1">Folder: <span className="font-mono">{folderId}</span></div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 disabled:opacity-50" onClick={handleSave} disabled={saving || !fileBaseName.trim() || fileBaseName.includes('.') || !!nameError}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                    <div className="text-sm min-w-[80px] text-right">
                        {!saving && saved && <span className="text-green-400">Saved</span>}
                    </div>
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
                {schemaInitialized && (
                    <JsonBuilder
                        value={schemaObject}
                        onChange={(newSchema) => setSchemaObject(newSchema)}
                    />
                )}
            </div>
        </div>
    );
};

export default SchemaEditorPage;


