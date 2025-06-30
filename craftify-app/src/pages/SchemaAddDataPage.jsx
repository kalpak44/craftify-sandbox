import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { getSchemaFile } from "../services/API";
import SchemaDataBuilder from "../components/schema-data-builder/SchemaDataBuilder";

const SchemaAddDataPage = () => {
    const { schemaId } = useParams();
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();
    const [schema, setSchema] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [hasValidationErrors, setHasValidationErrors] = useState(false);
    const [validationFunction, setValidationFunction] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchSchema() {
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                const schemaFile = await getSchemaFile(accessToken, schemaId);
                let parsed = {};
                try {
                    parsed = JSON.parse(schemaFile.content);
                } catch (e) {
                    setError("Invalid JSON in schema file.");
                    setLoading(false);
                    return;
                }
                if (isMounted) {
                    setSchema(parsed);
                    console.log("Loaded schema:", parsed);
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchSchema();
        return () => { isMounted = false; };
    }, [schemaId, getAccessTokenSilently]);

    const handleSave = async () => {
        if (!validationFunction) {
            setError("Validation function not available.");
            return;
        }
        
        // Run comprehensive validation
        const validationResult = validationFunction();
        
        if (!validationResult.isValid) {
            setError("Please fix all validation errors before saving.");
            console.log("Validation errors:", validationResult.errors);
            return;
        }
        
        setSaving(true);
        setError("");
        
        try {
            const accessToken = await getAccessTokenSilently();
            // TODO: Implement save logic - you'll need to add the API endpoint
            // await createSchemaData(accessToken, schemaId, formData);
            
            // For now, just navigate back to the table
            navigate(`/schemas/${schemaId}/table`);
        } catch (e) {
            setError("Failed to save data: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/schemas/${schemaId}/table`);
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (error) return <div className="p-8 text-red-400">{error}</div>;
    if (!schema) return <div className="p-8 text-white">No schema found.</div>;

    return (
        <div className="w-full h-full min-h-screen bg-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <button className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={handleCancel}>
                        ← Go Back
                    </button>
                    <h1 className="text-2xl text-white font-semibold">Add Data - {schema.title || "Schema"}</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
            
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-8">
                    <SchemaDataBuilder
                        schema={schema}
                        value={formData}
                        onChange={setFormData}
                        onValidationChange={setHasValidationErrors}
                        onValidateAll={setValidationFunction}
                    />
                </div>
            </div>
            
            {error && <div className="text-red-400 px-8 py-2">{error}</div>}
        </div>
    );
};

export default SchemaAddDataPage; 