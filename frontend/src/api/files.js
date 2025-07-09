const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const API_URL = `${API_HOST}/files`;

const getToken = () => localStorage.getItem("access_token");
const headers = () => ({Authorization: `Bearer ${getToken()}`});

export const listFiles = async (folder = "") => {
    const res = await window.authFetch(
        `${API_URL}/list?folder=${encodeURIComponent(folder)}`,
        {headers: headers()}
    );
    if (!res.ok) throw new Error("Failed to fetch file list");
    return res.json();
};

export const uploadFile = async (folder, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await window.authFetch(
        `${API_URL}/upload?folder=${encodeURIComponent(folder)}`,
        {
            method: "POST",
            headers: headers(),
            body: formData,
        }
    );
    if (!res.ok) throw new Error("Failed to upload file");
    return res.text();
};

export const createFolder = async (folderPath) => {
    const res = await window.authFetch(
        `${API_URL}/mkdir?folder=${encodeURIComponent(folderPath)}`,
        {
            method: "POST",
            headers: headers(),
        }
    );
    if (!res.ok) throw new Error("Failed to create folder");
    return res.text();
};

export const renameItem = async (from, to) => {
    const res = await window.authFetch(
        `${API_URL}/move?fromPath=${encodeURIComponent(from)}&toPath=${encodeURIComponent(to)}`,
        {
            method: "POST",
            headers: headers(),
        }
    );
    if (!res.ok) throw new Error("Failed to rename item");
    return res.text();
};

export const deleteItem = async (path) => {
    const res = await window.authFetch(
        `${API_URL}/delete?path=${encodeURIComponent(path)}`,
        {
            method: "DELETE",
            headers: headers(),
        }
    );
    if (!res.ok) throw new Error("Failed to delete item");
    return res.text();
};

export const downloadItem = async (path) => {
    const res = await window.authFetch(
        `${API_URL}/download?fullPath=${encodeURIComponent(path)}`,
        {headers: headers()}
    );
    if (!res.ok) throw new Error("Failed to download item");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = path.split("/").pop();
    link.click();
};
