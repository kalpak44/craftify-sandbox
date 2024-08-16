import {useAuth0} from "@auth0/auth0-react";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {applyRecipe, deleteRecipe, getRecipesPageable, getRecipeYield} from "../services/API";
import {PageLayout} from "../components/page-layout/PageLayout.jsx";
import {PageLoader} from "../components/page-loader/PageLoader.jsx";
import {Modal} from "../components/modal/Modal.jsx";
import {Notification} from "../components/notification/Notification.jsx";
import noDataImage from '../assets/no-data.png';

export const RecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [expandedRecipeId, setExpandedRecipeId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const {getAccessTokenSilently} = useAuth0();
    const navigate = useNavigate();
    const [modalContent, setModalContent] = useState({title: "", message: "", onConfirm: null});

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

    const handleEdit = (id) => {
        navigate(`/recipes/${id}`);
    };

    const handleRemove = (id) => {
        setModalContent({
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this recipe?",
            onConfirm: () => confirmDelete(id),
        });
        setShowModal(true);
    };

    const confirmDelete = async (id) => {
        setError(null);
        setLoading(true);
        try {
            const accessToken = await getAccessTokenSilently();
            await deleteRecipe(accessToken, id);
            await fetchRecipes(currentPage);
            setShowModal(false);
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

    const handleCook = async (recipe) => {
        try {
            const accessToken = await getAccessTokenSilently();
            const yieldResponse = await getRecipeYield(accessToken, recipe.id);
            const maxYield = yieldResponse.yield;

            // workaround
            let newAmount = maxYield;

            if (maxYield > 0) {

                setModalContent({
                    title: "Cook Recipe",
                    message: (
                        <div style={{color: 'black'}}>
                            <p>Max possible portions: {maxYield}</p>
                            <label>
                                Select portions:
                                <input
                                    type="number"
                                    min={1}
                                    max={maxYield}
                                    defaultValue={maxYield}
                                    onChange={(e) => {
                                        newAmount = Number(e.target.value);
                                    }}
                                    className="mt-2 p-2 border rounded"
                                    style={{color: 'black'}}
                                />
                            </label>
                        </div>
                    ),
                    onConfirm: async () => {
                        try {
                            await applyRecipe(accessToken, recipe.id, newAmount);
                            setShowModal(false);
                        } catch (err) {
                            setError(err.message);
                        }
                    },
                });

                setShowModal(true);
            } else if (yieldResponse.issues && yieldResponse.issues.length > 0) {
                setModalContent({
                    title: "Issues Found",
                    message: (
                        <ul className="list-disc list-inside" style={{color: 'black'}}>
                            {yieldResponse.issues.map((issue, index) => (
                                <li key={index} className="text-red-600">
                                    {issue}
                                </li>
                            ))}
                        </ul>
                    ),
                    onConfirm: () => setShowModal(false),
                });

                setShowModal(true);
            } else {
                setModalContent({
                    title: "Nothing to be cooked",
                    message: "It appears that there aren't enough ingredients available.",
                    onConfirm: () => setShowModal(false),
                });

                setShowModal(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const renderTable = (data) => (
        <table className="min-w-full bg-gray-800 text-white">
            <tbody>
            {Object.entries(data).map(([key, value]) => (
                <tr key={key}>
                    <td className="py-2 px-4 border-b border-gray-600 font-semibold">{key}</td>
                    <td className="py-2 px-4 border-b border-gray-600">
                        {typeof value === 'object' ? renderNestedTable(value) : value}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    const renderNestedTable = (nestedData) => (
        <table className="min-w-full bg-gray-800 text-white">
            <tbody>
            {Object.entries(nestedData).map(([nestedKey, nestedValue]) => (
                <tr key={nestedKey}>
                    <td className="py-1 px-2 border-b border-gray-600">{nestedKey}</td>
                    <td className="py-1 px-2 border-b border-gray-600">{nestedValue}</td>
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
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-white">Recipes Page</h1>
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
                    <PageLoader/>
                ) : (
                    <div className="overflow-x-auto p-4 border rounded-lg shadow-md bg-gray-800">
                        {recipes.length > 0 ? (
                            <>
                                <table className="min-w-full bg-gray-800 text-white">
                                    <thead>
                                    <tr>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">ID</th>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">Recipe Name</th>
                                        <th className="py-3 px-6 border-b-2 border-gray-600 text-left">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recipes.map((recipe) => (
                                        <React.Fragment key={recipe.id}>
                                            <tr
                                                className={`hover:bg-gray-700 ${expandedRecipeId === recipe.id ? 'bg-gray-900' : ''}`}
                                            >
                                                <td className="py-3 px-6 border-b border-gray-600">{recipe.id}</td>
                                                <td className="py-3 px-6 border-b border-gray-600">{recipe.recipeName}</td>
                                                <td className="py-3 px-6 border-b border-gray-600">
                                                    <button
                                                        className="p-2 bg-green-500 text-white rounded mr-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(recipe.id);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="p-2 bg-red-500 text-white rounded mr-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemove(recipe.id);
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                    <button
                                                        className="p-2 bg-blue-500 text-white rounded"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCook(recipe);
                                                        }}
                                                    >
                                                        Cook
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRecipeId === recipe.id && (
                                                <tr>
                                                    <td colSpan="3" className="py-3 px-6 border-b border-gray-600">
                                                        <div className="border-t border-gray-600">
                                                            <h3 className="py-2 px-4 bg-gray-700 font-semibold">Ingredients</h3>
                                                            {renderTable(recipe.ingredients)}
                                                        </div>
                                                        <div className="border-t border-gray-600">
                                                            <h3 className="py-2 px-4 bg-gray-700 font-semibold">Instructions</h3>
                                                            {renderTable(recipe.instructions)}
                                                        </div>
                                                        <div className="border-t border-gray-600">
                                                            <h3 className="py-2 px-4 bg-gray-700 font-semibold">Tags</h3>
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
                                        className="p-2 bg-blue-500 text-white rounded"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-white">Page {currentPage + 1} of {totalPages}</span>
                                    <button
                                        className="p-2 bg-blue-500 text-white rounded"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages - 1}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex justify-center items-center">
                                <img src={noDataImage} alt="No Data"/>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={modalContent.onConfirm}
                title={modalContent.title}
                message={modalContent.message}
            />
            <Notification
                show={!!error}
                message={error}
                onClose={() => setError(null)}
            />
        </PageLayout>
    );
};
