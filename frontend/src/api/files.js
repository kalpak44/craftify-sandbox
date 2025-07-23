const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const API_URL = `${API_HOST}/files`;

export const listFiles = async (authFetch, folder = "") => {
    const res = await authFetch(
        `${API_URL}/list?folder=${encodeURIComponent(folder)}`
    );
    if (!res.ok) throw new Error("Failed to fetch file list");
    return res.json();
};

export const uploadFile = async (authFetch, folder, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await authFetch(
        `${API_URL}/upload?folder=${encodeURIComponent(folder)}`,
        {
            method: "POST",
            body: formData,
        }
    );
    if (!res.ok) throw new Error("Failed to upload file");
    return res.text();
};

export const createFolder = async (authFetch, folderPath) => {
    const res = await authFetch(
        `${API_URL}/mkdir?folder=${encodeURIComponent(folderPath)}`,
        {
            method: "POST",
        }
    );
    if (!res.ok) throw new Error("Failed to create folder");
    return res.text();
};

export const renameItem = async (authFetch, from, to) => {
    const res = await authFetch(
        `${API_URL}/move?fromPath=${encodeURIComponent(from)}&toPath=${encodeURIComponent(to)}`,
        {
            method: "POST",
        }
    );
    if (!res.ok) throw new Error("Failed to rename item");
    return res.text();
};

export const deleteItem = async (authFetch, path) => {
    const res = await authFetch(
        `${API_URL}/delete?path=${encodeURIComponent(path)}`,
        {
            method: "DELETE",
        }
    );
    if (!res.ok) throw new Error("Failed to delete item");
    return res.text();
};

export const downloadItem = async (authFetch, path) => {
    const res = await authFetch(
        `${API_URL}/download?fullPath=${encodeURIComponent(path)}`
    );
    if (!res.ok) throw new Error("Failed to download item");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = path.split("/").pop();
    link.click();
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

/**
 * Creates a new text file at a given path with the specified content.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {string} path - The full path where the file should be created (e.g., "notes/readme.txt")
 * @param {string} content - The content to write into the file
 * @returns {Promise<string>}
 */
export const createTextFile = async (authFetch, path, content) => {
    const payload = {path, content};

    const res = await authFetch(`${API_URL}/create-text-file`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Failed to create text file");
    }

    return res.text();
};


/**
 * Updates the content of an existing text file at the given path.
 * @param {Function} authFetch - The authenticated fetch function
 * @param {string} path - The full path to the file (e.g., "notes/readme.txt")
 * @param {string} content - The new content to write to the file
 * @returns {Promise<string>}
 */
export const updateTextFile = async (authFetch, path, content) => {
    const payload = {path, content};

    const res = await authFetch(`${API_URL}/update-text-file`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Failed to update text file");
    }

    return res.text();
};

