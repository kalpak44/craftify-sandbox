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
    const url = new URL(`${DATA_STORE_API_URL}`);
    url.searchParams.append("page", page);
    url.searchParams.append("size", size);

    const res = await authFetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch data stores");
    }
    return res.json();
}

/**
 * Create a new data store
 * @param {Function} authFetch - The authenticated fetch function
 * @param {Object} dataStore
 * @returns {Promise<Object>}
 */
export const createDataStores = async (authFetch, dataStore) => {
    const url = new URL(`${DATA_STORE_API_URL}`);
    const res = await authFetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataStore)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to post data store");
    }
    return res.json();
};

/**
 * Fetch a pageable list of data stores from the backend.
 * @param {Function} authFetch - The authenticated fetch function
 * @param dataStoreId
 * @param {number} page - Page number (0-based)
 * @param {number} size - Page size
 * @returns {Promise<Object>} - The pageable response: { content, totalElements, totalPages, ... }
 */
export async function listDataStoresRecords(authFetch, dataStoreId, page = 0, size = 10) {
    const url = new URL(`${DATA_STORE_API_URL}/${dataStoreId}/records`);

    url.searchParams.append("page", page);
    url.searchParams.append("size", size);

    const res = await authFetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch data store records");
    }
    return res.json();
}

/**
 * Get a single data record by ID
 * @param {Function} authFetch - The authenticated fetch function
 * @param {string} dataStoreId - ID of the data store
 * @param {string} recordId - ID of the record
 * @returns {Promise<Object>} - The record details
 */
export async function getDataRecordById(authFetch, dataStoreId, recordId) {
    const url = new URL(`${DATA_STORE_API_URL}/${dataStoreId}/records/${recordId}`);

    const res = await authFetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch data record");
    }
    return res.json();
}

