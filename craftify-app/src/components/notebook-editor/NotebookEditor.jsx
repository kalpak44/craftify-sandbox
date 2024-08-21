import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { loadPyodide } from 'pyodide';
import ReactMarkdown from 'react-markdown';
import './NotebookEditor.css';

const NotebookEditor = ({ accessToken }) => {
    const [title, setTitle] = useState('Sample Notebook');
    const [cells, setCells] = useState([]);
    const [pyodide, setPyodide] = useState(null);
    const [pyodideLoading, setPyodideLoading] = useState(true);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const initializePyodide = async () => {
            const pyodideInstance = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full"
            });
            setPyodide(pyodideInstance);
            setPyodideLoading(false);
        };
        initializePyodide();

        const hardcodedNotebook = {
            title: 'Sample Notebook',
            cells: [
                {
                    id: '1',
                    type: 'markdown',
                    content: `
# Security Warning

It's important to be cautious when executing code from untrusted sources. Executing code from unsecure or unknown places can lead to security vulnerabilities, including unauthorized access to your data or system. Always ensure that the source of the code is trusted before execution.

## Access Tokens

An access token is a security credential that should not be shared with others. It is used to authenticate and authorize access to protected resources. In this example, the access token will be used to retrieve the user's product list from an API. Never expose your access token to the public or to untrusted parties, as it can be used to manipulate or retrieve sensitive data.
            `,
                    editing: false,
                },
                {
                    id: '2',
                    type: 'code',
                    content: `
# Define the access token
access_token = "${accessToken}"
`,
                    output: '',
                },
                {
                    id: '3',
                    type: 'code',
                    content: `
import pyodide.http
import json

url = '${apiBaseUrl}/products';

# Define headers with access token
headers = {
    "Authorization": "Bearer " + access_token,
    "Content-Type": "application/json"
}

# Use pyfetch to make the request with headers
response = await pyodide.http.pyfetch(url, method="GET", headers=headers)

# Parse the response as JSON
as_json = await response.json()

# Convert the JSON to formatted text
formatted_json = json.dumps(as_json, indent=4)

# Output the formatted JSON
formatted_json
`,
                    output: '',
                },
                {
                    id: '4',
                    type: 'code',
                    content: `

import pyodide.http
import json

# Define the product ID
product_id = '66b635bec9fdca2e426d81a0'

# Define the URL with the product ID
url = f'http://localhost:8080/products/{product_id}'

# Define headers with access token
headers = {
    "Authorization": "Bearer " + access_token,
    "Content-Type": "application/json"
}

# Define the JSON body
body = {
    "name": "Basil 111",
    "attributes": {
        "variety": "Genovese",
        "origin": "Italy",
        "type": "Fresh"
    },
    "measurements": {
        "weight": {
            "value": 30,
            "unit": "g"
        }
    },
    "tags": {
        "usage": "Cooking",
        "diet": "Vegan"
    },
    "availability": {
        "weight": {
            "value": 30,
            "unit": "g"
        },
        "package": {
            "value": 1,
            "unit": "count"
        }
    },
    "categories": [
        "Vegan",
        "Herb"
    ]
}

# Make the PATCH request with the provided JSON body
response = await pyodide.http.pyfetch(url, method="PATCH", headers=headers, body=json.dumps(body))

# Check response status code
response.status 

`,
                    output: '',
                },
            ],
        };

        setTitle(hardcodedNotebook.title);
        setCells(hardcodedNotebook.cells);
    }, []);

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

    const saveNotebook = () => {
        const notebookData = { title, cells };
        console.log('Saving notebook:', notebookData);
    };

    const handleClose = () => {
        console.log('Close button clicked');
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
        <div className="mt-10 relative">
            <div className="p-6 bg-gray-900 text-white rounded-lg shadow-md">
                <button
                    onClick={handleClose}
                    className="absolute top-0 right-0 m-3 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                    Close
                </button>
                <h1 className="text-3xl font-bold mb-6 text-center text-white">{title}</h1>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notebook Title"
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
                    <button
                        onClick={saveNotebook}
                        className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200"
                    >
                        Save Notebook
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotebookEditor;
