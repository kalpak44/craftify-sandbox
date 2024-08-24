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
                </div>
            )}
        </>
    );
};

export default NotebooksAddPage;
