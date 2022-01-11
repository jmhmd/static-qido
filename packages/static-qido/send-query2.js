import { createDbWorker } from 'sql.js-httpvfs';
// @ts-ignore
import dbUrl from '../crawler/dcmjs-server/db.sqlite?url';
// @ts-ignore
import workerUrl from 'sql.js-httpvfs/dist/sqlite.worker.js?url';
// @ts-ignore
import wasmUrl from 'sql.js-httpvfs/dist/sql-wasm.wasm?url';

/**
 * @type {import('sql.js-httpvfs').WorkerHttpvfs | undefined}
 */
let httpvfsWorker;

/** @type {import("sql.js-httpvfs/dist/sqlite.worker").SplitFileConfig} */
const config = {
  from: 'inline',
  config: {
    serverMode: 'full', // file is just a plain old full sqlite database
    requestChunkSize: 4096, // the page size of the sqlite database (by default 4096)
    url: dbUrl, // url to the database (relative or full)
    // databaseLengthBytes: 32768,
  },
};

async function getWorker() {
  if (httpvfsWorker) {
    return httpvfsWorker;
  }
  // you can also pass multiple config objects which can then be used as separate database schemas
  // with `ATTACH virtualFilename as schemaname`, where virtualFilename is also set in the config
  // object. worker.db is a now SQL.js instance except that all functions return Promises.
  httpvfsWorker = await createDbWorker([config], workerUrl.toString(), wasmUrl.toString());
  return httpvfsWorker;
}

/**
 *
 * @typedef {{[key: string]: null | number | string}} QueryReturnRow
 */

/**
 *
 * @param {string} query SQL query string
 * @param {(string | number)[]} params Query parameters
 * @returns {Promise<QueryReturnRow[]>}
 */
export default async function sendQuery(query, params) {
  const worker = await getWorker();
  /** @type {any} */
  const result = await worker.db.query(query, params);
  return /** @type {QueryReturnRow[]} */ result;
}
