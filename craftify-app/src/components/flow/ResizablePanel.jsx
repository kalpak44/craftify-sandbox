import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const ResizablePanel = ({ children, isOpen, onClose, minWidth = 200, maxWidth = 600, defaultWidth = 256 }) => {
    const [width, setWidth] = useState(defaultWidth);
    const [isResizing, setIsResizing] = useState(false);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
        startXRef.current = e.clientX;
        startWidthRef.current = width;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [width]);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing) return;
        
        const deltaX = startXRef.current - e.clientX;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
        setWidth(newWidth);
    }, [isResizing, minWidth, maxWidth]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    // Add global mouse event listeners
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isResizing, handleMouseMove, handleMouseUp]);

    if (!isOpen) return null;

    return (
        <div 
            className="absolute top-0 right-0 h-full bg-gray-900 text-white border-l border-gray-700 flex flex-col z-50"
            style={{ width: `${width}px` }}
        >
            {/* Resize handle */}
            <div
                className="absolute left-0 top-0 w-1 h-full bg-gray-600 hover:bg-gray-500 cursor-col-resize"
                onMouseDown={handleMouseDown}
            />
            
            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
};

ResizablePanel.propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    defaultWidth: PropTypes.number
};

export default ResizablePanel; 