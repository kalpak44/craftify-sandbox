const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const FORMS_API_URL = `${API_HOST}/forms`;


/**
 * Fetch a pageable list of forms from the backend.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @returns {Promise<Object>} - The pageable response: { content, totalElements, totalPages, ... }
 */
export async function listForms(authFetch, page = 0, size = 10) {
    const url = new URL(`${FORMS_API_URL}/`);
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


export async function saveForm(authFetch, formDefinition) {
    const res = await authFetch(`${FORMS_API_URL}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formDefinition)
    });

    if (!res.ok) {
        const errorText = await res.json();
        throw new Error(errorText || "Failed to save form");
    }
    return res.json();
}


export async function loadDetails(authFetch, formId) {
    const res = await authFetch(`${FORMS_API_URL}/${formId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        const errorText = await res.json();
        throw new Error(errorText || "Failed to load form");
    }
    return res.json();
}


export async function submitForm(authFetch, formId, formData) {
    const res = await authFetch(`${FORMS_API_URL}/${formId}/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
    });

    if (!res.ok) {
        const errorText = await res.json();
        throw new Error(errorText || "Failed to submit form");
    }
}

/**
 * Delete a form by ID
 * @param {Function} authFetch
 * @param {string} id
 */
export async function deleteForm(authFetch, id) {
    const url = new URL(`${FORMS_API_URL}/${id}`);
    const res = await authFetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to delete form");
    }
}
