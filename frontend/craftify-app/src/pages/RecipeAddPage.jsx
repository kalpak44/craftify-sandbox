import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react"; // Import the Auth0 hook
import { PageLayout } from "../components/page-layout/PageLayout.jsx";
import IngredientCreator from "../components/ingredient-creator/IngredientCreator.jsx";

export const RecipeAddPage = () => {
    const [recipeName, setRecipeName] = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [isCreatingIngredient, setIsCreatingIngredient] = useState(false);
    const [accessToken, setAccessToken] = useState(null); // State to hold access token
    const { getAccessTokenSilently } = useAuth0(); // Use Auth0 hook to get access token

    useEffect(() => {
        const fetchAccessToken = async () => {
            try {
                const token = await getAccessTokenSilently();
                setAccessToken(token); // Store the access token
            } catch (error) {
                console.error("Error fetching access token:", error);
            }
        };

        fetchAccessToken().catch(console.error);
    }, [getAccessTokenSilently]);

    const addIngredient = (ingredient) => {
        setIngredients([...ingredients, ingredient]);
        setIsCreatingIngredient(false);
    };

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleSaveRecipe = () => {
        if (!recipeName.trim()) {
            alert("Recipe name is required.");
            return;
        }

        if (ingredients.length === 0) {
            alert("Please add at least one ingredient.");
            return;
        }

        // Logic to save the recipe
        console.log({
            recipeName,
            ingredients,
        });

        alert("Recipe saved successfully!");
    };

    return (
        <PageLayout>
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
                                        <li key={index} className="mb-2 flex justify-between">
                                            <span>{ingredient.name}</span>
                                            <button
                                                onClick={() => removeIngredient(index)}
                                                className="p-2 bg-red-500 text-white rounded"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex items-center justify-between text-white">
                                    <p>No ingredients added yet.</p>
                                    <button
                                        onClick={() => setIsCreatingIngredient(true)}
                                        className="ml-4 p-2 bg-blue-500 text-white rounded"
                                    >
                                        Create Ingredient
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
                    {isCreatingIngredient && accessToken && (
                        <div className="p-4 border rounded-lg shadow-md bg-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Ingredient Creator</h2>
                                <button
                                    onClick={() => setIsCreatingIngredient(false)}
                                    className="p-2 bg-red-500 text-white rounded"
                                >
                                    Close
                                </button>
                            </div>
                            <IngredientCreator addIngredient={addIngredient} accessToken={accessToken} />
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default RecipeAddPage;
