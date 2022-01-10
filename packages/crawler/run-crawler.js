import { default as crawl } from './crawl.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputPath = join(__dirname, 'dcmjs-server');

async function main() {
  const limit = 5;
  /** @type {import('../crawler/types').CrawlOptions} */
  const options = {
    // dicomWebUrl:
    // 'https://proxy.imaging.datacommons.cancer.gov/v1/projects/canceridc-data/locations/us/datasets/idc/dicomStores/v5/dicomWeb',
    dicomWebUrl: 'https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs',
    downloadInstances: false,
    overwrite: false,
    limit,
    concurrency: 1,
    dbFilePath: join(outputPath, 'db.sqlite'),
    outputPath,
    includefield: [
      '00080020', // StudyDate
      '00080030', // StudyTime
      '00080050', // AccessionNumber
      '00080061', // ModalitiesInStudy
      '00080060', // Modality
      '00080090', // ReferringPhysicianName
      '00100010', // PatientName
      '00100020', // PatientID
      '00100030', // PatientBirthDate
      '0020000D', // StudyInstanceUID
      '00200010', // StudyID
      '00180015', // BodyPartExamined
    ],
  };

  for (let i = 0; i < 100; i += limit) {
    options.offset = i;
    console.log(`Crawling ${i} to ${i + limit} studies...`);
    try {
      await crawl(options);
    } catch (err) {
      console.error(err);
    }
  }

  console.log('done');
}

main();
