import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNotebookById, updateNotebook, deleteNotebook } from '../services/API';
import NotebookEditor from "../components/notebook-editor/NotebookEditor.jsx";
import { PageLoader } from "../components/page-loader/PageLoader.jsx";
import { Modal } from "../components/modal/Modal.jsx";

export const NotebooksEditPage = () => {
    const { id } = useParams();
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const [notebook, setNotebook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showErrorModal, setShowErrorModal] = useState(false); // Modal for name error
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal for confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal for deletion confirmation
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchNotebookAndToken = async () => {
            try {
                const token = await getAccessTokenSilently();
                const notebookData = await getNotebookById(token, id);
                if (isMounted) {
                    setAccessToken(token);
                    setNotebook(notebookData);
                }
            } catch (error) {
                setShowErrorModal(true);
            } finally {
                setLoading(false);
            }
        };

        fetchNotebookAndToken();

        return () => {
            isMounted = false;
        };
    }, [getAccessTokenSilently, id]);

    const handleSave = async () => {
        if (!notebook.name || notebook.name.trim() === '') {
            setShowErrorModal(true);
        } else {
            setShowConfirmModal(true);
        }
    };

    const confirmSave = async () => {
        setLoading(true);
        setShowConfirmModal(false);
        try {
            await updateNotebook(accessToken, id, notebook);
            navigate('/notebooks');
        } catch (error) {
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setShowDeleteModal(false);
        try {
            await deleteNotebook(accessToken, id);
            navigate('/notebooks');
        } catch (error) {
            setShowErrorModal(true);
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
                <PageLoader />
            ) : (
                <div className="relative w-full p-6 bg-gray-800 text-white rounded-lg shadow-md mt-8">
                    <button
                        onClick={handleClose}
                        className="absolute top-0 right-0 mt-4 mr-4 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                        style={{ background: 'var(--mandarine-orange-gradient)', fontFamily: 'var(--font-primary)' }}
                    >
                        Close
                    </button>
                    <h1 className="text-white text-lg font-bold mb-4">Edit Notebook</h1>
                    <NotebookEditor notebook={notebook} accessToken={accessToken} onUpdateNotebook={setNotebook}/>
                    <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex-1 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                            style={{ background: 'var(--pink-yellow-gradient)', fontFamily: 'var(--font-primary)' }}
                        >
                            Save Notebook
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="flex-1 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                            style={{ background: 'var(--mandarine-orange-gradient)', fontFamily: 'var(--font-primary)' }}
                        >
                            Delete Notebook
                        </button>
                    </div>
                    <Modal
                        show={showErrorModal}
                        onClose={() => setShowErrorModal(false)}
                        onConfirm={() => setShowErrorModal(false)}
                        title="Error"
                        message="Notebook name is required."
                    />
                    <Modal
                        show={showConfirmModal}
                        onClose={() => setShowConfirmModal(false)}
                        onConfirm={confirmSave}
                        title="Confirm Submission"
                        message="Are you sure you want to save this notebook?"
                    />
                    <Modal
                        show={showDeleteModal}
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={handleDelete}
                        title="Confirm Deletion"
                        message="Are you sure you want to delete this notebook?"
                    />
                </div>
            )}
        </>
    );
};

export default NotebooksEditPage;
