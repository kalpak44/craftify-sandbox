import {useSearchParams} from 'react-router-dom';
import {useEffect, useRef, useState} from 'react';
import Editor from '@monaco-editor/react';
import {useAuthFetch} from '../hooks/useAuthFetch';
import {getFileContent, loadFunctionTree, createFolder, deleteItem} from '../api/files';
import {Modal} from '../components/common/Modal';

export const FunctionEditorPage = () => {
    const [searchParams] = useSearchParams();
    const functionPath = searchParams.get('path') || 'unknown';
    const authFetch = useAuthFetch();

    const [activeTab, setActiveTab] = useState('output');
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(260);
    const sidebarRef = useRef(null);

    const [fileTree, setFileTree] = useState(null);
    const [expandedPaths, setExpandedPaths] = useState(new Set());
    const [currentFile, setCurrentFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [fileLanguage, setFileLanguage] = useState('javascript');

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [editingNode, setEditingNode] = useState({path: null, type: null});
    const [newItemName, setNewItemName] = useState('');

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizingSidebar(false);
    };
    const handleMouseMove = (e) => {
        if (isDragging) {
            const newHeight = window.innerHeight - e.clientY;
            setTerminalHeight(Math.max(100, Math.min(400, newHeight)));
        }
        if (isResizingSidebar) {
            const newWidth = Math.max(150, Math.min(500, e.clientX));
            setSidebarWidth(newWidth);
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
        const path = functionPath + '/' + file.fullPath;
        setCurrentFile(file);

        try {
            const content = await getFileContent(authFetch, path);
            setFileContent(content);
            const ext = path.split('.').pop();
            const langMap = {js: 'javascript', ts: 'typescript', py: 'python', json: 'json'};
            setFileLanguage(langMap[ext] || 'plaintext');
        } catch (e) {
            showError('Failed to load file content.');
            setFileContent('// Failed to load file');
            setFileLanguage('plaintext');
        }
    };

    const createNode = async () => {
        const {path, type} = editingNode;
        const name = newItemName.trim();
        if (!name || !path || !type) return;

        const fullPath = `${path}/${name}`;

        try {
            if (type === 'folder') {
                await createFolder(authFetch, fullPath);
            } else {
                const res = await authFetch(`/api/createFile`, {
                    method: 'POST',
                    body: JSON.stringify({path: fullPath})
                });
                if (!res.ok) throw new Error('Failed to create file');
            }

            await refreshTree(path);
        } catch (err) {
            showError('Failed to create item');
        } finally {
            setEditingNode({path: null, type: null});
            setNewItemName('');
        }
    };

    const removeNode = async (fullPath) => {
        try {
            await deleteItem(authFetch, functionPath + '/' + fullPath);
            await refreshTree(getParentPath(fullPath));
        } catch (err) {
            showError('Failed to delete item');
        }
    };

    const getParentPath = (fullPath) => {
        const parts = fullPath.split('/');
        parts.pop();
        return parts.join('/') || '';
    };

    const refreshTree = async (reopenPath) => {
        const updatedTree = await loadFunctionTree(authFetch, functionPath);
        setFileTree(updatedTree);
        setExpandedPaths((prev) => new Set([...prev, reopenPath]));
    };

    const renderTree = (node, level = 0) => {
        if (!node) return null;
        const isFolder = node.type === 'FOLDER' || node.type === 'FUNCTION';
        const isOpen = expandedPaths.has(node.fullPath);

        return (
            <li key={node.fullPath}>
                <div
                    style={{paddingLeft: `${level * 12}px`}}
                    className={`group flex justify-between items-center px-2 py-1 rounded hover:bg-gray-700 cursor-pointer ${
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
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                        {isFolder && (
                            <>
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingNode({path: node.fullPath, type: 'file'});
                                    setNewItemName('');
                                }} className="text-xs text-blue-400 hover:text-blue-600">📄+
                                </button>
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingNode({path: node.fullPath, type: 'folder'});
                                    setNewItemName('');
                                }} className="text-xs text-green-400 hover:text-green-600">📁+
                                </button>
                            </>
                        )}
                        <button onClick={(e) => {
                            e.stopPropagation();
                            removeNode(node.fullPath);
                        }} className="text-xs text-red-400 hover:text-red-600">🗑️
                        </button>
                    </div>
                </div>

                {editingNode.path === node.fullPath && (
                    <div className="pl-4 py-1 flex items-center gap-1">
                        <input
                            autoFocus
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onBlur={createNode}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    await createNode();
                                } else if (e.key === 'Escape') {
                                    setEditingNode({path: null, type: null});
                                    setNewItemName('');
                                }
                            }}
                            className="bg-gray-700 text-white px-2 py-0.5 text-sm rounded border border-gray-600"
                            placeholder={`New ${editingNode.type}`}
                        />
                    </div>
                )}

                {isFolder && isOpen && node.children?.length > 0 && (
                    <ul className="ml-1">
                        {node.children.map((child) => renderTree(child, level + 1))}
                    </ul>
                )}
            </li>
        );
    };

    useEffect(() => {
        refreshTree('');
    }, [authFetch, functionPath]);

    return (
        <>
            <div className="flex h-full text-white" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                <aside
                    ref={sidebarRef}
                    style={{width: sidebarWidth}}
                    className="bg-gray-800 border-r border-gray-700 p-4 overflow-auto relative"
                >
                    <h2 className="text-sm uppercase text-gray-400 mb-3">Explorer</h2>
                    <div className="text-xs text-gray-300 mb-4">
                        Path: <span className="text-yellow-400">{functionPath}</span>
                    </div>
                    <ul className="text-sm space-y-1">{fileTree && renderTree(fileTree)}</ul>
                    <div
                        className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-transparent"
                        onMouseDown={() => setIsResizingSidebar(true)}
                    />
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
                            language={fileLanguage}
                            value={fileContent}
                            theme="vs-dark"
                            options={{fontSize: 14}}
                        />
                    </div>

                    <div className="h-2 cursor-row-resize bg-gray-700 hover:bg-gray-600"
                         onMouseDown={handleMouseDown}></div>

                    <div style={{height: terminalHeight}}
                         className="bg-gray-950 border-t border-gray-800 rounded-t-lg shadow-inner flex flex-col">
                        <div className="flex border-b border-gray-700">
                            {['output', 'parameters'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-2 transition-colors duration-200 ${activeTab === tab ? 'bg-gray-800 text-white border-b-2 border-blue-500' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 p-4 text-sm text-gray-200 overflow-auto">
                            {activeTab === 'output' && (
                                <pre className="whitespace-pre-wrap">node {currentFile?.name || ''}\n...</pre>)}
                            {activeTab === 'parameters' && <p>Define input parameters here...</p>}
                        </div>
                    </div>
                </main>
            </div>

            {showErrorModal && (
                <Modal title="Something went wrong" confirmText="OK" onConfirm={() => setShowErrorModal(false)}>
                    <p>{errorMessage}</p>
                </Modal>
            )}
        </>
    );
};
