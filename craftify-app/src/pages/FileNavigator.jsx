import React, {useEffect, useRef, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {
    createFolder as apiCreateFolder,
    deleteFolder as apiDeleteFolder,
    deleteSchemaFile,
    listFolders as apiListFolders,
    listSchemaFiles,
    moveFolder as apiMoveFolder,
    renameFolder as apiRenameFolder,
    saveSchemaFile,
    toggleFavorite as apiToggleFavorite
} from "../services/API";
import Breadcrumbs from "../components/file-navigator/Breadcrumbs";
import FolderItem from "../components/file-navigator/FolderItem";
import ContextMenu from "../components/file-navigator/ContextMenu";
import FolderDialog from "../components/file-navigator/FolderDialog";
import {useLocation, useNavigate} from "react-router-dom";
import {useFileStructureContext} from "../components/file-navigator/FileStructureContext";

export default function FileNavigator({navigateToFolder, onFavoriteToggled}) {
    const {getAccessTokenSilently} = useAuth0();
    const [currentFolder, setCurrentFolder] = useState(null); // null = root
    const [items, setItems] = useState([]);
    const [schemaFiles, setSchemaFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [path, setPath] = useState([]); // breadcrumb
    const [contextMenu, setContextMenu] = useState(null); // {x, y, type, item}
    const contextMenuRef = useRef();
    const prevNavigateToFolder = useRef(null);
    const [dialog, setDialog] = useState({open: false, type: null, item: null, defaultValue: ""});
    const navigate = useNavigate();
    const location = useLocation();
    const {notifyFileStructureChanged} = useFileStructureContext();

    // On mount, check for initial folderId from location.state
    useEffect(() => {
        if (location.state && location.state.folderId) {
            setCurrentFolder(location.state.folderId === 'root' ? null : location.state.folderId);
        }
    }, [location.state]);

    useEffect(() => {
        fetchItems(currentFolder);
        fetchSchemaFiles(currentFolder);
        // eslint-disable-next-line
    }, [currentFolder]);

    useEffect(() => {
        function handleClick() {
            setContextMenu(null);
        }

        function handleScroll() {
            setContextMenu(null);
        }

        function handleResize() {
            setContextMenu(null);
        }

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
            setItems(data.map(item => ({...item, isFavorite: item.favorite})));
        } catch (e) {
            setError("Failed to load folders: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    async function fetchSchemaFiles(parentId) {
        try {
            const accessToken = await getAccessTokenSilently();
            const schemas = await listSchemaFiles(accessToken, parentId ?? 'root');
            setSchemaFiles(schemas);
            notifyFileStructureChanged();
        } catch (e) {
            // ignore schema fetch errors for now
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
            await apiCreateFolder(accessToken, {name, parentId: currentFolder});
            fetchItems(currentFolder);
            notifyFileStructureChanged();
        } catch (e) {
            setError("Failed to create folder: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    function openFolder(folder) {
        setPath(prev => [...prev, {id: folder.id, name: folder.name}]);
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
            notifyFileStructureChanged();
        } catch (e) {
            setError("Failed to toggle favorite: " + e.message);
        }
    }

    async function deleteFolder(item) {
        setDialog({open: true, type: "delete", item});
        notifyFileStructureChanged();
    }

    async function renameFolder(item) {
        setDialog({open: true, type: "rename", item, defaultValue: item.name});
        notifyFileStructureChanged();
    }

    async function moveFolder(item) {
        setDialog({open: true, type: "move", item, defaultValue: item.parentId || ""});
        notifyFileStructureChanged();
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

    // Add schema context menu handler
    function handleSchemaContextMenu(e, schema) {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type: "schema",
            item: schema
        });
    }

    function handleContextMenuAction(action, item) {
        setContextMenu(null);
        switch (action) {
            case "open":
                if (contextMenu.type === "schema") {
                    const folderId = item.folderId || currentFolder || 'root';
                    navigate(`/schemas/${folderId}/edit`);
                } else {
                    openFolder(item);
                }
                break;
            case "rename":
                if (contextMenu.type === "schema") {
                    setDialog({
                        open: true,
                        type: "renameSchema",
                        item,
                        defaultValue: item.name.replace(/\.json$/i, "")
                    });
                } else {
                    renameFolder(item);
                }
                break;
            case "move":
                if (contextMenu.type === "schema") {
                    setDialog({open: true, type: "moveSchema", item, defaultValue: item.folderId || ""});
                } else {
                    moveFolder(item);
                }
                break;
            case "delete":
                if (contextMenu.type === "schema") {
                    setDialog({open: true, type: "deleteSchema", item});
                } else {
                    deleteFolder(item);
                }
                break;
            case "favorite":
                toggleFavorite(item);
                break;
            case "create":
                setDialog({open: true, type: "create", item: null, defaultValue: ""});
                break;
            case "createSchema":
                // eslint-disable-next-line no-case-declarations
                const folderId = item?.id || currentFolder;
                navigate(`/schemas/${folderId || 'root'}/edit`);
                break;
            default:
                break;
        }
    }

    function handleDialogCancel() {
        setDialog({open: false, type: null, item: null, defaultValue: ""});
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
        } else if (dialog.type === "renameSchema") {
            if (!value || value === dialog.item.name.replace(/\.json$/i, "")) return handleDialogCancel();
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                await saveSchemaFile(accessToken, {
                    ...dialog.item,
                    name: value.trim() + ".json"
                });
                fetchSchemaFiles(currentFolder);
            } catch (e) {
                setError("Failed to rename schema: " + e.message);
            } finally {
                setLoading(false);
            }
        } else if (dialog.type === "moveSchema") {
            if (value === dialog.item.folderId) return handleDialogCancel();
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                await saveSchemaFile(accessToken, {
                    ...dialog.item,
                    folderId: value || null
                });
                fetchSchemaFiles(currentFolder);
            } catch (e) {
                setError("Failed to move schema: " + e.message);
            } finally {
                setLoading(false);
            }
        } else if (dialog.type === "deleteSchema") {
            setLoading(true);
            setError("");
            try {
                const accessToken = await getAccessTokenSilently();
                await deleteSchemaFile(accessToken, dialog.item.id);
                fetchSchemaFiles(currentFolder);
            } catch (e) {
                setError("Failed to delete schema: " + e.message);
            } finally {
                setLoading(false);
            }
        }
        handleDialogCancel();
    }

    return (
        <div
            className="w-full h-full p-8 relative"
            style={{background: '#1F2836'}}
            onContextMenu={e => {
                e.preventDefault();
                handleBackgroundContextMenu(e);
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <Breadcrumbs path={path} goToBreadcrumb={goToBreadcrumb}/>
            </div>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <div
                className="bg-gray-800 rounded p-6 min-h-[300px] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                style={{position: 'relative'}}
                onContextMenu={e => {
                    e.preventDefault();
                    handleBackgroundContextMenu(e);
                }}
            >
                {loading ? (
                    <div className="text-gray-400 col-span-full">Loading...</div>
                ) : (
                    <>
                        {currentFolder !== null && (
                            <FolderItem
                                key=".."
                                item={{id: "..", name: "..", isFavorite: false}}
                                openFolder={() => goToBreadcrumb(path.length - 2 >= 0 ? path.length - 2 : -1)}
                                handleFolderContextMenu={() => {
                                }}
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
                        {/* Show schema files */}
                        {schemaFiles.length > 0 && schemaFiles.map(schema => (
                            <div
                                key={schema.id}
                                className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded border border-blue-400 hover:bg-gray-600 group relative cursor-pointer"
                                onClick={() => navigate(`/schemas/${currentFolder ?? 'root'}/edit?schemaId=${schema.id}`)}
                                onContextMenu={e => {
                                    e.stopPropagation();
                                    handleSchemaContextMenu(e, schema);
                                }}
                            >
                                <span role="img" aria-label="schema"
                                      className="text-3xl mb-2 group-hover:scale-110 transition-transform">📄</span>
                                <span
                                    className="text-white text-sm truncate w-full text-center group-hover:font-bold">{schema.name || 'Schema.json'}</span>
                                <button
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-2 py-1 rounded text-xs transition-opacity"
                                    onClick={e => {
                                        e.stopPropagation();
                                        navigate(`/schemas/${currentFolder ?? 'root'}/edit?schemaId=${schema.id}`);
                                    }}
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                        {items.length === 0 && schemaFiles.length === 0 && currentFolder === null && (
                            <div className="text-gray-400 col-span-full" onContextMenu={e => {
                                e.preventDefault();
                                handleBackgroundContextMenu(e);
                            }}>No folders.</div>
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
                            <button className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
                                    onClick={handleDialogCancel} disabled={loading}>Cancel
                            </button>
                            <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
                                    onClick={() => handleDialogConfirm()}
                                    disabled={loading}>{loading ? '...' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Dialogs for schema file actions */}
            <FolderDialog
                open={dialog.open && dialog.type === "renameSchema"}
                title="Rename Schema File"
                defaultValue={dialog.defaultValue}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                confirmLabel="Rename"
                loading={loading}
            />
            <FolderDialog
                open={dialog.open && dialog.type === "moveSchema"}
                title="Move Schema File (enter new parent folder ID or leave empty for root)"
                defaultValue={dialog.defaultValue}
                onConfirm={handleDialogConfirm}
                onCancel={handleDialogCancel}
                confirmLabel="Move"
                loading={loading}
            />
            {dialog.open && dialog.type === "deleteSchema" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-gray-800 rounded-lg p-6 min-w-[320px] shadow-lg">
                        <h2 className="text-lg font-semibold text-white mb-4">Delete Schema File</h2>
                        <div className="text-white mb-4">Delete schema file '{dialog.item?.name}'?</div>
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-500"
                                    onClick={handleDialogCancel} disabled={loading}>Cancel
                            </button>
                            <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
                                    onClick={() => handleDialogConfirm()}
                                    disabled={loading}>{loading ? '...' : 'Delete'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 