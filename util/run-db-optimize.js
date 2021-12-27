import optimizeDb from '../crawler/optimizeDb.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

optimizeDb(resolve(__dirname, '../crawler/db.sqlite'));

console.log('done');
