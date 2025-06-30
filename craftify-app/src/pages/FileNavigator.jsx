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
            // Find the path to the folder (for now, just set as current, clear path)
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
            setItems(data);
        } catch (e) {
            setError("Failed to load folders: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    async function createFolder(name) {
        if (!name || !name.trim()) return;
        // Check for duplicate folder name in current folder
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
        if (!window.confirm(`Delete folder '${item.name}' and all its contents?`)) return;
        setLoading(true);
        setError("");
        try {
            const accessToken = await getAccessTokenSilently();
            await apiDeleteFolder(accessToken, item.id);
            fetchItems(currentFolder);
        } catch (e) {
            setError("Failed to delete folder: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    async function renameFolder(item) {
        const newName = window.prompt("Rename folder:", item.name);
        if (!newName || newName === item.name) return;
        setLoading(true);
        setError("");
        try {
            const accessToken = await getAccessTokenSilently();
            await apiRenameFolder(accessToken, item.id, newName);
            fetchItems(currentFolder);
        } catch (e) {
            setError("Failed to rename folder: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    async function moveFolder(item) {
        const newParentId = window.prompt("Enter new parent folder ID (empty for root):", item.parentId || "");
        if (newParentId === null || newParentId === item.parentId) return;
        setLoading(true);
        setError("");
        try {
            const accessToken = await getAccessTokenSilently();
            await apiMoveFolder(accessToken, item.id, newParentId);
            fetchItems(currentFolder);
        } catch (e) {
            setError("Failed to move folder: " + e.message);
        } finally {
            setLoading(false);
        }
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
                const name = window.prompt("New folder name:");
                if (name) createFolder(name);
                break;
            default:
                break;
        }
    }

    return (
        <div
            className="w-full h-full p-8 relative"
            style={{ background: '#1F2836' }}
            onContextMenu={e => { e.preventDefault(); handleBackgroundContextMenu(e); }}
        >
            <div className="mb-4 flex items-center gap-2 text-gray-300">
                <span className="cursor-pointer hover:underline" onClick={() => goToBreadcrumb(-1)}>Root</span>
                {path.map((p, idx) => (
                    <React.Fragment key={p.id}>
                        <span>/</span>
                        <span className="cursor-pointer hover:underline" onClick={() => goToBreadcrumb(idx)}>{p.name}</span>
                    </React.Fragment>
                ))}
            </div>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <div
                className="bg-gray-800 rounded p-6 min-h-[300px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                style={{ position: 'relative' }}
                onContextMenu={e => { e.preventDefault(); handleBackgroundContextMenu(e); }}
            >
                {loading ? (
                    <div className="text-gray-400 col-span-full">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="text-gray-400 col-span-full">No folders.</div>
                ) : (
                    items.map(item => (
                        <div
                            key={item.id}
                            className="flex flex-col items-center justify-center bg-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-600 relative group shadow-lg transition-all text-center"
                            style={{ fontSize: '2rem', minHeight: '120px' }}
                            onClick={() => openFolder(item)}
                            onContextMenu={e => { e.preventDefault(); handleFolderContextMenu(e, item); }}
                        >
                            <span style={{ fontSize: '2.5rem' }}>📁</span>
                            <span className="mt-2 font-semibold text-lg text-blue-200 break-all">{item.name}</span>
                            {item.isFavorite && <span className="absolute top-2 right-2 text-yellow-400 text-xl">★</span>}
                        </div>
                    ))
                )}
            </div>
            {contextMenu && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-50 bg-gray-900 border border-gray-700 rounded shadow-lg text-white min-w-[180px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    {contextMenu.type === "folder" ? (
                        <ul>
                            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleContextMenuAction("open", contextMenu.item)}>Open</li>
                            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleContextMenuAction("rename", contextMenu.item)}>Rename</li>
                            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleContextMenuAction("move", contextMenu.item)}>Move</li>
                            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleContextMenuAction("delete", contextMenu.item)}>Delete</li>
                            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleContextMenuAction("favorite", contextMenu.item)}>
                                {contextMenu.item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            </li>
                        </ul>
                    ) : (
                        <ul>
                            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={() => handleContextMenuAction("create")}>Create Folder</li>
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
} 