import qidoToSQL from './qido-to-sql.js';
import sendQuery from './send-query2.js';

const regexes = {
  studyLevelReq: /(?:\/studies|^studies)(?:\?|$)/,
  seriesLevelReq: /(?:\/studies|^studies)\/.+\/series(?:\?|$)/,
};

/** @type {HTMLInputElement | null} */
const qidoInputEl = document.querySelector('#qido-input');

/** @type {HTMLFormElement | null} */
const queryFormEl = document.querySelector('#query-form');

/** @type {HTMLElement | null} */
const resultsEl = document.querySelector('#results');

async function handleQuerySubmit(/** @type Event */ event) {
  event.preventDefault(); // Don't reload page on submit
  const urlFragment = qidoInputEl?.value;

  if (!urlFragment) {
    throw new Error('Must include QIDO url parameters');
  }

  const url = new URL(urlFragment, window.location.origin);

  const isStudyLevelReq = regexes.studyLevelReq.test(url.pathname);
  const isSeriesLevelReq = regexes.seriesLevelReq.test(url.pathname);

  // if (!isStudyLevelReq && !isSeriesLevelReq) {
  //   throw new Error('Only study and series level qido requests are supported');
  // }

  /** @type {any} */
  let results;
  /** @type {string} */
  let source;

  const startReq = performance.now();
  console.time('request')
  if (isStudyLevelReq) {
    const { statement, params } = await qidoToSQL(url);
    console.log(statement, params);
    results = await sendQuery(statement, params);
    source = 'Static DB';
  } else {
    // Pass off to WADO static - query string options will have no effect
    results = await fetch(url.href, { method: 'GET', headers: { Accept: '*/*' } }).then(
      (response) => response.json()
    );
    source = 'WADO-RS metadata';
  }
  const endReq = performance.now();
  console.timeEnd('request')

  console.time('render')
  if (resultsEl) {
    resultsEl.innerHTML = `
    ${results.length} results found.
    Request time: ${(endReq - startReq).toFixed()} ms
    Source: ${source}
    ${JSON.stringify(results, null, 4)}
    `;
  }
  console.timeEnd('render')
}

async function main() {
  // const result = await sendQuery(`select * from studies where patient_id = ?`, [208539]);
  // console.log(result);

  queryFormEl?.addEventListener('submit', handleQuerySubmit);
}

main();
