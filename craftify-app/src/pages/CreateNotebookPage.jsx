import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";

export const CreateNotebookPage = () => {
    const { getAccessTokenSilently, user } = useAuth0();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("// Write your code here...");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const API_BASE = "http://localhost:8080/api";

    const handleSave = async () => {
        if (title.trim() === "") {
            setError("Notebook title cannot be empty.");
            return;
        }

        setError("");
        setSaving(true);
        try {
            const token = await getAccessTokenSilently();
            await fetch(`${API_BASE}/notebooks`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content,
                    userId: user.sub,
                }),
            });
            navigate("/notebooks");
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Create New Notebook '.ipynb'</h1>
            <input
                type="text"
                placeholder="Notebook Title"
                className="w-full mb-2 p-3 rounded bg-gray-800 text-white border border-gray-700 placeholder-gray-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <Editor
                height="400px"
                defaultLanguage="python"
                value={content}
                onChange={(value) => setContent(value || "")}
                theme="vs-dark"
            />
            <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Notebook"}
            </button>
        </div>
    );
};
