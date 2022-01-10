import got from 'got';
import { writeFile } from 'fs/promises';
import multipart from 'parse-multipart-data';

async function main() {
  const singleurl =
    'https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.14519.5.2.1.7009.2403.871108593056125491804754960339/series/1.3.6.1.4.1.14519.5.2.1.7009.2403.168353129945747450419572751964';
  const multiurl =
    'https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.14519.5.2.1.7009.2403.871108593056125491804754960339/series/1.3.6.1.4.1.14519.5.2.1.7009.2403.780462962868572737240023906400';

  // const boundaryRegex = /(?:^--.+$(?:^Content-ID:.+$)|(?:^Content-Type:.+$)/
  got.get(multiurl).then(async (response) => {
    if (!response.headers['content-type']) throw new Error('No content type');

    const boundary = multipart.getBoundary(response.headers['content-type']);
    const parts = multipart.parse(response.rawBody, boundary);

    let i = 0;
    for (const part of parts) {
      await writeFile(`./${i}-out.dcm`, part.data);
      i++;
    }
  });
}

main();
