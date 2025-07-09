export const createAuthFetch = (logoutFn) => async (url, options = {}) => {
    const token = localStorage.getItem("access_token");

    const defaultHeaders = {
        Authorization: `Bearer ${token}`,
        ...(options.body && !(options.body instanceof FormData) && {
            "Content-Type": "application/json",
        }),
    };

    const res = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {}),
        },
    });

    if (res.status === 401) {
        localStorage.removeItem("access_token");
        logoutFn({ returnTo: window.location.origin });
        return;
    }

    return res;
};
