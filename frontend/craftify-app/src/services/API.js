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

export const getProductsPageable = async (accessToken, page = 0, size = 10) => {
    const response = await fetchWithAuth(accessToken, `/products?page=${page}&size=${size}`);
    return response.json();
};
