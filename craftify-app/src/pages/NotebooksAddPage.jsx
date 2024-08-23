import React, {useState} from 'react';
import {useAuth0} from '@auth0/auth0-react';
import {useNavigate} from 'react-router-dom';
import NotebookEditor from "../components/notebook-editor/NotebookEditor.jsx";
import {PageLoader} from "../components/page-loader/PageLoader.jsx";
import {Notification} from "../components/notification/Notification.jsx";
import {Modal} from "../components/modal/Modal.jsx";
import {createNotebook} from '../services/API';

const NotebooksAddPage = () => {
    const {getAccessTokenSilently} = useAuth0();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [notebook, setNotebook] = useState({
        name: "My Notebook",
        cells: [{
            id: '1',
            type: 'markdown',
            content: `
# Security Warning

It's important to be cautious when executing code from untrusted sources. Executing code from unsecure or unknown places can lead to security vulnerabilities, including unauthorized access to your data or system. Always ensure that the source of the code is trusted before execution.
            `,
            editing: false,
        }]
    });

    const handleSave = async () => {
        if (!notebook.name || notebook.name.trim() === '') {
            setError('Notebook name is required.');
            return;
        }

        setLoading(true);
        setShowModal(false);
        try {
            const accessToken = await getAccessTokenSilently();
            await createNotebook(accessToken, notebook);
            setSuccess("Notebook created successfully!");
            navigate('/notebooks');
        } catch (error) {
            setError('Failed to create notebook: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/notebooks');
    };

    return (
        <>
            {loading ? (
                <PageLoader/>
            ) : error || success ? (
                <Notification show={true} message={error || success} onClose={() => {
                    setError(null);
                    setSuccess(null);
                }}/>
            ) : (
                <div className="relative w-full p-6 bg-gray-800 text-white rounded-lg shadow-md mt-8">
                    <button
                        onClick={handleClose}
                        className="absolute top-0 right-0 mt-4 mr-4 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                        style={{background: 'var(--mandarine-orange-gradient)', fontFamily: 'var(--font-primary)'}}
                    >
                        Close
                    </button>
                    <h1 className="text-white text-lg font-bold mb-4">Add Notebook</h1>
                    <NotebookEditor notebook={notebook} onSave={(data) => setNotebook(data)}/>
                    <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="flex-1 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                            style={{background: 'var(--pink-yellow-gradient)', fontFamily: 'var(--font-primary)'}}
                        >
                            Save Notebook
                        </button>
                    </div>
                    <Modal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        onConfirm={(e) => handleSave(e)}
                        title="Confirm Submission"
                        message="Are you sure you want to submit this notebook?"
                    />
                </div>
            )}
        </>
    );
};

export default NotebooksAddPage;
