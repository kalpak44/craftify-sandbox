const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const API_URL = `${API_HOST}/schemas`;

const getToken = () => localStorage.getItem("access_token");

const headers = () => ({
    "Authorization": `Bearer ${getToken()}`,
    "Content-Type": "application/json"
});

/**
 * List all schemas with pagination
 * @param {number} page
 * @param {number} size
 * @returns {Promise<{ content: Array, page: number, size: number, totalPages: number, totalElements: number }>}
 */
export const listSchemas = async (page = 0, size = 10) => {
    const res = await fetch(`${API_URL}?page=${page}&size=${size}`, {
        headers: headers()
    });

    if (!res.ok) throw new Error("Failed to fetch schemas");
    return res.json();
};

/**
 * Get details of a schema by ID
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const getSchema = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: headers()
    });

    if (!res.ok) throw new Error("Schema not found");
    return res.json();
};

/**
 * Create a new schema
 * @param {Object} schema
 * @returns {Promise<Object>}
 */
export const createSchema = async (schema) => {
    const res = await window.authFetch(`${API_URL}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(schema)
    });

    if (!res.ok) throw new Error("Failed to create schema");
    return res.json();
};

/**
 * Update an existing schema by ID
 * @param {string} id
 * @param {Object} schema
 * @returns {Promise<Object>}
 */
export const updateSchema = async (id, schema) => {
    const res = await window.authFetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(schema)
    });

    if (res.status === 409) {
        throw new Error("Cannot update schema — update restricted.");
    }

    if (!res.ok) throw new Error("Failed to update schema");
    return res.json();
};

/**
 * Delete a schema by ID
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteSchema = async (id) => {
    const res = await window.authFetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: headers()
    });

    if (res.status === 409) {
        throw new Error("Cannot delete schema — it has associated records.");
    }

    if (!res.ok) throw new Error("Failed to delete schema");
};
