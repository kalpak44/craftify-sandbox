const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const DATA_STORE_API_URL = `${API_HOST}/data-stores`;



/**
 * Fetch a pageable list of data stores from the backend.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @returns {Promise<Object>} - The pageable response: { content, totalElements, totalPages, ... }
 */
export async function listDataStores(authFetch, page = 0, size = 10) {
    const url = new URL(`${DATA_STORE_API_URL}/list`);
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

