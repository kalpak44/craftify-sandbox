const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const FUNCTION_API_URL = `${API_HOST}/function`;


/**
 * Fetch a pageable list of functions from the backend.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @returns {Promise<Object>} - The pageable response: { content, totalElements, totalPages, ... }
 */
export async function listFunctions(authFetch, page = 0, size = 10) {
    const url = new URL(`${FUNCTION_API_URL}/list`);
    url.searchParams.append("page", page);
    url.searchParams.append("size", size);

    const res = await authFetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch functions");
    }
    return res.json();
}


/**
 * Registers a new function (service or job) in the backend.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {Object} functionData - { type: string, repo: string, branch: string }
 * @returns {Promise<Object>} - The created function object (or error thrown)
 */
export async function registerFunction(authFetch, functionData) {
    const res = await authFetch(`${FUNCTION_API_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(functionData)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to register function");
    }
    return res.json();
}

export async function deregisterFunction(authFetch, functionId) {
    const res = await authFetch(`${FUNCTION_API_URL}/${functionId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to deregister function");
    }
}