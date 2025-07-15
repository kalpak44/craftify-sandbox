const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const API_URL = `${API_HOST}/functions`;

/**
 * Creates a new function in the given folder with the specified name and environment.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {string} folder - The folder path where the function should be created
 * @param {string} name - The name of the function
 * @param {string} environment - The runtime environment (e.g., 'node.js')
 * @returns {Promise<Object>}
 */
export const createFunction = async (authFetch, folder, name, environment) => {
    const payload = { folder, name, environment };

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

    return res.json();
};

/**
 * Loads the file tree for a given function path (excluding .meta.json).
 * @param {Function} authFetch - The authenticated fetch function
 * @param {string} path - Path to the function root
 * @returns {Promise<Array>} - List of FileItemDto
 */
export const loadFunctionTree = async (authFetch, path) => {
    const res = await authFetch(`${API_URL}/tree?path=${encodeURIComponent(path)}`);

    if (!res.ok) {
        throw new Error("Failed to load function tree");
    }

    return res.json();
};

/**
 * Fetches the content of a specific file under a function path.
 * @param {Function} authFetch
 * @param {string} filePath - Full relative path (e.g., myFunction/sandbox/example.js)
 * @returns {Promise<string>}
 */
export const getFileContent = async (authFetch, filePath) => {
    const res = await authFetch(`${API_URL}/file?path=${encodeURIComponent(filePath)}`);

    if (!res.ok) {
        throw new Error("Failed to fetch file content");
    }

    return res.text();
};