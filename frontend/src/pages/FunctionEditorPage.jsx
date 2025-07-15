import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useAuthFetch } from '../hooks/useAuthFetch';
import { getFileContent, loadFunctionTree } from '../api/functionEditor';
import { Modal } from '../components/common/Modal';

export const FunctionEditorPage = () => {
    const [searchParams] = useSearchParams();
    const functionPath = searchParams.get('path') || 'unknown';
    const authFetch = useAuthFetch();

    const [activeTab, setActiveTab] = useState('output');
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [isDragging, setIsDragging] = useState(false);

    const [fileTree, setFileTree] = useState(null);
    const [expandedPaths, setExpandedPaths] = useState(new Set());
    const [currentFile, setCurrentFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [fileLanguage, setFileLanguage] = useState('javascript');

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
        if (isDragging) {
            const newHeight = window.innerHeight - e.clientY;
            setTerminalHeight(Math.max(100, Math.min(400, newHeight)));
        }
    };

    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    const toggleFolder = (path) => {
        const newSet = new Set(expandedPaths);
        if (newSet.has(path)) newSet.delete(path);
        else newSet.add(path);
        setExpandedPaths(newSet);
    };

    const openFile = async (file) => {
        const path = functionPath + '/'+ file.fullPath;
        setCurrentFile(file);

        try {
            const content = await getFileContent(authFetch, path);
            setFileContent(content);
            const ext = path.split('.').pop();
            const langMap = { js: 'javascript', ts: 'typescript', py: 'python', json: 'json' };
            setFileLanguage(langMap[ext] || 'plaintext');
        } catch (e) {
            showError('Failed to load file content.');
            setFileContent('// Failed to load file');
            setFileLanguage('plaintext');
        }
    };

    const renderTree = (node, level = 0) => {
        if (!node) return null;
        const isFolder = node.type === 'FOLDER' || node.type === 'FUNCTION';
        const isOpen = expandedPaths.has(node.fullPath);

        return (
            <li key={node.fullPath}>
                <div
                    style={{ paddingLeft: `${level * 12}px` }}
                    className={`flex justify-between items-center px-2 py-1 rounded hover:bg-gray-700 cursor-pointer ${
                        currentFile?.fullPath === node.fullPath ? 'bg-gray-700' : ''
                    }`}
                    onClick={() => {
                        if (isFolder) toggleFolder(node.fullPath);
                        else openFile(node);
                    }}
                >
          <span>
            {isFolder ? (isOpen ? '📂' : '📁') : '📄'} {node.name}
          </span>
                </div>
                {isFolder && isOpen && node.children?.length > 0 && (
                    <ul className="ml-1">
                        {node.children.map((child) => renderTree(child, level + 1))}
                    </ul>
                )}
            </li>
        );
    };

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const root = await loadFunctionTree(authFetch, functionPath);
                setFileTree(root);
                setExpandedPaths(new Set([root.fullPath]));
            } catch (err) {
                showError('Error loading file tree. Please check your connection or try again.');
            }
        };

        fetchTree();
    }, [authFetch, functionPath]);

    return (
        <>
            <div className="flex h-full text-white" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                {/* Sidebar */}
                <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-auto">
                    <h2 className="text-sm uppercase text-gray-400 mb-3">Explorer</h2>
                    <div className="text-xs text-gray-300 mb-4">
                        Path: <span className="text-yellow-400">{functionPath}</span>
                    </div>
                    <ul className="text-sm space-y-1">{fileTree && renderTree(fileTree)}</ul>
                </aside>

                {/* Main Editor Area */}
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
                            language={fileLanguage}
                            value={fileContent}
                            theme="vs-dark"
                            options={{ fontSize: 14 }}
                        />
                    </div>

                    {/* Resizer */}
                    <div className="h-2 cursor-row-resize bg-gray-700 hover:bg-gray-600" onMouseDown={handleMouseDown}></div>

                    {/* Bottom Tabs */}
                    <div
                        style={{ height: terminalHeight }}
                        className="bg-gray-950 border-t border-gray-800 rounded-t-lg shadow-inner flex flex-col"
                    >
                        <div className="flex border-b border-gray-700">
                            {['output', 'parameters'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-2 transition-colors duration-200 ${
                                        activeTab === tab
                                            ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                                            : 'bg-gray-900 text-gray-400 hover:text-white'
                                    }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 p-4 text-sm text-gray-200 overflow-auto">
                            {activeTab === 'output' && (
                                <pre className="whitespace-pre-wrap">node {currentFile?.name || ''}\n...</pre>
                            )}
                            {activeTab === 'parameters' && <p>Define input parameters here...</p>}
                        </div>
                    </div>
                </main>
            </div>

            {/* Error Modal */}
            {showErrorModal && (
                <Modal
                    title="Something went wrong"
                    confirmText="OK"
                    onConfirm={() => setShowErrorModal(false)}
                >
                    <p>{errorMessage}</p>
                </Modal>
            )}
        </>
    );
};
