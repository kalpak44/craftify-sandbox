import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getNodeTemplatesPageable, createNodeTemplate, updateNodeTemplate, deleteNodeTemplate } from '../../services/API';
import PropTypes from 'prop-types';

const NodeTemplateSelector = ({ nodeType, onTemplateSelect, onClose }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const nameInputRef = useRef(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        if (editingTemplateId && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [editingTemplateId]);

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

    const handleCreateTemplate = async () => {
        if (!newTemplateName.trim()) {
            setError('Template name is required');
            return;
        }

        if (templates.some(t => t.name.toLowerCase() === newTemplateName.trim().toLowerCase())) {
            setError('A template with this name already exists');
            return;
        }

        try {
            setCreating(true);
            setError(null);
            const token = await getAccessTokenSilently();
            const templateData = {
                name: newTemplateName.trim(),
                description: `Template for ${nodeType} node`,
                configuration: JSON.stringify({ 
                    type: nodeType,
                    label: newTemplateName.trim(),
                    createdAt: new Date().toISOString()
                })
            };
            
            const newTemplate = await createNodeTemplate(token, templateData);
            onTemplateSelect(newTemplate);
            onClose();
        } catch (error) {
            console.error('Failed to create template:', error);
            setError('Failed to create template. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleSelectTemplate = (template) => {
        onTemplateSelect(template);
        onClose();
    };

    const handleStartEdit = (template) => {
        setEditingTemplateId(template.id);
        setEditingName(template.name);
        setError(null);
    };

    const handleSaveEdit = async () => {
        if (!editingName.trim()) {
            setError('Template name is required');
            return;
        }

        if (templates.some(t => t.id !== editingTemplateId && t.name.toLowerCase() === editingName.trim().toLowerCase())) {
            setError('A template with this name already exists');
            return;
        }

        try {
            setUpdating(true);
            setError(null);
            const token = await getAccessTokenSilently();
            const template = templates.find(t => t.id === editingTemplateId);
            const updatedTemplate = await updateNodeTemplate(token, editingTemplateId, {
                ...template,
                name: editingName.trim()
            });
            
            setTemplates(templates.map(t => t.id === editingTemplateId ? updatedTemplate : t));
            setEditingTemplateId(null);
            setEditingName('');
        } catch (error) {
            console.error('Failed to update template:', error);
            setError('Failed to update template. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingTemplateId(null);
        setEditingName('');
        setError(null);
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

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEdit();
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
                <div>
                    <input
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => {
                            setNewTemplateName(e.target.value);
                            setError(null);
                        }}
                        placeholder="Enter template name"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => handleKeyPress(e, handleCreateTemplate)}
                        disabled={creating}
                    />
                </div>
                <button
                    onClick={handleCreateTemplate}
                    disabled={creating || !newTemplateName.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creating ? 'Creating...' : 'Create Template'}
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
                                {editingTemplateId === template.id ? (
                                    <input
                                        ref={nameInputRef}
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => {
                                            setEditingName(e.target.value);
                                            setError(null);
                                        }}
                                        className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white"
                                        onKeyPress={(e) => handleKeyPress(e, handleSaveEdit)}
                                        onBlur={handleSaveEdit}
                                        disabled={updating}
                                    />
                                ) : (
                                    <span
                                        className="flex-1 text-white cursor-pointer"
                                        onDoubleClick={() => handleStartEdit(template)}
                                    >
                                        {template.name}
                                    </span>
                                )}
                                
                                <div className="flex space-x-1">
                                    {editingTemplateId === template.id ? (
                                        <>
                                            <button
                                                onClick={handleSaveEdit}
                                                disabled={updating}
                                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                {updating ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                disabled={updating}
                                                className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleStartEdit(template)}
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
                                        </>
                                    )}
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