export const createContext = () => ({
    log: (...args) => console.log('[log]', ...args),
    emit: async (type, payload) => {
        // Replace this later
        console.log('[emit]', type, JSON.stringify(payload));
    },
    env: process.env
});
