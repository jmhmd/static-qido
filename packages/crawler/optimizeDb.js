import sqlite3 from 'better-sqlite3';

/**
 *
 * @param {string} path DB file path
 */
export default function optimizeDb(path) {
  const db = sqlite3(path);

  db.prepare('pragma journal_mode = delete;').run(); //  -- to be able to actually set page size

  db.prepare('pragma page_size = 4096;').run(); //  -- trade off of number of requests that need to be made vs overhead.

  // db.prepare("insert into ftstable(ftstable) values ('optimize'); -- for every FTS table you have (if you have any)").run();

  db.prepare('vacuum;').run(); //  -- reorganize database and apply changed page size
}
