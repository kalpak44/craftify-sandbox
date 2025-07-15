import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import Editor from '@monaco-editor/react';

export const FunctionEditorPage = () => {
    const [searchParams] = useSearchParams();
    const functionPath = searchParams.get('path') || 'unknown';

    const [activeTab, setActiveTab] = useState('output');
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
        if (isDragging) {
            const newHeight = window.innerHeight - e.clientY;
            setTerminalHeight(Math.max(100, Math.min(400, newHeight)));
        }
    };

    return (
        <div className="flex h-full text-white" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-auto">
                <h2 className="text-sm uppercase text-gray-400 mb-3">Explorer</h2>
                <div className="text-xs text-gray-300 mb-4">Path: <span className="text-yellow-400">{functionPath}</span></div>
                <ul className="text-sm space-y-1">
                    <li className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                        <span>📁 sandbox</span>
                        <span className="text-xs text-gray-500">+</span>
                    </li>
                    <li className="ml-4 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                        <span>📄 example.js</span>
                    </li>
                </ul>
            </aside>

            <main className="flex-1 flex flex-col bg-gray-900">
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">Environment</span>
                        <select className="bg-gray-800 text-white px-2 py-1 rounded">
                            <option>Node.js</option>
                        </select>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded">Run</button>
                </div>

                <div className="flex-1">
                    <Editor
                        height={`calc(100vh - ${terminalHeight + 90}px)`}
                        defaultLanguage="javascript"
                        defaultValue={`function main() {\n  console.log('Hello, world!');\n}`}
                        theme="vs-dark"
                    />
                </div>

                <div className="h-2 cursor-row-resize bg-gray-700 hover:bg-gray-600" onMouseDown={handleMouseDown}></div>

                <div style={{ height: terminalHeight }} className="bg-gray-950 border-t border-gray-800 rounded-t-lg shadow-inner flex flex-col">
                    <div className="flex border-b border-gray-700">
                        <button
                            className={`px-4 py-2 transition-colors duration-200 ${activeTab === 'output' ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('output')}
                        >
                            Output
                        </button>
                        <button
                            className={`px-4 py-2 transition-colors duration-200 ${activeTab === 'parameters' ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab('parameters')}
                        >
                            Parameters
                        </button>
                    </div>

                    <div className="flex-1 p-4 text-sm text-gray-200 overflow-auto">
                        {activeTab === 'output' && <pre className="whitespace-pre-wrap">node example.js\nHello, world!</pre>}
                        {activeTab === 'parameters' && <p>Define input parameters here...</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};