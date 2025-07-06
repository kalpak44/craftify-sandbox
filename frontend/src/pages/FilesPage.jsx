import {useEffect, useState} from "react";

const API_URL = "http://localhost:8080/files";
const TOKEN = localStorage.getItem("access_token");

export const FilesPage = () => {
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [currentFolder, setCurrentFolder] = useState("/");
    const [folderStack, setFolderStack] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [renameInput, setRenameInput] = useState("");
    const [creatingFolder, setCreatingFolder] = useState(false);

    const fetchFiles = async (folder = "") => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/list?folder=${encodeURIComponent(folder)}`, {
                headers: {Authorization: `Bearer ${TOKEN}`}
            });
            const json = await res.json();
            setFiles(json);
        } catch (e) {
            console.error("Failed to fetch files:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentFolder);
    }, [currentFolder]);

    const goBack = () => {
        const newStack = [...folderStack];
        const previous = newStack.pop();
        setFolderStack(newStack);
        setCurrentFolder(previous || "");
        setSelectedItem(null);
    };

    const handleDoubleClick = (item) => {
        if (item.type === "FOLDER") {
            setFolderStack([...folderStack, currentFolder]);
            setCurrentFolder(item.fullPath.endsWith("/") ? item.fullPath : item.fullPath + "/");
            setSelectedItem(null);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            await fetch(`${API_URL}/upload?folder=${encodeURIComponent(currentFolder)}`, {
                method: "POST",
                headers: {Authorization: `Bearer ${TOKEN}`},
                body: formData
            });
            fetchFiles(currentFolder);
        } catch (e) {
            alert("Upload failed.");
        }
    };

    const handleCreateFolder = async () => {
        if (!renameInput.trim()) return;
        try {
            await fetch(`${API_URL}/mkdir?folder=${encodeURIComponent(currentFolder + renameInput + "/")}`, {
                method: "POST",
                headers: {Authorization: `Bearer ${TOKEN}`}
            });
            fetchFiles(currentFolder);
            setCreatingFolder(false);
            setRenameInput("");
        } catch (e) {
            alert("Failed to create folder.");
        }
    };

    const handleRename = async () => {
        const from = selectedItem.fullPath;
        const to =
            currentFolder +
            renameInput +
            (selectedItem.type === "FOLDER" ? "/" : "");
        try {
            await fetch(
                `${API_URL}/move?fromPath=${encodeURIComponent(from)}&toPath=${encodeURIComponent(to)}`,
                {
                    method: "POST",
                    headers: {Authorization: `Bearer ${TOKEN}`}
                }
            );
            fetchFiles(currentFolder);
            setShowRenameModal(false);
            setRenameInput("");
            setSelectedItem(null);
        } catch (e) {
            alert("Rename failed.");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/delete?path=${encodeURIComponent(selectedItem.fullPath)}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${TOKEN}`}
            });
            fetchFiles(currentFolder);
            setShowDeleteModal(false);
            setSelectedItem(null);
        } catch (e) {
            alert("Delete failed.");
        }
    };

    const handleDownload = async (path) => {
        try {
            const res = await fetch(`${API_URL}/download?fullPath=${encodeURIComponent(path)}`, {
                headers: {Authorization: `Bearer ${TOKEN}`}
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = path.split("/").pop();
            link.click();
        } catch (e) {
            alert("Download failed.");
        }
    };

    return (
        <div className="flex h-full text-white">
            <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-auto">
                <h2 className="text-sm uppercase text-gray-400 mb-3">Explorer</h2>
                <p className="text-gray-500 text-xs">Static (mock) tree here</p>
            </aside>

            <main className="flex-1 bg-gray-900 p-6 overflow-auto">
                <div className="flex justify-between mb-4 items-center">
                    <div>
                        <h1 className="text-lg font-semibold">
                            Folder: {currentFolder || "root"}
                        </h1>
                        {currentFolder && (
                            <button
                                onClick={goBack}
                                className="mt-1 text-sm text-blue-400 hover:underline"
                            >
                                ← Go Back
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
                        <label className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700 cursor-pointer">
                            Upload
                            <input type="file" className="hidden" onChange={handleUpload}/>
                        </label>
                        <button
                            onClick={() => {
                                setCreatingFolder(true);
                                setRenameInput("");
                            }}
                            className="bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                            New Folder
                        </button>
                        {selectedItem && (
                            <>
                                {selectedItem.type === "FILE" && (
                                    <button
                                        onClick={() => handleDownload(selectedItem.fullPath)}
                                        className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-700"
                                    >
                                        Download
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setRenameInput(selectedItem.name);
                                        setShowRenameModal(true);
                                    }}
                                    className="bg-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-700"
                                >
                                    Rename
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                    Delete
                                </button>
                                {selectedItem.type === "FOLDER" && (
                                    <button
                                        onClick={() => handleDoubleClick(selectedItem)}
                                        className="bg-yellow-600 px-3 py-1 rounded text-sm hover:bg-yellow-700"
                                    >
                                        Open
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400 text-lg">Loading...</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                            <th className="py-2 px-3 font-medium">Name</th>
                            <th className="py-2 px-3 font-medium">Size</th>
                            <th className="py-2 px-3 font-medium">Last Modified</th>
                        </tr>
                        </thead>
                        <tbody>
                        {files.map((item, i) => {
                            const isSelected = selectedItem?.fullPath === item.fullPath;
                            return (
                                <tr
                                    key={i}
                                    onClick={() => setSelectedItem(item)}
                                    onDoubleClick={() => handleDoubleClick(item)}
                                    className={`cursor-pointer ${
                                        isSelected ? "bg-gray-700" : "hover:bg-gray-800"
                                    }`}
                                >
                                    <td className="py-2 px-3">
                                            <span className="mr-2">
                                                {item.type === "FOLDER" ? "📁" : "📄"}
                                            </span>
                                        {item.name}
                                    </td>
                                    <td className="py-2 px-3 text-gray-300">
                                        {item.type === "FOLDER"
                                            ? "-"
                                            : `${(item.size / 1024).toFixed(1)} KB`}
                                    </td>
                                    <td className="py-2 px-3 text-gray-400">
                                        {new Date(item.lastModified).toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </main>

            {/* Rename Modal */}
            {(showRenameModal || creatingFolder) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm border border-gray-600">
                        <h2 className="text-lg font-semibold mb-4">
                            {creatingFolder ? "Create New Folder" : "Rename"}
                        </h2>
                        <input
                            type="text"
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            placeholder="Enter name"
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded outline-none mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setCreatingFolder(false);
                                    setShowRenameModal(false);
                                    setRenameInput("");
                                }}
                                className="px-4 py-1 bg-gray-600 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={creatingFolder ? handleCreateFolder : handleRename}
                                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-sm border border-gray-600">
                        <h2 className="text-lg font-semibold mb-4">Delete Confirmation</h2>
                        <p className="mb-4">
                            Are you sure you want to delete <strong>{selectedItem?.name}</strong>?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-1 bg-gray-600 rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
