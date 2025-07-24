const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const FORMS_API_URL = `${API_HOST}/forms/`;


/**
 * Fetch a pageable list of forms from the backend.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @returns {Promise<Object>} - The pageable response: { content, totalElements, totalPages, ... }
 */
export async function listForms(authFetch, page = 0, size = 10) {
    const url = new URL(`${FORMS_API_URL}`);
    url.searchParams.append("page", page);
    url.searchParams.append("size", size);

    const res = await authFetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch forms");
    }
    return res.json();
}

