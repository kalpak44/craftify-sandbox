import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { createNodeTemplate, updateNodeTemplate, getNodeTemplateById } from '../services/API';

export const NodeTemplatePage = () => {
    const { getAccessTokenSilently } = useAuth0();
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [name, setName] = useState('');
    const [dockerImage, setDockerImage] = useState('');
    const [command, setCommand] = useState('');
    const [timeout, setTimeout] = useState(300); // Default 5 minutes in seconds
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Get return URL from query parameters, default to flows page
    const returnUrl = searchParams.get('returnUrl') || '/flows';

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            loadTemplate();
        }
    }, [id]);

    const loadTemplate = async () => {
        try {
            setLoading(true);
            setError('');
            const token = await getAccessTokenSilently();
            const template = await getNodeTemplateById(token, id);
            setName(template.name);
            
            // Parse configuration to get container definition
            if (template.configuration) {
                try {
                    const config = JSON.parse(template.configuration);
                    setDockerImage(config.dockerImage || '');
                    setCommand(config.command || '');
                    setTimeout(config.timeout || 300);
                } catch (e) {
                    console.warn('Failed to parse template configuration:', e);
                }
            }
        } catch (err) {
            console.error('Failed to load template:', err);
            setError('Failed to load template. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Template name is required');
            return;
        }

        if (!dockerImage.trim()) {
            setError('Docker image is required');
            return;
        }

        if (timeout <= 0) {
            setError('Timeout must be greater than 0');
            return;
        }

        try {
            setSaving(true);
            setError('');
            const token = await getAccessTokenSilently();
            
            const templateData = {
                name: name.trim(),
                description: `Container template: ${name.trim()}`,
                configuration: JSON.stringify({ 
                    type: 'action',
                    label: name.trim(),
                    dockerImage: dockerImage.trim(),
                    command: command.trim(),
                    timeout: parseInt(timeout),
                    createdAt: new Date().toISOString()
                })
            };

            if (isEditing) {
                await updateNodeTemplate(token, id, templateData);
            } else {
                await createNodeTemplate(token, templateData);
            }
            
            navigate(returnUrl);
        } catch (err) {
            console.error('Failed to save template:', err);
            setError('Failed to save template. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(returnUrl);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-white mb-6">
                    {isEditing ? 'Edit Node Template' : 'Create Node Template'}
                </h1>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-600 text-white text-sm rounded">
                        {error}
                    </div>
                )}
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                            Template Name *
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter template name"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="dockerImage" className="block text-sm font-medium text-gray-300 mb-2">
                            Docker Image *
                        </label>
                        <input
                            id="dockerImage"
                            type="text"
                            value={dockerImage}
                            onChange={(e) => {
                                setDockerImage(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., nginx:latest, myapp:v1.0"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="command" className="block text-sm font-medium text-gray-300 mb-2">
                            Command
                        </label>
                        <textarea
                            id="command"
                            value={command}
                            onChange={(e) => {
                                setCommand(e.target.value);
                                setError('');
                            }}
                            placeholder="e.g., curl example.com, python script.py, npm start"
                            rows="3"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            disabled={saving}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Command to run inside the container (optional)
                        </p>
                    </div>

                    <div>
                        <label htmlFor="timeout" className="block text-sm font-medium text-gray-300 mb-2">
                            Timeout (seconds)
                        </label>
                        <input
                            id="timeout"
                            type="number"
                            min="1"
                            value={timeout}
                            onChange={(e) => {
                                setTimeout(parseInt(e.target.value) || 300);
                                setError('');
                            }}
                            placeholder="300"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={saving}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Default: 300 seconds (5 minutes)
                        </p>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving || !name.trim() || !dockerImage.trim()}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex-1 px-4 py-2 text-gray-400 hover:text-white border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 