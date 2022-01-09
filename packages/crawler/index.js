import { performance } from 'perf_hooks';
import got from 'got';
import setupDb from './setupDb.js';
import cleanValues from './clean-values.js';
import pMap from 'p-map';

/**
 *
 * @param {import('./types').CrawlOptions} options
 */
export default async function crawl(options) {
  const { dicomWebUrl, includefield, limit, offset, startDate, endDate, match, dbFilePath } =
    options;

  const concurrency = options.concurrency || 1;

  let totalFetchingTime = 0;
  let totalDBInsertTime = 0;
  let totalDBLookupTime = 0;

  const dbSetupStart = performance.now();
  const db = setupDb(dbFilePath);
  const dbSetupEnd = performance.now();

  const queryString = new URLSearchParams();

  if (match) {
    for (let { attributeID, value } of match) {
      queryString.append(attributeID, value);
    }
  }

  if (includefield) {
    for (let attributeID of includefield) {
      queryString.append('includefield', attributeID);
    }
  } else {
    queryString.append('includefield', 'all');
  }

  if (limit) {
    queryString.append('limit', limit.toString());
  }

  if (offset) {
    queryString.append('offset', offset.toString());
  }

  if (startDate && endDate) {
    queryString.append('StudyDate', `${startDate}-${endDate}`);
  }

  // Get list of studies matching criteria
  const url = `${dicomWebUrl}/studies?${queryString.toString()}`;

  const fetchStart = performance.now();
  const studies = await got
    .get(url, {
      headers: {
        'Cache-Control': 'no-cache',
        Accept: '*/*',
      },
    })
    .json()
    .catch((/** @type {any} */ err) => {
      console.error(`Error fetching from url: ${url}`);
      console.error(err);
    });
  if (!studies || studies.length === 0) {
    throw new Error('No studies found');
  }
  const fetchEnd = performance.now();
  totalFetchingTime += fetchEnd - fetchStart;

  console.log(`Got ${studies.length} studies from url ${url}`);

  // Compile metadata for database
  const requiredDataElements = [
    // '00100010', // PatientName
    '00100020', // PatientID
    '00080020', // StudyDate
    '0020000D', // StudyInstanceUID
  ];

  pMap(
    studies,
    async (study, index) => {
      console.log(`Processing study ${index + 1} of ${studies.length}`);
      if (!requiredDataElements.every((key) => study[key]?.Value?.length > 0)) {
        console.warn(`Study result missing required result parameter. Skipping.`);
        // console.warn(JSON.stringify(study, null, 4));
        return false;
      }

      // Check if study already indexed
      const dbLookupStart = performance.now();
      const existingStudy = db
        .prepare('SELECT id FROM studies WHERE study_instance_uid = ?')
        .get(study['0020000D'].Value[0]);
      if (existingStudy) {
        console.log(`Study with uid ${study['0020000D'].Value[0]} exists in database.`);
        // TODO: Merge new/changed values here
        return false;
      }
      const dbLookupEnd = performance.now();
      totalDBLookupTime += dbLookupEnd - dbLookupStart;

      // Get series level data (Modality)
      const seriesUrl = `${dicomWebUrl}/studies/${study['0020000D'].Value[0]}/series?includefield=00080060`;
      const fetchSeriesStart = performance.now();
      const series = await got
        .get(seriesUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            Accept: '*/*',
          },
        })
        .json()
        .catch((/** @type {any} */ err) => {
          console.error(`Error fetching from url: ${url}`);
          console.error(err);
        });
      const fetchSeriesEnd = performance.now();
      totalFetchingTime += fetchSeriesEnd - fetchSeriesStart;

      if (!series || series.length === 0) {
        throw new Error(`No series found for study with id: ${study['0020000D'].Value[0]}`);
      }

      // If not already indexed, insert
      const cleanStudy = cleanValues(Object.assign(study, series[0]));
      const dbInsertStart = performance.now();
      // console.log(
      //   `Inserting study with uid ${study['0020000D'].Value[0]} , values: ${JSON.stringify(
      //   cleanStudy,
      //   null,
      //   4
      // )}`
      // );
      const info = db
        .prepare(
          `
    INSERT INTO studies (
      study_instance_uid,
      study_date,
      accession_number,
      patient_name,
      patient_id,
      patient_birth_date,
      modality,
      body_part_examined
    ) values (
      @0020000D,
      @00080020,
      @00080050,
      @00100010,
      @00100020,
      @00100030,
      @00080060,
      @00080015
    )
    `
        )
        .run(
          Object.assign(
            {
              '0020000D': null,
              '00080020': null,
              '00080050': null,
              '00100010': null,
              '00100020': null,
              '00100030': null,
              '00080060': null,
              '00080015': null,
            },
            cleanStudy
          )
        );
      const dbInsertEnd = performance.now();
      totalDBInsertTime += dbInsertEnd - dbInsertStart;
      if (info.changes === 1) {
        console.log(`Inserted study with uid ${study['0020000D'].Value[0]}.`);
      } else {
        throw new Error(`Insert error: ${JSON.stringify(info, null, 4)}`);
      }
    },
    { concurrency }
  );

  console.log('DB setup (ms):', dbSetupEnd - dbSetupStart);
  console.log('Fetch (ms):', totalFetchingTime);
  console.log('DB insert (ms):', totalDBInsertTime);
  console.log('DB lookup (ms):', totalDBLookupTime);
}
