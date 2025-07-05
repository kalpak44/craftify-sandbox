import { useEffect, useState } from "react";

export const FilesPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState(["root"]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState(null); // 'new-file', 'new-folder', 'rename'
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        const mockResponse = {
            activeFolder: "root",
            folders: [
                {
                    name: "root",
                    children: [
                        { name: "dir1", children: [{ name: "sub1", children: [] }] },
                        { name: "ddir", children: [] },
                        { name: "drl1", children: [] },
                        { name: "dd3", children: [] }
                    ]
                }
            ],
            files: [
                { name: "data.csv", size: "1,2 KB", modified: "today", type: "file" },
                { name: "example.py", size: "803 bytes", modified: "today", type: "file" },
                { name: "report.txt", size: "2,5 KB", modified: "today", type: "file" },
                { name: "data.json", size: "657 bytes", modified: "today", type: "file" },
                { name: "diagram.png", size: "3,1 MB", modified: "yesterday", type: "file" },
                { name: "drafts", size: "-", modified: "2 days ago", type: "folder" },
                { name: "uploads", size: "-", modified: "3 days ago", type: "folder" }
            ]
        };

        setTimeout(() => {
            setData(mockResponse);
            setLoading(false);
        }, 1000);
    }, []);

    const toggleFolder = (folderName) => {
        setExpandedFolders((prev) =>
            prev.includes(folderName)
                ? prev.filter((f) => f !== folderName)
                : [...prev, folderName]
        );
    };

    const renderTree = (nodes) => (
        <ul className="ml-2 space-y-1">
            {nodes.map((folder) => {
                const isOpen = expandedFolders.includes(folder.name);
                return (
                    <li key={folder.name}>
                        <div
                            onClick={() => toggleFolder(folder.name)}
                            className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700 text-gray-300"
                        >
                            <span className="mr-1">{isOpen ? "📂" : "📁"}</span>
                            {folder.name}
                        </div>
                        {isOpen && folder.children.length > 0 && renderTree(folder.children)}
                    </li>
                );
            })}
        </ul>
    );

    const openModal = (mode) => {
        setModalMode(mode);
        setInputValue(mode === "rename" && selectedFile ? selectedFile.name : "");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setInputValue("");
        setModalMode(null);
    };

    const handleSubmit = () => {
        if (!inputValue.trim()) return;
        if (modalMode === "new-file") {
            alert(`Create new file: ${inputValue}`);
        } else if (modalMode === "new-folder") {
            alert(`Create new folder: ${inputValue}`);
        } else if (modalMode === "rename") {
            alert(`Rename ${selectedFile.name} to ${inputValue}`);
        }
        closeModal();
    };

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-full text-white text-lg">
                Loading files...
            </div>
        );
    }

    return (
        <div className="flex h-full text-white">
            {/* Sidebar Folder Tree */}
            <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-auto">
                <h2 className="text-sm uppercase text-gray-400 mb-3">Explorer</h2>
                {renderTree(data.folders)}
            </aside>

            {/* Main File View */}
            <main className="flex-1 bg-gray-900 p-6 overflow-auto">
                <div className="flex justify-between mb-4 items-center">
                    <h1 className="text-lg font-semibold">Files</h1>
                    <div className="space-x-2 flex items-center">
                        <button
                            onClick={() => openModal("new-file")}
                            className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                            New File
                        </button>
                        <button
                            onClick={() => openModal("new-folder")}
                            className="bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                            New Folder
                        </button>
                        {selectedFile && (
                            <button
                                onClick={() => openModal("rename")}
                                className="bg-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-700"
                            >
                                Rename
                            </button>
                        )}
                        {selectedFile && selectedFile.type === "file" && (
                            <button
                                onClick={() => alert(`Editing ${selectedFile.name}`)}
                                className="bg-yellow-600 px-3 py-1 rounded text-sm hover:bg-yellow-700"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                <table className="w-full text-sm text-left">
                    <thead className="text-gray-400 border-b border-gray-700">
                    <tr>
                        <th className="py-2 px-3 font-medium">Name</th>
                        <th className="py-2 px-3 font-medium">Size</th>
                        <th className="py-2 px-3 font-medium">Last Modified</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.files.map((item, i) => {
                        const isSelected = selectedFile?.name === item.name;
                        return (
                            <tr
                                key={i}
                                onClick={() => setSelectedFile(item)}
                                className={`cursor-pointer ${
                                    isSelected ? "bg-gray-700" : "hover:bg-gray-800"
                                }`}
                            >
                                <td className="py-2 px-3">
                    <span className="mr-2">
                      {item.type === "folder" ? "📁" : "📄"}
                    </span>
                                    {item.name}
                                </td>
                                <td className="py-2 px-3 text-gray-300">{item.size}</td>
                                <td className="py-2 px-3 text-gray-400">{item.modified}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm border border-gray-600">
                        <h2 className="text-lg font-semibold mb-4 capitalize">
                            {modalMode === "rename" ? "Rename" : modalMode === "new-file" ? "New File" : "New Folder"}
                        </h2>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Enter name"
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded outline-none mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeModal} className="px-4 py-1 bg-gray-600 rounded hover:bg-gray-500">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
