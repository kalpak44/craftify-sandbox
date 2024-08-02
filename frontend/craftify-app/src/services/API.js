const API_BASE_URL = "http://localhost:8080";

const fetchWithAuth = async (accessToken, url, options = {}) => {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {...options, headers});

    if (response.status === 401) {
        console.error("Unauthorized, logging out...");
        //localStorage.removeItem("jwt_token");
        throw new Error("Unauthorized");
    }

    return response;
};

export const getProductsPageable = async (accessToken, { page = 0, size = 10, name = "", categories = [] }) => {
    const queryParams = [`page=${page}`, `size=${size}`];

    if (name) {
        queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    if (categories.length > 0) {
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
        throw new Error('Failed to delete recipe');
    }
};
