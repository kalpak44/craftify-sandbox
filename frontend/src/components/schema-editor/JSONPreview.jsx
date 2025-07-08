import Editor from "@monaco-editor/react";

const JSONPreview = ({ data }) => (
    <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-2">JSON Preview</h2>
        <div className="flex-1 overflow-hidden">
            <Editor
                defaultLanguage="json"
                value={JSON.stringify(data, null, 2)}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false } }}
                className="w-full h-full"
            />
        </div>
    </div>

);

export default JSONPreview;
