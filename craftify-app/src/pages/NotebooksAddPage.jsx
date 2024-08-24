import React, {useEffect, useState} from 'react';
import {useAuth0} from '@auth0/auth0-react';
import {useNavigate} from 'react-router-dom';
import NotebookEditor from "../components/notebook-editor/NotebookEditor.jsx";
import {PageLoader} from "../components/page-loader/PageLoader.jsx";
import {Modal} from "../components/modal/Modal.jsx";
import {createNotebook} from '../services/API';

const NotebooksAddPage = () => {
    const {getAccessTokenSilently} = useAuth0();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false); // Modal for name error
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal for confirmation
    const [showDemoModal, setShowDemoModal] = useState(false); // Modal for demo creation
    const [accessToken, setAccessToken] = useState(null);
    const [notebook, setNotebook] = useState({
        name: "My Notebook",
        cells: [{
            id: '1',
            type: 'markdown',
            content: `
# Security Warning

It's important to be cautious when executing code from untrusted sources. Executing code from insecure or unknown places can lead to security vulnerabilities, including unauthorized access to your data or system. Always ensure that the source of the code is trusted before execution.

# Predefined Functions

This section documents predefined functions used in the codebase, including examples of how to use them.

### get_product_list(page=0, size=5, name = "Olive Oil", tags={"usage":"Cooking"}, categories=['Oils'])

This function retrieves a pageable list of products from the API.

### Example of Usage

\`\`\`python
# Define name, tags and categories to filter by
name = "Olive Oil"
tags = {"category":"Oil","usage":"Cooking"}

categories = ['Oils']

# Retrieve pageable list of products and store the result in as_json
as_json = await get_product_list(page=0, size=3, name=name, tags=tags, categories=categories)

# Format the JSON for pretty printing
formatted_json = json.dumps(as_json, indent=4)
formatted_json
\`\`\`

### get_product_by_id(product_id="12345")

This function retrieves a specific product by its ID from the API.

### Example of Usage

\`\`\`python
# Define the product ID
product_id = "12345"

# Retrieve the product by its ID and store the result in as_json
as_json = await get_product_by_id(product_id)


# Format the JSON for pretty printing
formatted_json = json.dumps(as_json, indent=4)
formatted_json
\`\`\`


### create_product(product_data={})

This function creates a new product by sending a POST request to the API.

### Example of Usage

\`\`\`python
# Define the product data
product_data = {
    "name": "New Cooking Oil",
    "attributes": {"type": "Vegetable", "usage": "Cooking"},
    "tags": {"category": "Oil"},
    "measurements": {"volume": {"value": 1, "unit": "liter"}},
    "availability": {"inStock": {"value": 50, "unit": "bottles"}},
    "categories": ["Oils"]
}

# Create a new product and store the result in as_json
as_json = await create_product(product_data)

# Format the JSON for pretty printing
formatted_json = json.dumps(as_json, indent=4)
formatted_json
\`\`\`

### update_product(product_id="12345", update_data={})

This function updates an existing product by sending a PATCH request to the API.

### Example of Usage

\`\`\`python
# Define the product ID and the update data
product_id = "12345"
update_data = {
    "name": "Updated Cooking Oil",
    "attributes": {"type": "Vegetable", "usage": "Cooking"},
    "availability": {"inStock": {"value": 30, "unit": "bottles"}}
}

# Update the product and store the result in as_json
as_json = await update_product(product_id, update_data)

# Format the JSON for pretty printing
formatted_json = json.dumps(as_json, indent=4)
formatted_json
\`\`\`

### delete_product(product_id="12345")

This function deletes a product by sending a DELETE request to the API.

### Example of Usage

\`\`\`python
# Define the product ID to delete
product_id = "12345"

# Delete the product and store the result in as_json
as_json = await delete_product(product_id)

# Check the result of the deletion
formatted_json = json.dumps(as_json, indent=4)
formatted_json
\`\`\`


`,
            editing: false,
        }]
    });


    const demoNotebooks = [
        {
            "name": "Number of omelets we can cook",
            "cells": [
                {
                    "id": "1724433890166",
                    "type": "markdown",
                    "content": "### Omelet Calculation Notebook\n\nThis notebook calculates the number of possible omelets that can be cooked based on the total available eggs and oil, using predefined requirements of 2 eggs and 50 ml of oil per omelet. The formula used is `min(total_eggs // 2, total_volume_ml // 50)`, which ensures the number of omelets is limited by the scarcest ingredient.\n"
                },
                {
                    "id": "1724426487686",
                    "type": "code",
                    "content": "async def fetch_oil_total_volume_ml(tags, categories):\n    total_volume_ml = 0\n    page = 0\n    \n    # Conversion factors to ml for other units (example: liters to ml, gallons to ml, etc.)\n    conversion_factors = {\n        \"ml\": 1,\n        \"l\": 1000,\n        \"liters\": 1000,\n        \"gallons\": 3785.41 \n    }\n    \n    while True:\n        # Retrieve pageable list of oil products for the current page\n        response = await get_product_list(page=page, size=5, tags=tags, categories=categories)\n        \n        # If no products found, break the loop\n        if response['totalElements'] == 0:\n            break\n        \n        # Calculate total volume in ml\n        for product in response['content']:\n            availability = product.get('availability', {}).get('volume', {})\n            unit = availability.get('unit')\n            value = availability.get('value')\n            \n            if unit and value:\n                # Convert the volume to ml if the unit is recognized\n                conversion_factor = conversion_factors.get(unit.lower())\n                if conversion_factor:\n                    total_volume_ml += value * conversion_factor\n        \n        # If this is the last page, exit the loop\n        if response['last']:\n            break\n        \n        # Move to the next page\n        page += 1\n    \n    return total_volume_ml\n\n# Define tags and categories to filter by\ntags = {\"category\": \"Oil\", \"usage\": \"Cooking\"}\ncategories = ['Oils']\n\n# Fetch the total volume in ml from all oil products\ntotal_oil_volume_ml = await fetch_oil_total_volume_ml(tags, categories)\n\ntotal_oil_volume_ml\n"
                },
                {
                    "id": "1724433016789",
                    "type": "code",
                    "content": "async def fetch_total_eggs(tags):\n    total_eggs = 0\n    page = 0\n    \n    while True:\n        # Retrieve pageable list of egg products for the current page\n        response = await get_product_list(page=page, size=5, tags=tags)\n        \n        # If no products found, break the loop\n        if response['totalElements'] == 0:\n            break\n        \n        # Calculate the total number of eggs\n        for product in response['content']:\n            availability = product.get('availability', {}).get('quantity', {})\n            unit = availability.get('unit')\n            value = availability.get('value')\n            \n            if unit and value:\n                # Only add the quantity if the unit is 'count'\n                if unit.lower() == 'count':\n                    total_eggs += value\n        \n        # If this is the last page, exit the loop\n        if response['last']:\n            break\n        \n        # Move to the next page\n        page += 1\n    \n    return total_eggs\n\n# Define tags to filter by\ntags = {\"product\": \"Eggs\"}\n\n# Fetch the total number of eggs\ntotal_eggs = await fetch_total_eggs(tags)\n\ntotal_eggs\n"
                },
                {
                    "id": "1724433195546",
                    "type": "code",
                    "content": "# Define the necessary ingredients for one portion of an omelet\neggs_per_omelet = 2\noil_per_omelet_ml = 50\n\n# Calculate the maximum number of omelets based on eggs\nmax_omelets_by_eggs = total_eggs // eggs_per_omelet\n\n# Calculate the maximum number of omelets based on oil\nmax_omelets_by_oil = total_oil_volume_ml // oil_per_omelet_ml\n\n# The actual number of omelets we can cook is limited by the lesser of the two quantities\ntotal_omelets = min(max_omelets_by_eggs, max_omelets_by_oil)\n\n# Print the result\ntotal_omelets\n"
                }
            ]
        },
        {
            "name": "Omelette Cooking and Resource Deduction",
            "cells": [
                {
                    "id": "1724487926181",
                    "type": "markdown",
                    "content": "### Omelette Cooking and Resource Deduction\n\nThis notebook creates an omelette by combining available eggs and oil, updating the inventory to reflect the deduction of these ingredients"
                },
                {
                    "id": "1724485382591",
                    "type": "code",
                    "content": "# Conversion factors to ml for other units (example: liters to ml, gallons to ml, etc.)\nconversion_factors = {\n    \"ml\": 1,\n    \"l\": 1000,\n    \"liters\": 1000,\n    \"gallons\": 3785.41 \n}\n\nasync def fetch_oil_total_volume_ml(tags, categories):\n    total_volume_ml = 0\n    page = 0\n    \n    while True:\n        # Retrieve pageable list of oil products for the current page\n        response = await get_product_list(page=page, size=5, tags=tags, categories=categories)\n        \n        # If no products found, break the loop\n        if response['totalElements'] == 0:\n            break\n        \n        # Calculate total volume in ml\n        for product in response['content']:\n            availability = product.get('availability', {}).get('volume', {})\n            unit = availability.get('unit')\n            value = availability.get('value')\n            \n            if unit and value:\n                # Convert the volume to ml if the unit is recognized\n                conversion_factor = conversion_factors.get(unit.lower())\n                if conversion_factor:\n                    total_volume_ml += value * conversion_factor\n        \n        # If this is the last page, exit the loop\n        if response['last']:\n            break\n        \n        # Move to the next page\n        page += 1\n    \n    return total_volume_ml\n\n# Define tags and categories to filter by\ntags = {\"category\": \"Oil\", \"usage\": \"Cooking\"}\ncategories = ['Oils']\n\n# Fetch the total volume in ml from all oil products\ntotal_oil_volume_ml = await fetch_oil_total_volume_ml(tags, categories)\n\ntotal_oil_volume_ml\n"
                },
                {
                    "id": "1724485410932",
                    "type": "code",
                    "content": "async def fetch_total_eggs(tags):\n    total_eggs = 0\n    page = 0\n    \n    while True:\n        # Retrieve pageable list of egg products for the current page\n        response = await get_product_list(page=page, size=5, tags=tags)\n        \n        # If no products found, break the loop\n        if response['totalElements'] == 0:\n            break\n        \n        # Calculate the total number of eggs\n        for product in response['content']:\n            availability = product.get('availability', {}).get('quantity', {})\n            unit = availability.get('unit')\n            value = availability.get('value')\n            \n            if unit and value:\n                # Only add the quantity if the unit is 'count'\n                if unit.lower() == 'count':\n                    total_eggs += value\n        \n        # If this is the last page, exit the loop\n        if response['last']:\n            break\n        \n        # Move to the next page\n        page += 1\n    \n    return total_eggs\n\n# Define tags to filter by\ntags = {\"product\": \"Eggs\"}\n\n# Fetch the total number of eggs\ntotal_eggs = await fetch_total_eggs(tags)\n\ntotal_eggs\n"
                },
                {
                    "id": "1724485443074",
                    "type": "code",
                    "content": "# Define the necessary ingredients for one portion of an omelet\neggs_per_omelet = 2\noil_per_omelet_ml = 50\n\n# Calculate the maximum number of omelets based on eggs\nmax_omelets_by_eggs = total_eggs // eggs_per_omelet\n\n# Calculate the maximum number of omelets based on oil\nmax_omelets_by_oil = total_oil_volume_ml // oil_per_omelet_ml\n\n# The actual number of omelets we can cook is limited by the lesser of the two quantities\ntotal_omelets = min(max_omelets_by_eggs, max_omelets_by_oil)\n\n# Print the result\ntotal_omelets"
                },
                {
                    "id": "1724485890229",
                    "type": "code",
                    "content": "# Step 4: Check if we can cook the desired portions\nwanted_portions = 2\nif total_omelets < wanted_portions:\n    raise ValueError(f\"Not enough ingredients to cook {wanted_portions} portions of omelette. We can only make {total_omelets} portions.\")\n\nf\"We can cook {wanted_portions} portions of omelette.\"\n"
                },
                {
                    "id": "1724486001997",
                    "type": "code",
                    "content": "# Search for a product named \"Omelette\"\nomelette_response = await get_product_list(name=\"Omelette\")\nomelette_product = omelette_response['content'][0] if omelette_response['totalElements'] > 0 else None\nresult = \"\"\nif omelette_product:\n    # If the product exists, fetch it and update the portions\n    product_id = omelette_product['id']\n    existing_product = await get_product_by_id(product_id)\n    existing_portions = existing_product['availability'].get('portions', {}).get('value', 0)\n    new_portions = existing_portions + wanted_portions\n    existing_product['availability']['portions']['value'] = new_portions\n    await update_product(product_id, existing_product)\n    result = f\"Updated 'Omelette' product with {wanted_portions} new portions.\"\nelse:\n    # If the product doesn't exist, create it\n    product_data = {\n        \"name\": \"Omelette\",\n        \"attributes\": {\"type\": \"Food\", \"usage\": \"Meal\"},\n        \"tags\": {\"category\": \"Meal\"},\n        \"measurements\": {\"portions\": {\"value\": wanted_portions, \"unit\": \"portion\"}},\n        \"availability\": {\"portions\": {\"value\": wanted_portions, \"unit\": \"portion\"}},\n        \"categories\": [\"Meals\"]\n    }\n    await create_product(product_data)\n    result = f\"Created 'Omelette' product with {wanted_portions} portions.\"\n\nresult"
                },
                {
                    "id": "1724487663709",
                    "type": "code",
                    "content": "eggs_needed = eggs_per_omelet * wanted_portions\noil_needed_ml = oil_per_omelet_ml * wanted_portions\n\n# Deduct the required eggs\npage = 0\nwhile eggs_needed > 0:\n    egg_response = await get_product_list(page=page, size=5, tags={\"product\": \"Eggs\"})\n    for product in egg_response['content']:\n        availability = product.get('availability', {}).get('quantity', {})\n        unit = availability.get('unit')\n        value = availability.get('value')\n        \n        if unit and value and unit.lower() == 'count':\n            product_id = product['id']\n            existing_product = await get_product_by_id(product_id)\n            \n            if value >= eggs_needed:\n                existing_product['availability']['quantity']['value'] -= eggs_needed\n                eggs_needed = 0\n            else:\n                eggs_needed -= value\n                existing_product['availability']['quantity']['value'] = 0\n            \n            await update_product(product_id, existing_product)\n        \n        if eggs_needed == 0:\n            break\n    page += 1\n\n# Deduct the required oil\npage = 0\nwhile oil_needed_ml > 0:\n    oil_response = await get_product_list(page=page, size=5, tags={\"category\": \"Oil\"}, categories=[\"Oils\"])\n    for product in oil_response['content']:\n        availability = product.get('availability', {}).get('volume', {})\n        unit = availability.get('unit')\n        value = availability.get('value')\n\n        if unit and value:\n            conversion_factor = conversion_factors.get(unit.lower())\n            if conversion_factor:\n                oil_available_ml = value * conversion_factor\n                product_id = product['id']\n                existing_product = await get_product_by_id(product_id)\n                \n                if oil_available_ml >= oil_needed_ml:\n                    existing_product['availability']['volume']['value'] = (oil_available_ml - oil_needed_ml) / conversion_factor\n                    oil_needed_ml = 0\n                else:\n                    oil_needed_ml -= oil_available_ml\n                    existing_product['availability']['volume']['value'] = 0\n                \n                await update_product(product_id, existing_product)\n        \n        if oil_needed_ml == 0:\n            break\n    page += 1\n\nf\"{wanted_portions} portions of omelette prepared and stored successfully.\""
                }
            ]
        }
    ]

    useEffect(() => {
        let isMounted = true;

        const fetchAccessToken = async () => {
            try {
                const token = await getAccessTokenSilently();
                if (isMounted) {
                    setAccessToken(token);
                }
            } catch (err) {
                setShowErrorModal(true);
            }
        };

        fetchAccessToken();

        return () => {
            isMounted = false;
        };
    }, [getAccessTokenSilently]);

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
            await createNotebook(accessToken, notebook);
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

    const handleCreateDemos = async () => {
        setLoading(true);
        setShowDemoModal(false);
        try {
            for (const demoNotebook of demoNotebooks) {
                await createNotebook(accessToken, demoNotebook);
            }
            navigate('/notebooks'); // Redirect after creating demo notebooks
        } catch (error) {
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoButtonClick = () => {
        setShowDemoModal(true); // Show modal when the demo creation button is clicked
    };

    return (
        <>
            {loading ? (
                <PageLoader/>
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
                    <NotebookEditor notebook={notebook} accessToken={accessToken} onUpdateNotebook={setNotebook}/>
                    <div className="flex flex-wrap md:flex-nowrap gap-4 mt-4">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex-1 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                            style={{background: 'var(--pink-yellow-gradient)', fontFamily: 'var(--font-primary)'}}
                        >
                            Save Notebook
                        </button>
                        <button
                            type="button"
                            onClick={handleDemoButtonClick}
                            className="flex-1 py-2 px-4 rounded text-white font-bold shadow-md transition duration-200"
                            style={{background: 'var(--blue-green-gradient)', fontFamily: 'var(--font-primary)'}}
                        >
                            Create Demo Notebooks
                        </button>
                    </div>
                    <Modal
                        show={showErrorModal}
                        onClose={() => setShowErrorModal(false)}
                        onConfirm={()=>setShowErrorModal(false)}
                        title="Error"
                        message="Notebook name is required."
                    />
                    <Modal
                        show={showConfirmModal}
                        onClose={() => setShowConfirmModal(false)}
                        onConfirm={confirmSave}
                        title="Confirm Submission"
                        message="Are you sure you want to submit this notebook?"
                    />
                    <Modal
                        show={showDemoModal}
                        onClose={() => setShowDemoModal(false)}
                        onConfirm={handleCreateDemos}
                        title="Create Demo Notebooks"
                        message="Are you sure you want to create demo notebooks?"
                    />
                </div>
            )}
        </>
    );
};

export default NotebooksAddPage;