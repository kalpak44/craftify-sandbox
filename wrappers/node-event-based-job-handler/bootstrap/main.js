import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { createContext } from './context.js';
import { validateHandler } from './validator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const handlerPath = path.join(__dirname, '..', 'user', 'handler.js');

const readEventFromStdin = async () => {
    try {
        const stdin = await fs.readFile('/dev/stdin', 'utf-8');
        return JSON.parse(stdin);
    } catch (err) {
        console.error('[error] Failed to read or parse incoming event:', err.message);
        process.exit(1);
    }
};

const main = async () => {
    const event = await readEventFromStdin();
    const handler = await validateHandler(handlerPath);
    const context = createContext();

    try {
        await handler(event, context);
        process.exit(0);
    } catch (err) {
        console.error('[handler error]', err.stack || err.message);
        process.exit(1);
    }
};

main();
