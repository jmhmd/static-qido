import { default as crawl } from '../crawler/index.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const limit = 50;
  /** @type {import('../crawler/types').CrawlOptions} */
  const options = {
    dicomWebUrl:
      'https://proxy.imaging.datacommons.cancer.gov/v1/projects/canceridc-data/locations/us/datasets/idc/dicomStores/v5/dicomWeb',
    limit,
    concurrency: 10,
    dbFilePath: resolve(__dirname, '../crawler/db.sqlite'),
    includefield: [
      '0020000D',
      '00080020',
      '00080050',
      '00100010',
      '00100020',
      '00100030',
      '00080060',
      '00080015',
    ],
  };

  for (let i = 53200; i < 100000; i += limit) {
    options.offset = i;
    console.log(`Crawling ${i} to ${i + limit} studies...`);
    await crawl(options);
  }

  console.log('done');
}

main();
