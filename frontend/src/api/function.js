const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const FUNCTION_API_URL = `${API_HOST}/function`;

/**
 * Triggers a serverless function with the given event data.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {string} path - The full path to the function (e.g., "/functions/myFunc")
 * @param {Object} event - The input event data (must be JSON serializable)
 * @returns {Promise<string>} - A unique request ID to track function execution
 */
export const runFunction = async (authFetch, path, event) => {
    const payload = {
        path,
        event
    };

    const res = await authFetch(`${FUNCTION_API_URL}/run`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error("Failed to run function");
    }

    return res.text();
};
