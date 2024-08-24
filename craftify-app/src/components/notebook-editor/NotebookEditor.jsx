import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { loadPyodide } from 'pyodide';
import ReactMarkdown from 'react-markdown';
import './NotebookEditor.css';

const NotebookEditor = ({ notebook, accessToken, onUpdateNotebook }) => {
    const [name, setName] = useState(notebook?.name || 'New Notebook');
    const [cells, setCells] = useState(notebook?.cells || []);
    const [pyodide, setPyodide] = useState(null);
    const [pyodideLoading, setPyodideLoading] = useState(true);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    const predefinedCode = `
    import pyodide.http
    import json
    import urllib.parse

    async def get_product_list(page=0, size=5, name=None, tags=None, categories=None):
        url = f'${apiBaseUrl}/products?page={page}&size={size}'
        
        if name:
            # Encode the name parameter as a query parameter
            url += f'&name={urllib.parse.quote(name)}'
            
        if tags:
            # Encode the tags dictionary as query parameters
            tags_query = urllib.parse.urlencode({'tags[' + k + ']': v for k, v in tags.items()})
            url += f'&{tags_query}'
        
        if categories:
            # Encode the categories list as repeated query parameters
            categories_query = '&'.join([f'categories={urllib.parse.quote(category)}' for category in categories])
            url += f'&{categories_query}'
        
        headers = {
            "Authorization": f"Bearer ${accessToken}",
            "Content-Type": "application/json"
        }
        
        response = await pyodide.http.pyfetch(url, method="GET", headers=headers)
        return await response.json()

        
    async def create_product(product_data):
        url = f'${apiBaseUrl}/products'
        
        headers = {
            "Authorization": f"Bearer ${accessToken}",
            "Content-Type": "application/json"
        }
        
        response = await pyodide.http.pyfetch(url, method="POST", headers=headers, body=json.dumps(product_data))
        return await response.json()

    async def update_product(product_id, update_data):
        url = f'${apiBaseUrl}/products/{product_id}'
        
        headers = {
            "Authorization": f"Bearer ${accessToken}",
            "Content-Type": "application/json"
        }
        
        response = await pyodide.http.pyfetch(url, method="PATCH", headers=headers, body=json.dumps(update_data))
        return await response.json()

    async def delete_product(product_id):
        url = f'${apiBaseUrl}/products/{product_id}'
        
        headers = {
            "Authorization": f"Bearer ${accessToken}",
            "Content-Type": "application/json"
        }
        
        response = await pyodide.http.pyfetch(url, method="DELETE", headers=headers)
        
        if response.status == 200:
            return {"status": "success", "message": f"Product {product_id} deleted successfully"}
        else:
            return {"status": "error", "message": f"Failed to delete product {product_id}", "details": await response.json()}

    `;

    useEffect(() => {
        const initializePyodide = async () => {
            const pyodideInstance = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full"
            });
            setPyodide(pyodideInstance);
            setPyodideLoading(false);
        };
        initializePyodide();

        if (notebook) {
            setName(notebook.name);
            setCells(notebook.cells);
        }
    }, [notebook]);

    useEffect(() => {
        onUpdateNotebook({ name, cells });
    }, [name, cells, onUpdateNotebook]);

    const addCell = (type) => {
        const newCell = { id: Date.now().toString(), type, content: type === 'code' ? '' : '### New Markdown Cell', output: '', editing: false };
        setCells([...cells, newCell]);
    };

    const updateCell = (id, content) => {
        setCells(cells.map(cell =>
            cell.id === id ? { ...cell, content } : cell
        ));
    };

    const toggleMarkdownEdit = (id) => {
        setCells(cells.map(cell =>
            cell.id === id ? { ...cell, editing: !cell.editing } : cell
        ));
    };

    const removeCell = (id) => {
        setCells(cells.filter(cell => cell.id !== id));
    };

    const runCodeUpToIndex = async (index) => {
        let newCells = [...cells];
        if (newCells.some(cell => cell.type === 'code')) {
            await pyodide.runPythonAsync(predefinedCode);
        }
        for (let i = 0; i <= index; i++) {
            if (newCells[i].type === 'code') {
                try {
                    if (pyodide) {
                        const output = await pyodide.runPythonAsync(newCells[i].content);
                        newCells[i].output = output;
                    }
                } catch (error) {
                    newCells[i].output = error.message;
                }
            }
        }
        setCells(newCells);
    };

    const markdownRefs = useRef([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            markdownRefs.current.forEach((ref, index) => {
                if (ref && !ref.contains(event.target) && cells[index]?.editing) {
                    toggleMarkdownEdit(cells[index].id);
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [cells]);

    const moveCellUp = (index) => {
        if (index === 0) return; // Already at the top
        const newCells = [...cells];
        const temp = newCells[index - 1];
        newCells[index - 1] = newCells[index];
        newCells[index] = temp;
        setCells(newCells);
    };

    const moveCellDown = (index) => {
        if (index === cells.length - 1) return; // Already at the bottom
        const newCells = [...cells];
        const temp = newCells[index + 1];
        newCells[index + 1] = newCells[index];
        newCells[index] = temp;
        setCells(newCells);
    };

    const [expandedOutputs, setExpandedOutputs] = useState({});

    const toggleOutputExpansion = (id) => {
        setExpandedOutputs((prevExpandedOutputs) => ({
            ...prevExpandedOutputs,
            [id]: !prevExpandedOutputs[id],
        }));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-center text-white">{name}</h1>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Notebook Name"
                className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white mb-5"
            />
            <div>
                {cells.map((cell, index) => (
                    <div
                        key={cell.id}
                        className="mb-6 border border-gray-400 rounded-lg p-4 bg-gray-800"
                    >
                        {cell.type === 'code' ? (
                            <>
                                <MonacoEditor
                                    height="200px"
                                    language="python"
                                    theme="vs-dark"
                                    value={cell.content}
                                    onChange={(value) => updateCell(cell.id, value)}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        lineNumbers: "on",
                                    }}
                                    className="mb-4 h-auto border border-gray-600 rounded-lg"
                                />
                                <div className="flex items-center space-x-2 mb-2">
                                    <button
                                        onClick={() => runCodeUpToIndex(index)}
                                        className={`px-4 py-2 text-white font-semibold rounded-lg transition-colors duration-200 ${
                                            pyodideLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                                        }`}
                                        disabled={pyodideLoading}
                                    >
                                        {pyodideLoading ? 'Loading Pyodide...' : 'Run'}
                                    </button>
                                    <button
                                        onClick={() => removeCell(cell.id)}
                                        className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => moveCellUp(index)}
                                        className="px-2 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => moveCellDown(index)}
                                        className="px-2 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        ↓
                                    </button>
                                </div>
                                <div className="mt-4 p-3 bg-gray-700 text-sm rounded-lg border border-gray-600 overflow-x-auto" style={{ maxHeight: expandedOutputs[cell.id] ? 'none' : '160px' }}>
                                    <pre>{cell.output}</pre>
                                </div>
                                <button
                                    onClick={() => toggleOutputExpansion(cell.id)}
                                    className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                                >
                                    {expandedOutputs[cell.id] ? 'Collapse' : 'Expand'}
                                </button>
                            </>
                        ) : (
                            <>
                                {cell.editing ? (
                                    <div ref={(el) => (markdownRefs.current[index] = el)}>
                                        <MonacoEditor
                                            height="150px"
                                            language="markdown"
                                            theme="vs-dark"
                                            value={cell.content}
                                            onChange={(value) => updateCell(cell.id, value)}
                                            options={{
                                                fontSize: 14,
                                                minimap: { enabled: false },
                                                lineNumbers: false,
                                            }}
                                            className="mb-4 h-auto border border-gray-600 rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        ref={(el) => (markdownRefs.current[index] = el)}
                                        onDoubleClick={() => toggleMarkdownEdit(cell.id)}
                                        className="markdown-body cursor-pointer"
                                    >
                                        <ReactMarkdown>{cell.content}</ReactMarkdown>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2 mb-2 mt-2">
                                    <button
                                        onClick={() => removeCell(cell.id)}
                                        className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => moveCellUp(index)}
                                        className="px-2 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => moveCellDown(index)}
                                        className="px-2 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        ↓
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-6">
                <button
                    onClick={() => addCell('code')}
                    className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                    Add Python Cell
                </button>
                <button
                    onClick={() => addCell('markdown')}
                    className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                >
                    Add Markdown Cell
                </button>
            </div>
        </div>
    );
};

export default NotebookEditor;
