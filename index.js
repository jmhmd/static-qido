import qidoToSQL from './qido-to-sql.js';
import sendQuery from './send-query.js';

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

  const { statement, params } = await qidoToSQL(urlFragment);

  console.log(statement, params);

  const results = await sendQuery(statement, params);

  if (resultsEl) {
    resultsEl.innerHTML = JSON.stringify(results, null, 4);
  }
}

async function main() {
  // const result = await sendQuery(`select * from studies where patient_id = ?`, [208539]);
  // console.log(result);

  queryFormEl?.addEventListener('submit', handleQuerySubmit);
}

main();
