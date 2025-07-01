import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNodeTemplatesPageable, deleteNodeTemplate } from '../../services/API';
import PropTypes from 'prop-types';

const NodeTemplateSelector = ({ nodeType, onTemplateSelect, onClose }) => {
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const { id: flowId } = useParams();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [size] = useState(10); // Smaller page size for better UX
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadTemplates();
    }, [page]); // Reload when page changes

    const loadTemplates = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getAccessTokenSilently();
            const data = await getNodeTemplatesPageable(token, { page, size });
            setTemplates(data.content || []);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error('Failed to load templates:', error);
            setError('Failed to load templates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = () => {
        const returnUrl = flowId ? `/flows/edit/${flowId}` : '/flows/create';
        navigate(`/node-templates/create?returnUrl=${encodeURIComponent(returnUrl)}`);
    };

    const handleEditTemplate = (templateId) => {
        const returnUrl = flowId ? `/flows/edit/${flowId}` : '/flows/create';
        navigate(`/node-templates/edit/${templateId}?returnUrl=${encodeURIComponent(returnUrl)}`);
    };

    const handleSelectTemplate = (template) => {
        onTemplateSelect(template);
        onClose();
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleting(true);
            setError(null);
            const token = await getAccessTokenSilently();
            await deleteNodeTemplate(token, templateId);
            
            // Refresh the current page after deletion
            await loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            setError('Failed to delete template. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse text-white">Loading templates...</div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white">Node Template</h3>
            
            {error && (
                <div className="p-2 bg-red-600 text-white text-sm rounded">
                    {error}
                </div>
            )}
            
            {/* Create New Template */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Create New Template</h4>
                <button
                    onClick={handleCreateTemplate}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Create Template
                </button>
            </div>

            {/* Existing Templates - Flex grow to take available space */}
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-300">Use Existing Template</h4>
                    {totalElements > 0 && (
                        <span className="text-xs text-gray-400">
                            {totalElements} template{totalElements !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                
                {templates.length === 0 ? (
                    <div className="text-gray-400 text-center py-4 flex-1 flex items-center justify-center">
                        No templates found
                    </div>
                ) : (
                    <>
                        {/* Template list with fixed height and scroll */}
                        <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
                            {templates.map((template) => {
                                // Parse configuration to get docker image
                                let dockerImage = '';
                                let command = '';
                                let timeout = '';
                                try {
                                    if (template.configuration) {
                                        const config = JSON.parse(template.configuration);
                                        dockerImage = config.dockerImage || '';
                                        command = config.command || '';
                                        timeout = config.timeout || '';
                                    }
                                } catch (e) {
                                    console.warn('Failed to parse template configuration:', e);
                                }

                                return (
                                    <div
                                        key={template.id}
                                        className="flex flex-col p-2 bg-gray-700 rounded-md hover:bg-gray-600"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-white font-medium truncate">
                                                    {template.name}
                                                </div>
                                                {dockerImage && (
                                                    <div className="text-xs text-gray-300 truncate">
                                                        🐳 {dockerImage}
                                                    </div>
                                                )}
                                                {command && (
                                                    <div className="text-xs text-gray-300 truncate">
                                                        💻 {command}
                                                    </div>
                                                )}
                                                {timeout && (
                                                    <div className="text-xs text-gray-400">
                                                        ⏱️ {timeout}s timeout
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex space-x-1 ml-2">
                                                <button
                                                    onClick={() => handleEditTemplate(template.id)}
                                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleSelectTemplate(template)}
                                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                    Use
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                    disabled={deleting}
                                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {deleting ? '...' : 'Del'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Controls - Fixed at bottom of template section */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-600 mt-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 0}
                                    className="px-2 py-1 text-xs border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Prev
                                </button>
                                
                                <span className="text-xs text-gray-400">
                                    Page {page + 1} of {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="px-2 py-1 text-xs border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Close Button - Fixed at bottom */}
            <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700 mt-auto"
            >
                Close
            </button>
        </div>
    );
};

NodeTemplateSelector.propTypes = {
    nodeType: PropTypes.string.isRequired,
    onTemplateSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default NodeTemplateSelector; 