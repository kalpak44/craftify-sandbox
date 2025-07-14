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
