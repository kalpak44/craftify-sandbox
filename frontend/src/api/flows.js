const API_HOST = import.meta.env.VITE_API_HOST || "http://localhost:8080";
const API_URL = `${API_HOST}/flows`;

const getToken = () => localStorage.getItem("access_token");
const headers = () => ({
    "Authorization": `Bearer ${getToken()}`,
    "Content-Type": "application/json"
});

export const listFlows = async (page = 0, size = 10) => {
    const res = await fetch(`${API_URL}?page=${page}&size=${size}`, {
        headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to fetch flows");
    return res.json();
};

export const getFlow = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: headers(),
    });
    if (!res.ok) throw new Error("Flow not found");
    return res.json();
};

export const createFlow = async (flow) => {
    const res = await fetch(`${API_URL}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(flow)
    });
    if (!res.ok) throw new Error("Failed to create flow");
    return res.json();
};

export const updateFlow = async (id, flow) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(flow)
    });
    if (!res.ok) throw new Error("Failed to update flow");
    return res.json();
};

export const deleteFlow = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: headers(),
    });
    if (!res.ok) throw new Error("Failed to delete flow");
};
