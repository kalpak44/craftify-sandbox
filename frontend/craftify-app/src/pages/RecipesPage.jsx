import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecipesPageable, deleteRecipe } from "../services/API";
import { PageLayout } from "../components/page-layout/PageLayout.jsx";
import { PageLoader } from "../components/page-loader/PageLoader.jsx";
import { Modal } from "../components/modal/Modal.jsx";
import { Notification } from "../components/notification/Notification.jsx";
import noDataImage from '../assets/no-data.png';

export const RecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [expandedRecipeId, setExpandedRecipeId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    const [error, setError] = useState(null);
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const getRecipeData = async (page) => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = await getAccessTokenSilently();
                const recipesData = await getRecipesPageable(accessToken, page);

                if (!isMounted) {
                    return;
                }

                if (recipesData && recipesData.content) {
                    setRecipes(recipesData.content);
                    setTotalPages(recipesData.totalPages);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getRecipeData(currentPage).catch((error) => {
            console.error(error);
            setLoading(false);
            setError(error.message);
        });

        return () => {
            isMounted = false;
        };
    }, [getAccessTokenSilently, currentPage]);

    const toggleExpand = (recipeId) => {
        setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
    };

    const handleEdit = (id) => {
        navigate(`/recipes/${id}`);
    };

    const handleRemove = (id) => {
        setRecipeToDelete(id);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        setError(null);
        setLoading(true);
        try {
            const accessToken = await getAccessTokenSilently();
            await deleteRecipe(accessToken, recipeToDelete);
            await fetchRecipes(currentPage);
            setShowModal(false);
            setRecipeToDelete(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipes = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = await getAccessTokenSilently();
            const recipesData = await getRecipesPageable(accessToken, page);
            setRecipes(recipesData.content);
            setTotalPages(recipesData.totalPages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderTable = (data) => (
        <table className="min-w-full bg-white">
            <tbody>
            {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                    <td className="py-2 px-4 border-b border-gray-200 font-semibold">{key}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                        {typeof value === 'object' ? renderNestedTable(value) : value}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const renderNestedTable = (nestedData) => (
        <table className="min-w-full bg-white">
            <tbody>
            {Object.entries(nestedData).map(([nestedKey, nestedValue]) => (
                <tr key={nestedKey}>
                    <td className="py-1 px-2 border-b border-gray-200">{nestedKey}</td>
                    <td className="py-1 px-2 border-b border-gray-200">{nestedValue}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <PageLayout>
            <div className="content-layout">
                <h1 id="page-title" className="content__title">
                    Recipes Page
                </h1>
                <div className="content__body flex justify-between items-center">
                    <p id="page-description">
                        <span>
                            This page retrieves a <strong>protected data</strong> from an
                            external API.
                        </span>
                    </p>
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
                        onClick={() => navigate('/recipes/add')}
                    >
                        Add Recipe
                    </button>
                </div>
                {loading ? (
                    <PageLoader />
                ) : (
                    <div className="overflow-x-auto">
                        {recipes.length > 0 ? (
                            <>
                                <table className="min-w-full bg-white">
                                    <thead>
                                    <tr>
                                        <th className="w-1/5 py-3 px-6 border-b-2 border-gray-300 text-left leading-tight text-black"
                                            style={{ cursor: 'pointer', background: 'var(--pink-yellow-gradient)' }}>ID
                                        </th>
                                        <th className="w-3/5 py-3 px-6 border-b-2 border-gray-300 text-left leading-tight text-black"
                                            style={{ cursor: 'pointer', background: 'var(--pink-yellow-gradient)' }}>Recipe Name</th>
                                        <th className="w-1/5 py-3 px-6 border-b-2 border-gray-300 text-left leading-tight text-black" style={{ cursor: 'pointer', background: 'var(--pink-yellow-gradient)' }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recipes.map((recipe) => (
                                        <React.Fragment key={recipe.id}>
                                            <tr onClick={() => toggleExpand(recipe.id)} className={`hover:bg-gray-100 cursor-pointer ${expandedRecipeId === recipe.id ? 'bg-gray-200' : ''}`}>
                                                <td className="w-1/5 py-3 px-6 border-b border-gray-200 text-black">{recipe.id}</td>
                                                <td className="w-3/5 py-3 px-6 border-b border-gray-200 text-black">{recipe.recipeName}</td>
                                                <td className="w-1/5 py-3 px-6 border-b border-gray-200 text-black">
                                                    <button
                                                        className="text-white font-bold py-2 px-4 rounded mr-2"
                                                        style={{ background: 'var(--blue-aqua-gradient)' }}
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(recipe.id); }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="text-white font-bold py-2 px-4 rounded"
                                                        style={{ background: 'var(--pink-yellow-gradient)' }}
                                                        onClick={(e) => { e.stopPropagation(); handleRemove(recipe.id); }}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRecipeId === recipe.id && (
                                                <tr>
                                                    <td colSpan="3" className="py-3 px-6 border-b border-gray-200 text-black">
                                                        <div className="border-t border-gray-200">
                                                            <h3 className="py-2 px-4 bg-gray-100 font-semibold">Ingredients</h3>
                                                            {renderTable(recipe.ingredients)}
                                                        </div>
                                                        <div className="border-t border-gray-200">
                                                            <h3 className="py-2 px-4 bg-gray-100 font-semibold">Instructions</h3>
                                                            {renderTable(recipe.instructions)}
                                                        </div>
                                                        <div className="border-t border-gray-200">
                                                            <h3 className="py-2 px-4 bg-gray-100 font-semibold">Tags</h3>
                                                            {renderTable(recipe.tags)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    </tbody>
                                </table>
                                <div className="flex justify-between items-center py-4">
                                    <button
                                        className="text-white font-bold py-2 px-4 rounded"
                                        style={{ background: 'var(--blue-aqua-gradient)' }}
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </button>
                                    <span>Page {currentPage + 1} of {totalPages}</span>
                                    <button
                                        className="text-white font-bold py-2 px-4 rounded"
                                        style={{ background: 'var(--pink-yellow-gradient)' }}
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-center items-center">
                                <img src={noDataImage} alt="No Data" />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this recipe?"
            />
            <Notification
                show={!!error}
                message={error}
                onClose={() => setError(null)}
            />
        </PageLayout>
    );
};
