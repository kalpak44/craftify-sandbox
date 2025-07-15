const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const API_URL = `${API_HOST}/functions`;

/**
 * Creates a new function in the given folder with the specified name and environment.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {string} folder - The folder path where the function should be created
 * @param {string} name - The name of the function
 * @param {string} environment - The runtime environment (e.g., 'node.js')
 * @returns {Promise<Object>} - Result of the backend response
 */
export const createFunction = async (authFetch, folder, name, environment) => {
    const payload = {
        folder,
        name,
        environment,
    };

    const res = await authFetch(`${API_URL}/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Failed to create function");
    }

    return res.text();
};
