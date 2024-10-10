// pages/ItemsPage.jsx
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export const ItemsPage = () => {
    const [fileSystem, setFileSystem] = useState({
        name: 'Root',
        folders: [],
        items: [],
    });
    const [currentPath, setCurrentPath] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [editingFolder, setEditingFolder] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editName, setEditName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const generateId = () => `_${Math.random().toString(36).substr(2, 9)}`;

    // Helper function to get the current directory based on the path
    const getCurrentDirectory = () => {
        let currentDir = fileSystem;
        currentPath.forEach((folderName) => {
            const folder = currentDir.folders.find(f => f.name === folderName);
            if (folder) currentDir = folder;
        });
        return currentDir;
    };

    // Create a new folder
    const handleCreateFolder = () => {
        if (newFolderName.trim() === '') return;
        const currentDir = getCurrentDirectory();

        // Check for duplication
        if (currentDir.folders.some(f => f.name === newFolderName)) {
            setError('Folder with this name already exists.');
            return;
        }

        currentDir.folders.push({name: newFolderName, folders: [], items: []});
        setFileSystem({...fileSystem});
        setNewFolderName('');
        setError('');
    };

    // Create a new item
    const handleCreateItem = () => {
        if (newItemName.trim() === '') return;
        const currentDir = getCurrentDirectory();

        // Check for duplication
        if (currentDir.items.some(i => i.name === newItemName)) {
            setError('Item with this name already exists.');
            return;
        }

        currentDir.items.push({id: generateId(), name: newItemName, schema: null});
        setFileSystem({...fileSystem});
        setNewItemName('');
        setError('');
    };

    // Navigate into a folder
    const handleNavigate = (folderName) => {
        setCurrentPath([...currentPath, folderName]);
    };

    // Navigate back
    const handleNavigateBack = () => {
        const newPath = [...currentPath];
        newPath.pop();
        setCurrentPath(newPath);
    };

    // Delete a folder
    const handleDeleteFolder = (folderName) => {
        const currentDir = getCurrentDirectory();
        currentDir.folders = currentDir.folders.filter(f => f.name !== folderName);
        setFileSystem({...fileSystem});
    };

    // Delete an item
    const handleDeleteItem = (itemId) => {
        const currentDir = getCurrentDirectory();
        currentDir.items = currentDir.items.filter(item => item.id !== itemId);
        setFileSystem({...fileSystem});
    };

    // Start renaming a folder
    const handleRenameFolder = (folderName) => {
        setEditingFolder(folderName);
        setEditName(folderName);
    };

    // Start renaming an item
    const handleRenameItem = (itemId, itemName) => {
        setEditingItem(itemId);
        setEditName(itemName);
    };

    // Confirm renaming a folder
    const confirmRenameFolder = () => {
        const currentDir = getCurrentDirectory();

        // Check for duplication
        if (currentDir.folders.some(f => f.name === editName && f.name !== editingFolder)) {
            setError('Folder with this name already exists.');
            return;
        }

        const folder = currentDir.folders.find(f => f.name === editingFolder);
        if (folder) {
            folder.name = editName;
            setFileSystem({...fileSystem});
            setEditingFolder(null);
            setEditName('');
            setError('');
        }
    };

    // Confirm renaming an item
    const confirmRenameItem = () => {
        const currentDir = getCurrentDirectory();

        // Check for duplication
        if (currentDir.items.some(i => i.name === editName && i.id !== editingItem)) {
            setError('Item with this name already exists.');
            return;
        }

        const item = currentDir.items.find(i => i.id === editingItem);
        if (item) {
            item.name = editName;
            setFileSystem({...fileSystem});
            setEditingItem(null);
            setEditName('');
            setError('');
        }
    };

    // Navigate to the Schema Builder
    const handleEditSchema = (itemId) => {
        navigate(`/items/${itemId}/schema`);
    };

    // Navigate to the Data List Page
    const handleViewData = (itemId, hasSchema) => {
        if (hasSchema) {
            navigate(`/items/${itemId}/data`);
        }
    };

    // Get the current folder's children
    const currentDir = getCurrentDirectory();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold text-white mb-4">Items Page</h1>

            <div className="mb-4">
                <button
                    className="text-white py-2 px-4 rounded bg-blue-500 hover:bg-blue-700 mr-2"
                    onClick={handleNavigateBack}
                    disabled={currentPath.length === 0}
                >
                    Back
                </button>
                <span className="text-white">{currentPath.join(' / ') || 'Root'}</span>
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-500 text-white rounded">
                    {error}
                </div>
            )}

            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
                <div className="flex-1 flex">
                    <input
                        type="text"
                        placeholder="New Folder Name"
                        className="w-full p-2 bg-gray-700 text-white rounded-l-md"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <button
                        className="py-2 px-4 bg-green-500 text-white rounded-r-md hover:bg-green-700"
                        onClick={handleCreateFolder}
                    >
                        Create Folder
                    </button>
                </div>
                <div className="flex-1 flex">
                    <input
                        type="text"
                        placeholder="New Item Name"
                        className="w-full p-2 bg-gray-700 text-white rounded-l-md"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                    />
                    <button
                        className="py-2 px-4 bg-green-500 text-white rounded-r-md hover:bg-green-700"
                        onClick={handleCreateItem}
                    >
                        Create Item
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-white font-semibold mb-2">Folders</h2>
                {currentDir.folders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {currentDir.folders.map((folder) => (
                            <div key={folder.name}
                                 className="p-4 bg-gray-700 rounded-lg flex justify-between items-center">
                                {editingFolder === folder.name ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={confirmRenameFolder}
                                        onKeyDown={(e) => e.key === 'Enter' && confirmRenameFolder()}
                                        className="bg-gray-800 text-white rounded p-2 w-full"
                                    />
                                ) : (
                                    <span
                                        className="text-blue-400 cursor-pointer hover:underline"
                                        onClick={() => handleNavigate(folder.name)}
                                    >
                                        {folder.name}
                                    </span>
                                )}
                                <div className="flex space-x-2">
                                    <button
                                        className="text-yellow-400 hover:text-yellow-600"
                                        onClick={() => handleRenameFolder(folder.name)}
                                    >
                                        Rename
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteFolder(folder.name)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No folders found.</p>
                )}

                <h2 className="text-white font-semibold mb-2">Items</h2>
                {currentDir.items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {currentDir.items.map((item) => (
                            <div key={item.id} className="p-4 bg-gray-700 rounded-lg flex flex-col space-y-2">
                                {editingItem === item.id ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={confirmRenameItem}
                                        onKeyDown={(e) => e.key === 'Enter' && confirmRenameItem()}
                                        className="bg-gray-800 text-white rounded p-2 w-full"
                                    />
                                ) : (
                                    <span className="text-white">{item.name}</span>
                                )}
                                <div className="flex space-x-2">
                                    <button
                                        className="text-yellow-400 hover:text-yellow-600"
                                        onClick={() => handleRenameItem(item.id, item.name)}
                                    >
                                        Rename
                                    </button>
                                    <button
                                        className="text-blue-400 hover:text-blue-600"
                                        onClick={() => handleEditSchema(item.id)}
                                    >
                                        Schema
                                    </button>
                                    <button
                                        className={`text-blue-400 hover:text-blue-600 ${!item.schema ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={() => handleViewData(item.id, !!item.schema)}
                                        disabled={!item.schema}
                                    >
                                        Data
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteItem(item.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No items found.</p>
                )}
            </div>
        </div>
    );
};
