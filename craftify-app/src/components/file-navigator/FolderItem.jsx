import React from "react";
import PropTypes from "prop-types";

export default function FolderItem({ item, openFolder, handleFolderContextMenu }) {
    const isUpFolder = item.id === "..";
    return (
        <div
            className="flex flex-col items-center justify-center bg-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-600 relative group shadow-lg transition-all text-center"
            style={{ fontSize: '2rem', minHeight: '120px' }}
            onClick={() => openFolder(item)}
            onContextMenu={e => { e.preventDefault(); handleFolderContextMenu(e, item); }}
            role="button"
            tabIndex={0}
            aria-label={`Open folder ${item.name}`}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openFolder(item); }}
        >
            {!isUpFolder && (
                <span style={{ fontSize: '2.5rem', position: 'relative', display: 'inline-block' }}>
                    📁
                    {item.isFavorite && (
                        <span style={{
                            position: 'absolute',
                            top: '-0.7em',
                            right: '-0.7em',
                            fontSize: '1.5rem',
                            color: '#FFD700',
                            pointerEvents: 'none',
                            textShadow: '0 0 2px #333'
                        }}>★</span>
                    )}
                </span>
            )}
            <span className={isUpFolder ? "mt-2 font-semibold text-lg text-yellow-400 break-all" : "mt-2 font-semibold text-lg text-blue-200 break-all"}>{item.name}</span>
        </div>
    );
}

FolderItem.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.any.isRequired,
        name: PropTypes.string.isRequired,
        isFavorite: PropTypes.bool
    }).isRequired,
    openFolder: PropTypes.func.isRequired,
    handleFolderContextMenu: PropTypes.func.isRequired
}; 