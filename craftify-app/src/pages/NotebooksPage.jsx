import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteNotebook, getNotebooksPageable } from "../services/API";
import { PageLoader } from "../components/page-loader/PageLoader.jsx";
import { Modal } from "../components/modal/Modal.jsx";
import { Notification } from "../components/notification/Notification.jsx";
import noDataImage from '../assets/no-data.png';

export const NotebooksPage = () => {
    const [notebooks, setNotebooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [notebookToDelete, setNotebookToDelete] = useState(null);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const getNotebookData = async (page) => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = await getAccessTokenSilently();
                const notebooksData = await getNotebooksPageable(accessToken, { page: page });

                if (!isMounted) {
                    return;
                }

                if (notebooksData && notebooksData.content) {
                    setNotebooks(notebooksData.content);
                    setTotalPages(notebooksData.totalPages);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getNotebookData(currentPage).catch((error) => {
            console.error(error);
            setLoading(false);
            setError(error.message);
        });

        return () => {
            isMounted = false;
        };
    }, [getAccessTokenSilently, currentPage]);

    const handleEdit = (id) => {
        navigate(`/notebooks/${id}`);
    };

    const handleRemove = (id) => {
        setNotebookToDelete(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setError(null);
        setLoading(true);
        try {
            const accessToken = await getAccessTokenSilently();
            await deleteNotebook(accessToken, notebookToDelete);
            await fetchNotebooks(currentPage);
            setShowModal(false);
            setNotebookToDelete(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotebooks = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = await getAccessTokenSilently();
            const notebooksData = await getNotebooksPageable(accessToken, { page });
            setNotebooks(notebooksData.content);
            setTotalPages(notebooksData.totalPages);
            setCurrentPage(page);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            fetchNotebooks(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            fetchNotebooks(currentPage + 1);
        }
    };

    return (
        <>
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-white">Notebooks Page</h1>
                    <button
                        className="text-white font-bold py-2 px-4 rounded"
                        style={{
                            minWidth: '8.4rem',
                            border: '0.1rem solid var(--indigo)',
                            color: 'var(--white)',
                            background: 'var(--indigo)',
                            width: '17%',
                            fontSize: '1.6rem',
                            marginRight: '1.6rem',
                            fontFamily: 'var(--font-primary)',
                            fontStyle: 'normal',
                            fontWeight: '600',
                            lineHeight: '3.2rem',
                            padding: '0.8rem 0',
                            borderRadius: '0.8rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            userSelect: 'none',
                            marginBottom: '15px',
                            transition: 'background 0.3s ease-out, color 0.3s ease-out'
                        }}
                        onClick={() => navigate('/notebooks/add')}
                    >
                        Add Notebook
                    </button>
                </div>
                {loading ? (
                    <PageLoader />
                ) : (
                    <div className="overflow-x-auto p-4 border rounded-lg shadow-md bg-gray-800">
                        {notebooks.length > 0 ? (
                            <>
                                <table className="min-w-full bg-gray-800 text-white">
                                    <thead>
                                    <tr>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">ID</th>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">Name</th>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {notebooks.map((notebook) => (
                                        <tr key={notebook.id}>
                                            <td className="py-3 px-6 border-b border-gray-600">{notebook.id}</td>
                                            <td className="py-3 px-6 border-b border-gray-600">{notebook.name}</td>
                                            <td className="py-3 px-6 border-b border-gray-600">
                                                <button
                                                    className="p-2 bg-green-500 text-white rounded mr-2"
                                                    onClick={() => handleEdit(notebook.id)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="p-2 bg-red-500 text-white rounded"
                                                    onClick={() => handleRemove(notebook.id)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <div className="flex justify-between items-center py-4">
                                    <button
                                        className={`p-2 rounded ${currentPage === 0 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white cursor-pointer'}`}
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-white">Page {currentPage + 1} of {totalPages}</span>
                                    <button
                                        className={`p-2 rounded ${currentPage === totalPages - 1 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white cursor-pointer'}`}
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            noDataImage && (
                                <div className="flex justify-center items-center">
                                    <img src={noDataImage || undefined} alt="No Data" />
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this notebook?"
            />
            <Notification
                show={!!error}
                message={error}
                onClose={() => setError(null)}
            />
        </>
    );
};
