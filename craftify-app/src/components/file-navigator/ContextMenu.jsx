import React from "react";
import PropTypes from "prop-types";

export default function ContextMenu({ contextMenu, contextMenuRef, handleContextMenuAction }) {
    if (!contextMenu) return null;
    return (
        <div
            ref={contextMenuRef}
            className="fixed z-50 bg-gray-900 border border-gray-700 rounded shadow-lg text-white min-w-[180px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            role="menu"
            tabIndex={-1}
        >
            {contextMenu.type === "folder" ? (
                <ul>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("open", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("open", contextMenu.item); }}>Open</li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("rename", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("rename", contextMenu.item); }}>Rename</li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("move", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("move", contextMenu.item); }}>Move</li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("delete", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("delete", contextMenu.item); }}>Delete</li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("favorite", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("favorite", contextMenu.item); }}>
                        {contextMenu.item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("createSchema", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("createSchema", contextMenu.item); }}>Create Schema</li>
                </ul>
            ) : contextMenu.type === "schema" ? (
                <ul>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("open", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("open", contextMenu.item); }}>Open</li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("rename", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("rename", contextMenu.item); }}>Rename</li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("move", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("move", contextMenu.item); }}>Move</li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("delete", contextMenu.item)} onKeyDown={e => { if (e.key === 'Enter') handleContextMenuAction("delete", contextMenu.item); }}>Delete</li>
                </ul>
            ) : (
                <ul>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("create")}>Create Folder</li>
                    <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" role="menuitem" tabIndex={0} onClick={() => handleContextMenuAction("createSchema")}>Create Schema</li>
                </ul>
            )}
        </div>
    );
}

ContextMenu.propTypes = {
    contextMenu: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        type: PropTypes.string,
        item: PropTypes.object
    }),
    contextMenuRef: PropTypes.oneOfType([
        PropTypes.func, 
        PropTypes.shape({ current: PropTypes.any })
    ]),
    handleContextMenuAction: PropTypes.func.isRequired
}; 