import React, {useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import IngredientActionCreator from "../components/ingredient-action-creator/IngredientActionCreator.jsx";
import IngredientCreator from "../components/ingredient-creator/IngredientCreator.jsx";
import ProductResultCreator from "../components/product-result-creator/ProductResultCreator.jsx";
import {Modal} from "../components/modal/Modal.jsx";
import {useNavigate} from "react-router-dom";
import {createRecipe} from "../services/API.js";


export const RecipeAddPage = () => {
    const [recipeName, setRecipeName] = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [resultProduct, setResultProduct] = useState(null);
    const [currentCreator, setCurrentCreator] = useState(null);
    const [expandedIngredientIndex, setExpandedIngredientIndex] = useState(null);
    const {getAccessTokenSilently} = useAuth0();
    const [accessToken, setAccessToken] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({title: "", message: "", onConfirm: null});
    const navigate = useNavigate();

    // Fetch the access token on component mount
    useState(() => {
        const fetchAccessToken = async () => {
            try {
                const token = await getAccessTokenSilently();
                setAccessToken(token);
            } catch (error) {
                console.error("Error fetching access token", error);
            }
        };

        fetchAccessToken().catch(console.error);
    }, [getAccessTokenSilently]);

    const addIngredient = (ingredient) => {
        setIngredients([...ingredients, {...ingredient, actions: []}]);
        setCurrentCreator(null);
    };

    const addAction = (action) => {
        if (currentCreator && currentCreator.ingredientIndex !== undefined) {
            const updatedIngredients = [...ingredients];
            if (currentCreator.actionIndex !== undefined) {
                // Edit existing action
                updatedIngredients[currentCreator.ingredientIndex].actions[currentCreator.actionIndex] = action;
            } else {
                // Add new action
                updatedIngredients[currentCreator.ingredientIndex].actions.push(action);
            }
            setIngredients(updatedIngredients);
        }
        setCurrentCreator(null);
    };

    const removeAction = (ingredientIndex, actionIndex) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[ingredientIndex].actions.splice(actionIndex, 1);
        setIngredients(updatedIngredients);
    };

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const toggleIngredientActions = (index) => {
        setExpandedIngredientIndex(expandedIngredientIndex === index ? null : index);
    };

    const addProductResult = (product) => {
        setResultProduct(product);
        setCurrentCreator(null);
    };

    const convertToNumberIfApplicable = (value) => {
        if (typeof value === 'string' && !isNaN(value)) {
            return Number(value);
        }
        return value;
    };

    const handleSaveRecipe = async () => {
        if (!recipeName.trim()) {
            setModalContent({
                title: "Error",
                message: "Recipe name is required.",
                onConfirm: () => setShowModal(false),
            });
            setShowModal(true);
            return;
        }

        if (ingredients.length === 0) {
            setModalContent({
                title: "Error",
                message: "Please add at least one ingredient.",
                onConfirm: () => setShowModal(false),
            });
            setShowModal(true);
            return;
        }

        for (let i = 0; i < ingredients.length; i++) {
            if (ingredients[i].actions.length === 0) {
                setModalContent({
                    title: "Error",
                    message: `Please add at least one action to the ingredient "${ingredients[i].ingredientName}".`,
                    onConfirm: () => setShowModal(false),
                });
                setShowModal(true);
                return;
            }
        }

        if (!resultProduct || !resultProduct.name) {
            setModalContent({
                title: "Error",
                message: "Please define the result product with a name.",
                onConfirm: () => setShowModal(false),
            });
            setShowModal(true);
            return;
        }

        const transformedRecipe = {
            recipeName,
            recipe: ingredients.map(ingredient => ({
                ingredientName: ingredient.ingredientName,
                productSearch: {
                    productName: ingredient.name,
                    attributes: ingredient.attributes.reduce((acc, {key, value}) => ({
                        ...acc,
                        [key]: convertToNumberIfApplicable(value)
                    }), {}),
                    tags: ingredient.tags.reduce((acc, {key, value}) => ({
                        ...acc,
                        [key]: convertToNumberIfApplicable(value)
                    }), {}),
                    categories: ingredient.categories || []
                },
                actions: ingredient.actions.map(action => ({
                    type: action.actionType,
                    parameters: action.parameters.reduce((acc, {key, value}) => ({
                        ...acc,
                        [key]: convertToNumberIfApplicable(value)
                    }), {})
                }))
            })),
            resultingProduct: {
                mode: resultProduct.mode,
                id: resultProduct.id,
                nameMergeStrategy: resultProduct.nameMergeStrategy,
                name: resultProduct.name,
                attributeMergeStrategy: resultProduct.attributeMergeStrategy,
                attributes: Object.fromEntries(
                    Object.entries(resultProduct.attributes).map(([key, value]) => [key, convertToNumberIfApplicable(value)])
                ),
                measurementMergeStrategy: resultProduct.measurementMergeStrategy,
                measurements: Object.fromEntries(
                    Object.entries(resultProduct.measurements).map(([key, value]) => [key, {
                        value: convertToNumberIfApplicable(value.value),
                        unit: value.unit
                    }])
                ),
                availabilityMergeStrategy: resultProduct.availabilityMergeStrategy,
                availability: Object.fromEntries(
                    Object.entries(resultProduct.availability).map(([key, value]) => [key, {
                        value: convertToNumberIfApplicable(value.value),
                        unit: value.unit
                    }])
                ),
                categories: resultProduct.categories,
                tagMergeStrategy: resultProduct.tagMergeStrategy,
                tags: Object.fromEntries(
                    Object.entries(resultProduct.tags).map(([key, value]) => [key, convertToNumberIfApplicable(value)])
                )
            }
        };

        try {
            const response = await createRecipe(accessToken, transformedRecipe);
            console.log('Recipe created successfully:', response);
            setModalContent({
                title: "Success",
                message: "Recipe saved successfully!",
                onConfirm: () => {
                    setShowModal(false);
                    navigate("/recipes")
                },
            });
            setShowModal(true);
        } catch (error) {
            console.error('Failed to save recipe:', error);
            setModalContent({
                title: "Error",
                message: error.message,
                onConfirm: () => setShowModal(false),
            });
            setShowModal(true);
        }
    };


    return (
        <>
            <div className="container mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg shadow-md bg-gray-800">
                        <h2 className="text-xl font-bold mb-4 text-white">Recipe Creation</h2>
                        <div className="mb-4">
                            <label className="block font-medium text-white">Recipe Name:</label>
                            <input
                                type="text"
                                value={recipeName}
                                onChange={(e) => setRecipeName(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2 text-white">Prepared Ingredients</h3>
                            {ingredients.length > 0 ? (
                                <ul className="text-white">
                                    {ingredients.map((ingredient, index) => (
                                        <li
                                            key={index}
                                            className="mb-2 p-2 border border-white rounded flex flex-col"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{ingredient.ingredientName}</span>
                                                <div>
                                                    <button
                                                        className="p-2 bg-blue-500 text-white rounded mr-2"
                                                        onClick={() => setCurrentCreator({
                                                            type: "action",
                                                            ingredientIndex: index
                                                        })}
                                                    >
                                                        Add Action
                                                    </button>
                                                    <button
                                                        className="p-2 bg-yellow-500 text-white rounded mr-2"
                                                        onClick={() => toggleIngredientActions(index)}
                                                    >
                                                        {expandedIngredientIndex === index ? "Hide Actions" : "List Actions"}
                                                    </button>
                                                    <button
                                                        className="p-2 bg-red-500 text-white rounded"
                                                        onClick={() => removeIngredient(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            {expandedIngredientIndex === index && (
                                                <div className="mt-2">
                                                    <h4 className="font-medium text-white">Actions:</h4>
                                                    {ingredient.actions.length > 0 ? (
                                                        <ul className="pl-4">
                                                            {ingredient.actions.map((action, actionIndex) => (
                                                                <li key={actionIndex}
                                                                    className="text-white flex justify-between items-center mb-2">
                                                                    <div>
                                                                        {action.actionType} - {action.parameters.map(param => `${param.key}: ${param.value}`).join(", ")}
                                                                    </div>
                                                                    <div>
                                                                        <button
                                                                            className="p-2 bg-yellow-500 text-white rounded mr-2"
                                                                            onClick={() => setCurrentCreator({
                                                                                type: "action",
                                                                                ingredientIndex: index,
                                                                                actionIndex
                                                                            })}
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            className="p-2 bg-red-500 text-white rounded"
                                                                            onClick={() => removeAction(index, actionIndex)}
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-white">No actions added yet.</p>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-white">No ingredients added yet.</p>
                            )}
                            <div className="mt-4">
                                <button
                                    onClick={() => setCurrentCreator({type: "ingredient"})}
                                    className="p-2 bg-blue-500 text-white rounded"
                                >
                                    Create Ingredient
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-bold mb-2 text-white">Product Result</h3>
                            {resultProduct ? (
                                <div className="text-white mb-2 p-2 border border-white rounded">
                                    <p className="font-bold">{resultProduct.name}</p>
                                    <p>Attributes: {JSON.stringify(resultProduct.attributes)}</p>
                                    <p>Measurements: {JSON.stringify(resultProduct.measurements)}</p>
                                    <p>Tags: {JSON.stringify(resultProduct.tags)}</p>
                                    <p>Availability: {JSON.stringify(resultProduct.availability)}</p>
                                    <p>Categories: {resultProduct.categories.join(", ")}</p>
                                    <button
                                        className="p-2 bg-yellow-500 text-white rounded mt-2 mr-2"
                                        onClick={() => setCurrentCreator({type: "productResult"})}
                                    >
                                        Edit Product Result
                                    </button>
                                    <button
                                        className="p-2 bg-red-500 text-white rounded mt-2"
                                        onClick={() => setResultProduct(null)}
                                    >
                                        Remove Product Result
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-white mb-2">No product result added yet.</p>
                                    <button
                                        onClick={() => setCurrentCreator({type: "productResult"})}
                                        className="p-2 bg-blue-500 text-white rounded"
                                    >
                                        Create Product Result
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSaveRecipe}
                            className="mt-4 p-2 bg-green-500 text-white rounded"
                        >
                            Save Recipe
                        </button>
                    </div>
                    {currentCreator && (
                        <div className="p-4 border rounded-lg shadow-md bg-gray-800">
                            {currentCreator.type === "ingredient" && (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-white">Ingredient Creator</h2>
                                        <button
                                            onClick={() => setCurrentCreator(null)}
                                            className="p-2 bg-red-500 text-white rounded"
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <IngredientCreator addIngredient={addIngredient} accessToken={accessToken}/>
                                </>
                            )}
                            {currentCreator.type === "action" && (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-white">Action Creator</h2>
                                        <button
                                            onClick={() => setCurrentCreator(null)}
                                            className="p-2 bg-red-500 text-white rounded"
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <IngredientActionCreator
                                        addAction={addAction}
                                        onClose={() => setCurrentCreator(null)}
                                        action={
                                            currentCreator.actionIndex !== undefined
                                                ? ingredients[currentCreator.ingredientIndex].actions[currentCreator.actionIndex]
                                                : null
                                        }
                                        accessToken={accessToken}
                                        searchCriteria={ingredients[currentCreator.ingredientIndex]}
                                    />
                                </>
                            )}
                            {currentCreator.type === "productResult" && (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-bold text-white">Product Result Creator</h2>
                                        <button
                                            onClick={() => setCurrentCreator(null)}
                                            className="p-2 bg-red-500 text-white rounded"
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <ProductResultCreator
                                        addProductResult={addProductResult}
                                        productResult={resultProduct}
                                        accessToken={accessToken}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={modalContent.onConfirm}
                title={modalContent.title}
                message={modalContent.message}
            />
        </>
    );
};

export default RecipeAddPage;
