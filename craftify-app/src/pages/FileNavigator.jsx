import React, { useEffect, useState, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
    listFolders as apiListFolders,
    createFolder as apiCreateFolder,
    deleteFolder as apiDeleteFolder,
    renameFolder as apiRenameFolder,
    moveFolder as apiMoveFolder,
    toggleFavorite as apiToggleFavorite
} from "../services/API";
import Breadcrumbs from "../components/file-navigator/Breadcrumbs";
import FolderItem from "../components/file-navigator/FolderItem";
import ContextMenu from "../components/file-navigator/ContextMenu";
import FolderDialog from "../components/file-navigator/FolderDialog";

export default function FileNavigator({ userId, navigateToFolder, onFavoriteToggled }) {
    const { getAccessTokenSilently } = useAuth0();
    const [currentFolder, setCurrentFolder] = useState(null); // null = root
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [error, setError] = useState("");
    const [path, setPath] = useState([]); // breadcrumb
    const [contextMenu, setContextMenu] = useState(null); // {x, y, type, item}
    const contextMenuRef = useRef();
    const prevNavigateToFolder = useRef(null);
    const [dialog, setDialog] = useState({ open: false, type: null, item: null, defaultValue: "" });

    useEffect(() => {
        fetchItems(currentFolder);
        // eslint-disable-next-line
    }, [currentFolder]);

    useEffect(() => {
        function handleClick() { setContextMenu(null); }
        function handleScroll() { setContextMenu(null); }
        function handleResize() { setContextMenu(null); }
        window.addEventListener("click", handleClick);
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Handle navigation to a folder from outside (e.g., favorite click)
    useEffect(() => {
        if (navigateToFolder && navigateToFolder !== prevNavigateToFolder.current) {
            setCurrentFolder(navigateToFolder);
            setPath([]); // Optionally, fetch and set the real path if needed
            prevNavigateToFolder.current = navigateToFolder;
        }
    }, [navigateToFolder]);

    async function fetchItems(parentId) {
        setLoading(true);
        setError("");
        try {
            const accessToken = await getAccessTokenSilently();
            const data = await apiListFolders(accessToken, parentId);
            setItems(data.map(item => ({ ...item, isFavorite: item.favorite })));
        } catch (e) {
            setError("Failed to load folders: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    async function createFolder(name) {
        if (!name || !name.trim()) return;
        if (items.some(item => item.name.trim().toLowerCase() === name.trim().toLowerCase())) {
            setError(`A folder named '${name}' already exists here.`);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const accessToken = await getAccessTokenSilently();
            await apiCreateFolder(accessToken, { name, parentId: currentFolder });
            fetchItems(currentFolder);
        } catch (e) {
            setError("Failed to create folder: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    function openFolder(folder) {
        setPath(prev => [...prev, { id: folder.id, name: folder.name }]);
        setCurrentFolder(folder.id);
    }

    function goToBreadcrumb(idx) {
        if (idx === -1) {
            setCurrentFolder(null);
            setPath([]);
        } else {
            setCurrentFolder(path[idx].id);
            setPath(path.slice(0, idx + 1));
        }
    }

    async function toggleFavorite(item) {
        setError("");
        try {
            const accessToken = await getAccessTokenSilently();
            await apiToggleFavorite(accessToken, item.id);
            fetchItems(currentFolder);
            if (onFavoriteToggled) onFavoriteToggled();
        } catch (e) {
            setError("Failed to toggle favorite: " + e.message);
        }
    }

    async function deleteFolder(item) {
        setDialog({ open: true, type: "delete", item });
    }

    async function renameFolder(item) {
        setDialog({ open: true, type: "rename", item, defaultValue: item.name });
    }

    async function moveFolder(item) {
        setDialog({ open: true, type: "move", item, defaultValue: item.parentId || "" });
    }

    function handleFolderContextMenu(e, item) {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type: "folder",
            item
        });
    }

    function handleBackgroundContextMenu(e) {
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type: "background"
        });
    }

    function handleContextMenuAction(action, item) {
        setContextMenu(null);
        switch (action) {
            case "open":
                openFolder(item);
                break;
            case "rename":
                renameFolder(item);
                break;
            case "move":
                moveFolder(item);
                break;
            case "delete":
                deleteFolder(item);
                break;
            case "favorite":
                toggleFavorite(item);
                break;
            case "create":
                setDialog({ open: true, type: "create", item: null, defaultValue: "" });
                break;
            default:
                break;
        }
    }

    function handleDialogCancel() {
        setDialog({ open: false, type: null, item: null, defaultValue: "" });
    }

    async function handleDialogConfirm(value) {
        if (dialog.type === "create") {
            await createFolder(value);
        } else if (dialog.type === "rename") {
            if (!value || value === dialog.item.name) return handleDialogCancel();
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                await apiRenameFolder(accessToken, dialog.item.id, value);
                fetchItems(currentFolder);
            } catch (e) {
                setError("Failed to rename folder: " + e.message);
            } finally {
                setLoading(false);
            }
        } else if (dialog.type === "move") {
            if (value === dialog.item.parentId) return handleDialogCancel();
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                await apiMoveFolder(accessToken, dialog.item.id, value);
                fetchItems(currentFolder);
            } catch (e) {
                setError("Failed to move folder: " + e.message);
            } finally {
                setLoading(false);
            }
        } else if (dialog.type === "delete") {
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                await apiDeleteFolder(accessToken, dialog.item.id);
                fetchItems(currentFolder);
                if (onFavoriteToggled) onFavoriteToggled();
            } catch (e) {
                setError("Failed to delete folder: " + e.message);
            } finally {
                setLoading(false);
            }
        }
        handleDialogCancel();
    }

    return (
        <div
            className="w-full h-full p-8 relative"
            style={{ background: '#1F2836' }}
            onContextMenu={e => { e.preventDefault(); handleBackgroundContextMenu(e); }}
        >
            <Breadcrumbs path={path} goToBreadcrumb={goToBreadcrumb} />
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <div
                className="bg-gray-800 rounded p-6 min-h-[300px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                style={{ position: 'relative' }}
                onContextMenu={e => { e.preventDefault(); handleBackgroundContextMenu(e); }}
            >
                {loading ? (
                    <div className="text-gray-400 col-span-full">Loading...</div>
                ) : (
                    <>
                        {currentFolder !== null && (
                            <FolderItem
                                key=".."
                                item={{ id: "..", name: "..", isFavorite: false }}
                                openFolder={() => goToBreadcrumb(path.length - 2 >= 0 ? path.length - 2 : -1)}
                                handleFolderContextMenu={() => {}}
                            />
                        )}
                        {items.length > 0 && items.map(item => (
                            <FolderItem
                                key={item.id}
                                item={item}
                                openFolder={openFolder}
                                handleFolderContextMenu={handleFolderContextMenu}
                            />
                        ))}
                        {items.length === 0 && currentFolder === null && (
                            <div className="text-gray-400 col-span-full" onContextMenu={e => { e.preventDefault(); handleBackgroundContextMenu(e); }}>No folders.</div>
                        )}
                    </>
                )}
            </div>
            <ContextMenu
                contextMenu={contextMenu}
                contextMenuRef={contextMenuRef}
                handleContextMenuAction={handleContextMenuAction}
            />
            <FolderDialog
                open={dialog.open && dialog.type === "create"}
                title="Create New Folder"
                defaultValue={dialog.defaultValue}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                confirmLabel="Create"
                loading={loading}
            />
            <FolderDialog
                open={dialog.open && dialog.type === "rename"}
                title="Rename Folder"
                defaultValue={dialog.defaultValue}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                confirmLabel="Rename"
                loading={loading}
            />
            <FolderDialog
                open={dialog.open && dialog.type === "move"}
                title="Move Folder (enter new parent folder ID or leave empty for root)"
                defaultValue={dialog.defaultValue}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                confirmLabel="Move"
                loading={loading}
            />
            {dialog.open && dialog.type === "delete" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-gray-800 rounded-lg p-6 min-w-[320px] shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-4">Delete Folder</h2>
                        <div className="text-white mb-4">Delete folder '{dialog.item?.name}' and all its contents?</div>
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500" onClick={handleDialogCancel} disabled={loading}>Cancel</button>
                            <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500" onClick={() => handleDialogConfirm()} disabled={loading}>{loading ? '...' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 