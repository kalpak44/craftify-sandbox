import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {createPortal} from 'react-dom';

export function DataStoreActionsMenu({dataStoreId}) {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({});
    const buttonRef = useRef();
    const menuRef = useRef();
    const navigate = useNavigate();

    // Handle outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(e.target) &&
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);


    useEffect(() => {
        if (!open || !buttonRef.current) return;
        const btnRect = buttonRef.current.getBoundingClientRect();
        const menuHeight = 96; // Estimate
        let top = btnRect.bottom + 8;
        let left = btnRect.right - 130; // align right edge
        if (window.innerHeight - btnRect.bottom < menuHeight + 12) {
            top = btnRect.top - menuHeight - 8;
        }
        setMenuStyle({
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 1000,
            minWidth: '130px'
        });
    }, [open]);

    // Menu content (portal)
    const menu = open ? createPortal(
        <div
            ref={menuRef}
            style={menuStyle}
            className="bg-gray-900 border border-gray-700 rounded-lg shadow"
        >
            <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-800 text-gray-100"
                onClick={() => {
                    navigate(`/data-stores/${dataStoreId}`);
                    setOpen(false);
                }}
            >
                Details
            </button>
            <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-800 text-gray-100"
                onClick={() => {
                    setOpen(false);
                }}
            >
                Clean
            </button>
            <button
                className="block w-full px-4 py-2 text-left hover:bg-red-900 text-red-400"
                onClick={() => {
                    setOpen(false);
                }}
            >
                Delete
            </button>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setOpen((o) => !o)}
                className="rounded px-2 py-1 hover:bg-gray-800 text-gray-400"
                aria-label="Actions"
            >
                <span className="text-xl font-bold">⋯</span>
            </button>
            {menu}
        </>
    );
}
