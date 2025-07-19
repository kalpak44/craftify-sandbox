import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';

export function FunctionActionsMenu({functionId}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative inline-block" ref={menuRef}>
            <button
                onClick={() => setOpen(o => !o)}
                className="rounded px-2 py-1 hover:bg-gray-800 text-gray-400"
                aria-label="Actions"
            >
                <span className="text-xl font-bold">⋯</span>
            </button>
            {open && (
                <div
                    className="absolute right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow z-20 min-w-[130px]">
                    <button
                        className="block w-full px-4 py-2 text-left hover:bg-gray-800 text-gray-100"
                        onClick={() => {
                            navigate(`/functions/${functionId}`);
                            setOpen(false);
                        }}
                    >
                        Details
                    </button>
                    <button
                        className="block w-full px-4 py-2 text-left hover:bg-red-900 text-red-400"
                        onClick={() => { /* TODO: Deregister logic */
                            setOpen(false);
                        }}
                    >
                        Deregister
                    </button>
                </div>
            )}
        </div>
    );
}
