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

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getAccessTokenSilently();
            const data = await getNodeTemplatesPageable(token, { size: 100 });
            setTemplates(data.content || []);
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
            setTemplates(templates.filter(t => t.id !== templateId));
        } catch (error) {
            console.error('Failed to delete template:', error);
            setError('Failed to delete template. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse text-white">Loading templates...</div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
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

            {/* Existing Templates */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Use Existing Template</h4>
                {templates.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">
                        No templates found
                    </div>
                ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="flex items-center justify-between p-2 bg-gray-700 rounded-md hover:bg-gray-600"
                            >
                                <span className="flex-1 text-white">
                                    {template.name}
                                </span>
                                
                                <div className="flex space-x-1">
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
                        ))}
                    </div>
                )}
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700"
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