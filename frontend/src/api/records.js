const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const BASE_URL = `${API_HOST}/schemas`;

const getToken = () => localStorage.getItem("access_token");

const headers = () => ({
    "Authorization": `Bearer ${getToken()}`,
    "Content-Type": "application/json"
});

/**
 * List records under a schema with pagination
 * @param {string} schemaId
 * @param {number} page
 * @param {number} size
 * @returns {Promise<{ content: Array, page: number, size: number, totalPages: number, totalElements: number }>}
 */
export const listRecords = async (schemaId, page = 0, size = 10) => {
    const res = await fetch(`${BASE_URL}/${schemaId}/records?page=${page}&size=${size}`, {
        headers: headers()
    });

    if (!res.ok) throw new Error("Failed to fetch records");
    return res.json();
};

/**
 * Get a single record by ID
 * @param {string} schemaId
 * @param {string} recordId
 * @returns {Promise<Object>}
 */
export const getRecord = async (schemaId, recordId) => {
    const res = await fetch(`${BASE_URL}/${schemaId}/records/${recordId}`, {
        headers: headers()
    });

    if (!res.ok) throw new Error("Record not found");
    return res.json();
};

/**
 * Create a new record under the specified schema.
 * @param {string} schemaId - ID of the schema.
 * @param {Object} record - RecordDto: { name, description, data }
 * @returns {Promise<Object>} The created record.
 */
export const createRecord = async (schemaId, record) => {
    const res = await fetch(`${BASE_URL}/${schemaId}/records`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(record)
    });

    if (!res.ok) throw new Error("Failed to create record");
    return res.json();
};

/**
 * Update an existing record.
 * @param {string} schemaId - ID of the schema.
 * @param {string} recordId - ID of the record.
 * @param {Object} record - RecordDto to update.
 * @returns {Promise<Object>} The updated record.
 */
export const updateRecord = async (schemaId, recordId, record) => {
    const res = await fetch(`${BASE_URL}/${schemaId}/records/${recordId}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(record)
    });

    if (res.status === 409) {
        throw new Error("Validation failed or update not allowed");
    }

    if (!res.ok) throw new Error("Failed to update record");
    return res.json();
};


/**
 * Delete a record by ID
 * @param {string} schemaId
 * @param {string} recordId
 * @returns {Promise<void>}
 */
export const deleteRecord = async (schemaId, recordId) => {
    const res = await fetch(`${BASE_URL}/${schemaId}/records/${recordId}`, {
        method: "DELETE",
        headers: headers()
    });

    if (!res.ok && res.status !== 404) {
        throw new Error("Failed to delete record");
    }
};
