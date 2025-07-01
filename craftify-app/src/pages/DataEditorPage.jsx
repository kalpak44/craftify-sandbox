import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { getSchemaFile, createSchemaDataRecord, getSchemaDataRecord, updateSchemaDataRecord } from "../services/API";
import SchemaDataBuilder from "../components/schema-data-builder/SchemaDataBuilder";

const DataEditorPage = () => {
    const { schemaId } = useParams();
    const [searchParams] = useSearchParams();
    const recordId = searchParams.get('recordId');
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();
    const [schema, setSchema] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [hasValidationErrors, setHasValidationErrors] = useState(false);
    const [validationFunction, setValidationFunction] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function fetchSchemaAndData() {
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                const schemaFile = await getSchemaFile(accessToken, schemaId);
                let parsed = {};
                try {
                    console.log(schemaFile)
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

                // If editing, load the existing record data
                if (recordId) {
                    setIsEditing(true);
                    try {
                        const record = await getSchemaDataRecord(accessToken, recordId);
                        setFormData(record.data || {});
                        console.log("Loaded existing record data:", record.data);
                    } catch (e) {
                        console.error("Error loading existing record:", e);
                        setError(`Failed to load existing record: ${e.message}`);
                        // Don't return here, continue with the schema loading
                    }
                }
            } catch (e) {
                console.error("Error fetching schema or data:", e);
                // Check if the error message contains HTML indicators
                if (e.message && (e.message.includes('<!doctype') || e.message.includes('<html') || e.message.includes('<!DOCTYPE'))) {
                    setError("Server returned an HTML error page instead of JSON. This usually indicates a server configuration issue or authentication problem.");
                } else {
                    setError(`Failed to load schema: ${e.message}`);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        fetchSchemaAndData();
        return () => { isMounted = false; };
    }, [schemaId, recordId, getAccessTokenSilently]);

    // Fallback validation function
    const fallbackValidation = () => {
        console.log("Using fallback validation");
        // Basic validation - check if formData has any values
        const hasData = Object.keys(formData).length > 0;
        return {
            isValid: hasData,
            errors: hasData ? {} : { general: ["No data entered"] }
        };
    };

    const handleSave = async () => {
        let validationResult;
        
        if (!validationFunction || typeof validationFunction !== 'function') {
            console.log("Using fallback validation");
            validationResult = fallbackValidation();
        } else {
            console.log("Using SchemaDataBuilder validation");
            validationResult = validationFunction();
        }
        
        if (!validationResult.isValid) {
            setError("Please fix all validation errors before saving.");
            console.log("Validation errors:", validationResult.errors);
            return;
        }
        
        setSaving(true);
        setError("");
        
        try {
            const accessToken = await getAccessTokenSilently();
            console.log("Sending formData to backend:", formData);
            
            let record;
            if (isEditing) {
                // Update existing record
                record = await updateSchemaDataRecord(accessToken, recordId, formData);
                console.log("Updated data record:", record);
            } else {
                // Create new record
                record = await createSchemaDataRecord(accessToken, schemaId, formData);
                console.log("Created data record:", record);
            }
            
            // Navigate back to the table with success indication
            navigate(`/data/${schemaId}/list`);
        } catch (e) {
            console.error("Error saving data:", e);
            setError("Failed to save data: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/data/${schemaId}/list`);
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;
    if (error) return <div className="p-8 text-red-400">{error}</div>;
    if (!schema) return <div className="p-8 text-white">No schema found.</div>;

    return (
        <div className="w-full h-full min-h-screen bg-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl text-white font-semibold">{isEditing ? "Edit" : "Add"} Data - {schema.title || "Schema"}</h1>
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
                        {saving ? "Saving..." : (isEditing ? "Update" : "Save")}
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

export default DataEditorPage;