import { useEffect, useState } from 'react';
import { createFolder, deleteItem, downloadItem, listFiles, renameItem, uploadFile } from '../api/files';
import { Loader } from '../components/common/Loader';
import { Modal } from '../components/common/Modal';
import { useAuthFetch } from '../hooks/useAuthFetch';

export const FilesPage = () => {
    const authFetch = useAuthFetch();

    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [currentFolder, setCurrentFolder] = useState('');
    const [, setFolderStack] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const [createName, setCreateName] = useState('');
    const [renameName, setRenameName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchFiles(currentFolder);
    }, [currentFolder]);

    const fetchFiles = async (folder = '') => {
        setLoading(true);
        try {
            const data = await listFiles(authFetch, folder);
            setFiles(data);
        } catch (e) {
            showError('Unable to load files. Please try again or refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    const isValidName = (name) =>
        /^[^<>:"/\\|?*\x00-\x1F]+$/.test(name.trim()) && name.trim().length > 0;

    const goBack = () => {
        setFolderStack((prevStack) => {
            const newStack = [...prevStack];
            const prev = newStack.pop() || '';
            setCurrentFolder(prev);
            return newStack;
        });
        setSelectedItem(null);
    };

    const openFolder = (item) => {
        setFolderStack((prev) => [...prev, currentFolder]);
        setCurrentFolder(item.fullPath.endsWith('/') ? item.fullPath : `${item.fullPath}/`);
        setSelectedItem(null);
    };

    const handleUpload = (file) => {
        setLoading(true);
        uploadFile(authFetch, currentFolder, file)
            .then(() => fetchFiles(currentFolder))
            .catch(() => showError('Failed to upload file. Please try again.'))
            .finally(() => setLoading(false));
    };

    const confirmCreateFolder = async () => {
        const trimmed = createName.trim();
        if (!isValidName(trimmed)) {
            showError('Invalid folder name. Please avoid special characters and empty names.');
            return;
        }
        setLoading(true);
        try {
            await createFolder(authFetch, `${currentFolder}${trimmed}/`);
            await fetchFiles(currentFolder);
        } catch {
            showError('Could not create the folder. Please try again.');
        } finally {
            setLoading(false);
            setShowCreateModal(false);
            setCreateName('');
        }
    };

    const confirmRename = async () => {
        if (!selectedItem) return;
        const trimmed = renameName.trim();
        setLoading(true);
        try {
            const from = selectedItem.fullPath;
            const to = `${currentFolder}${trimmed}${selectedItem.type === 'FOLDER' ? '/' : ''}`;
            await renameItem(authFetch, from, to);
            await fetchFiles(currentFolder);
        } catch {
            showError('Renaming failed. Please make sure the name is valid and try again.');
        } finally {
            setLoading(false);
            setShowRenameModal(false);
            setRenameName('');
            setSelectedItem(null);
        }
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        setLoading(true);
        try {
            await deleteItem(authFetch, selectedItem.fullPath);
            await fetchFiles(currentFolder);
            setSelectedItem(null);
        } catch {
            showError('Failed to delete item. It may be in use or protected.');
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const triggerDownload = () => {
        if (selectedItem?.fullPath) {
            downloadItem(authFetch, selectedItem.fullPath).catch(() =>
                showError('Download failed. Please try again.')
            );
        }
    };

    if (loading) return <Loader text="Loading files..." />;

    return (
        <div className="flex h-full text-white">
            <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-auto">
                <h2 className="text-sm uppercase text-gray-400 mb-3">Explorer</h2>
                <p className="text-gray-500 text-xs">Static (mock) tree here</p>
            </aside>

            <main className="flex-1 bg-gray-900 p-6 overflow-auto">
                <div className="flex justify-between mb-4 items-center">
                    <div>
                        <h1 className="text-lg font-semibold">Folder: {currentFolder || 'root'}</h1>
                        {currentFolder && (
                            <button onClick={goBack} className="mt-1 text-sm text-blue-400 hover:underline">
                                ← Go Back
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        <label className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700 cursor-pointer">
                            Upload
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleUpload(e.target.files[0])}
                            />
                        </label>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                            New Folder
                        </button>

                        {selectedItem && (
                            <>
                                {selectedItem.type === 'FILE' && (
                                    <button
                                        onClick={triggerDownload}
                                        className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-700"
                                    >
                                        Download
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setRenameName(selectedItem.name);
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
                                {selectedItem.type === 'FOLDER' && (
                                    <button
                                        onClick={() => openFolder(selectedItem)}
                                        className="bg-yellow-600 px-3 py-1 rounded text-sm hover:bg-yellow-700"
                                    >
                                        Open
                                    </button>
                                )}
                            </>
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
                    {files.map((item, i) => {
                        const isSelected = selectedItem?.fullPath === item.fullPath;
                        return (
                            <tr
                                key={i}
                                onClick={() => setSelectedItem(item)}
                                onDoubleClick={() => item.type === 'FOLDER' && openFolder(item)}
                                className={`cursor-pointer ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                            >
                                <td className="py-2 px-3">
                                    <span className="mr-2">{item.type === 'FOLDER' ? '📁' : '📄'}</span>
                                    {item.name}
                                </td>
                                <td className="py-2 px-3 text-gray-300">
                                    {item.type === 'FOLDER' ? '-' : `${(item.size / 1024).toFixed(1)} KB`}
                                </td>
                                <td className="py-2 px-3 text-gray-400">
                                    {new Date(item.lastModified).toLocaleString()}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </main>

            {/* Modals */}
            {showCreateModal && (
                <Modal
                    title="Create New Folder"
                    onCancel={() => {
                        setShowCreateModal(false);
                        setCreateName('');
                    }}
                    onConfirm={confirmCreateFolder}
                    confirmText="Create"
                >
                    <input
                        type="text"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="Enter a name for the new folder"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded outline-none"
                        autoFocus
                    />
                </Modal>
            )}

            {showRenameModal && (
                <Modal
                    title="Rename Item"
                    onCancel={() => {
                        setShowRenameModal(false);
                        setRenameName('');
                    }}
                    onConfirm={confirmRename}
                    confirmText="Rename"
                >
                    <input
                        type="text"
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                        placeholder="Enter the new name"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded outline-none"
                        autoFocus
                    />
                </Modal>
            )}

            {showDeleteModal && (
                <Modal
                    title="Confirm Deletion"
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    confirmText="Delete"
                >
                    Are you sure you want to permanently delete{' '}
                    <strong>{selectedItem?.name}</strong>?
                </Modal>
            )}

            {showErrorModal && (
                <Modal title="Something went wrong" onConfirm={() => setShowErrorModal(false)} confirmText="OK">
                    <p>{errorMessage}</p>
                </Modal>
            )}
        </div>
    );
};
