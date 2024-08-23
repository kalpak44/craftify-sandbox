const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchWithAuth = async (accessToken, url, options = {}) => {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {...options, headers});

    if (response.status === 401) {
        console.error("Unauthorized, logging out...");
        throw new Error("Unauthorized");
    }

    return response;
};

export const getProductsPageable = async (accessToken, { page = 0, size = 10, id, name = "", categories = [], attributes = [], tags = [] }) => {
    const queryParams = [`page=${page}`, `size=${size}`];

    if (id) {
        queryParams.push(`id=${encodeURIComponent(id)}`);
    }

    if (name) {
        queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    if(attributes && attributes.length > 0){
        console.log(attributes)
        attributes.forEach(attribute => {
            if (attribute) queryParams.push(`attributes${encodeURIComponent(`[${attribute.key}]`)}=${encodeURIComponent(attribute.value)}`);
        });
    }

    if(tags && tags.length > 0){
        tags.forEach(tag => {
            if (tag) queryParams.push(`tags${encodeURIComponent(`[${tag.key}]`)}=${encodeURIComponent(tag.value)}`);
        });
    }

    if (categories && categories.length > 0) {
        categories.forEach(category => {
            if (category) queryParams.push(`categories=${encodeURIComponent(category)}`);
        });
    }

    const queryString = queryParams.join("&");
    const response = await fetchWithAuth(accessToken, `/products?${queryString}`);
    return response.json();
};


export const createProduct = async (accessToken, productData) => {
    const response = await fetchWithAuth(accessToken, "/products", {
        method: "POST",
        body: JSON.stringify(productData),
    });
    return response.json();
};

export const getProductById = async (accessToken, productId) => {
    const response = await fetchWithAuth(accessToken, `/products/${productId}`);
    return response.json();
};

export const updateProduct = async (accessToken, productId, productData) => {
    const response = await fetchWithAuth(accessToken, `/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(productData),
    });
    return response.json();
};

export const deleteProduct = async (accessToken, productId) => {
    const response = await fetchWithAuth(accessToken, `/products/${productId}`, {
        method: "DELETE",
    });
    return response.ok;
};

export const getRecipesPageable = async (accessToken, page = 0, size = 10) => {
    const response = await fetchWithAuth(accessToken, `/recipes?page=${page}&size=${size}`);
    return response.json();
};

export const deleteRecipe = async (accessToken, recipeId) => {
    const response = await fetchWithAuth(accessToken, `/recipes/${recipeId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to delete recipe. ${body.message}`);
    }
};

export const createRecipe = async (accessToken, recipeData) => {
    const response = await fetchWithAuth(accessToken, "/recipes", {
        method: "POST",
        body: JSON.stringify(recipeData),
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to create recipe. ${body.message}`);
    }
    return response.json();
};

export const getRecipeYield = async (accessToken, recipeId) => {
    const response = await fetchWithAuth(accessToken, `/recipes/${recipeId}/yield`);
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to get recipe yield. ${body.message}`);
    }
    return response.json();
};

export const applyRecipe = async (accessToken, recipeId, amount) => {
    const response = await fetchWithAuth(accessToken, `/recipes/${recipeId}/apply`, {
        method: "POST",
        body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to apply recipe. ${body.message}`);
    }
    return response.json();
};

export const getNotebooksPageable = async (accessToken, {page = 0, size = 10, name = ""} = {}) => {
    const queryParams = [`page=${page}`, `size=${size}`];

    if (name) {
        queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    const queryString = queryParams.join("&");
    const response = await fetchWithAuth(accessToken, `/notebooks?${queryString}`);
    return response.json();
};

export const deleteNotebook = async (accessToken, notebookId) => {
    const response = await fetchWithAuth(accessToken, `/notebooks/${notebookId}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const body = await response.json();
        throw new Error(`Failed to delete notebook. ${body.message}`);
    }
    return response.ok;
};
export const createNotebook = async (accessToken, notebookData) => {
    const response = await fetchWithAuth(accessToken, "/notebooks", {
        method: "POST",
        body: JSON.stringify(notebookData),
    });
    return response.json();
};

export const updateNotebook = async (accessToken, notebookId, notebookData) => {
    const response = await fetchWithAuth(accessToken, `/notebooks/${notebookId}`, {
        method: "PATCH",
        body: JSON.stringify(notebookData),
    });
    return response.json();
};

export const getNotebookById = async (accessToken, notebookId) => {
    const response = await fetchWithAuth(accessToken, `/notebooks/${notebookId}`);
    return response.json();
};
