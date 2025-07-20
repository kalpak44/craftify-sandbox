import fs from 'fs/promises';
export const validateHandler = async (handlerPath) => {
    try {
        await fs.access(handlerPath);
        const mod = await import(handlerPath);
        const handler = mod?.default;

        if (typeof handler !== 'function') {
            console.error('[error] Handler must export a default async function.');
            process.exit(1);
        }
        if (handler.constructor.name !== 'AsyncFunction') {
            console.error('[error] Exported handler must be async: `export default async (event, context) => {}`');
            process.exit(1);
        }
        return handler;
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`[error] Handler not found at ${handlerPath}`);
        } else {
            console.error('[error] Failed to load handler:', err.stack || err.message);
        }
        process.exit(1);
    }
};
