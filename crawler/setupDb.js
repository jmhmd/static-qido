import sqlite3 from 'better-sqlite3';
import optimizeDb from './optimizeDb.js';

/**
 *
 * @param {string} path DB file path
 */
export default function setupDb(path) {
  const db = sqlite3(path);

  db.prepare(
    `
    CREATE TABLE IF NOT EXISTS studies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      study_instance_uid TEXT,
      study_date INTEGER,
      accession_number TEXT,
      patient_name TEXT,
      patient_id TEXT,
      patient_birth_date INTEGER,
      modality TEXT,
      body_part_examined TEXT
    );
    `
  ).run();

  // Create indexes
  db.prepare('CREATE INDEX IF NOT EXISTS study_date ON studies (study_date)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS accession_number ON studies (accession_number)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS patient_name ON studies (patient_name)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS patient_id ON studies (patient_id)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS modality ON studies (modality)').run();

  optimizeDb(path)

  return db;
}
