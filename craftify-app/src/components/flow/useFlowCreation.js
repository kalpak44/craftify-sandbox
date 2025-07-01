import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth0} from '@auth0/auth0-react';
import {createFlow, getFlowById, updateFlow} from '../../services/API';

export const useFlowCreation = (id) => {
    const {getAccessTokenSilently} = useAuth0();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(!!id);
    const [flowName, setFlowName] = useState('');
    const [flowDescription, setFlowDescription] = useState('');
    const [flowActive, setFlowActive] = useState(false);

    const onSave = async () => {
        if (!flowName.trim()) return alert('Flow name is required');
        try {
            const token = await getAccessTokenSilently();
            const flowData = {
                name: flowName,
                description: flowDescription,
                configuration: JSON.stringify({nodes: [], edges: []}),
                active: flowActive,
            };
            id ? await updateFlow(token, id, flowData) : await createFlow(token, flowData);
            navigate('/flows');
        } catch (e) {
            console.error('Save failed', e);
            alert('Could not save.');
        }
    };

    const onCancel = () => navigate('/flows');

    const loadFlowData = useCallback(async () => {
        if (!id) return;

        try {
            const token = await getAccessTokenSilently();
            const flowData = await getFlowById(token, id);
            setFlowName(flowData.name);
            setFlowDescription(flowData.description);
            setFlowActive(flowData.active);
            return flowData;
        } catch (err) {
            console.error('Load error', err);
            navigate('/flows');
        } finally {
            setLoading(false);
        }
    }, [id, getAccessTokenSilently, navigate]);

    useEffect(() => {
        loadFlowData();
    }, [loadFlowData]);

    return {
        loading,
        flowName,
        setFlowName,
        flowDescription,
        setFlowDescription,
        flowActive,
        setFlowActive,
        onSave,
        onCancel,
        loadFlowData
    };
}; 