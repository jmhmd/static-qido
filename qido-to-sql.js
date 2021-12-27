/** @type {{[key: string]: string}} */
const columnMap = {
  StudyInstanceUID: 'study_instance_uid',
  '0020000D': 'study_instance_uid',
  StudyDate: 'study_date',
  '00080020': 'study_date',
  AccessionNumber: 'accession_number',
  '00080050': 'accession_number',
  PatientName: 'patient_name',
  '00100010': 'patient_name',
  PatientID: 'patient_id',
  '00100020': 'patient_id',
  PatientBirthDate: 'patient_birth_date',
  '00100030': 'patient_birth_date',
  Modality: 'modality',
  '00080060': 'modality',
  BodyPartExamined: 'body_part_examined',
  '00180015': 'body_part_examined',
};

/** @typedef {{column: string; comparator: string; value: string;}[]} SQLWhereColumns */

/**
 *
 * @param {SQLWhereColumns} sqlWhereColumns
 * @param {string} key
 * @param {string} value
 * @param {boolean} fuzzyMatching
 * @returns {SQLWhereColumns}
 */
function parseMatchFields(sqlWhereColumns, key, value, fuzzyMatching) {
  const column = columnMap[key];
  if (!column) {
    throw new Error(`Matching on field ${key} not supported.`);
  }

  if (column === 'study_instance_uid') {
    sqlWhereColumns.push({
      column,
      comparator: '=',
      value,
    });
  } else if (column === 'study_date') {
    if (value.includes('-')) {
      const dateRange = value.split('-');
      sqlWhereColumns.push({
        column,
        comparator: '>=',
        value: dateRange[0],
      });
      sqlWhereColumns.push({
        column,
        comparator: '<=',
        value: dateRange[1],
      });
    } else {
      sqlWhereColumns.push({
        column,
        comparator: '=',
        value,
      });
    }
  } else if (column === 'accession_number') {
    sqlWhereColumns.push({
      column,
      comparator: '=',
      value,
    });
  } else if (column === 'patient_name') {
    if (fuzzyMatching) {
      sqlWhereColumns.push({
        column,
        comparator: 'LIKE',
        value: `%${value}%`,
      });
    } else {
      sqlWhereColumns.push({
        column,
        comparator: '=',
        value,
      });
    }
  } else if (column === 'patient_id') {
    sqlWhereColumns.push({
      column,
      comparator: '=',
      value,
    });
  } else if (column === 'patient_birth_date') {
    if (value.includes('-')) {
      const dateRange = value.split('-');
      sqlWhereColumns.push({
        column,
        comparator: '>=',
        value: dateRange[0],
      });
      sqlWhereColumns.push({
        column,
        comparator: '<=',
        value: dateRange[1],
      });
    } else {
      sqlWhereColumns.push({
        column,
        comparator: '=',
        value,
      });
    }
  } else if (column === 'modality') {
    sqlWhereColumns.push({
      column,
      comparator: '=',
      value,
    });
  } else if (column === 'body_part_examined') {
    sqlWhereColumns.push({
      column,
      comparator: '=',
      value,
    });
  }

  return sqlWhereColumns;
}

/**
 *
 * @param {string[]} sqlSelectColumns
 * @param {string} value
 * @returns {string[]}
 */
function parseIncludeFields(sqlSelectColumns, value) {
  if (value === 'all') {
    return [];
  } else if (value.includes(',')) {
    const values = value.split(',');
    return values.reduce((prev, current) => {
      return parseIncludeFields(sqlSelectColumns, current);
    }, sqlSelectColumns);
  }

  const columnName = columnMap[value];
  if (columnName && !sqlSelectColumns.includes(columnName)) {
    sqlSelectColumns.push(columnName);
  }

  return sqlSelectColumns;
}

/**
 * Parse a URL fragment to return an SQL query
 * @param {URL} url window.URL object
 * @returns {{statement: string; params: (string | number)[];}}
 */
export default function qidoToSQL(url) {
  const sqlTable = 'studies';
  /** @type {string[]} */
  let sqlSelectColumns = [];
  /** @type {SQLWhereColumns} */
  let sqlWhereColumns = [];
  /** @type {number} */
  let limit = 100;
  /** @type {number} */
  let offset = 0;
  /** @type {(string | number)[]} */
  let sqlParams = [];

  const { searchParams } = url;
  // Define fuzzymatching before looping through params as this value affects how others parsed.
  const fuzzyMatching = searchParams.get('fuzzymatching') === 'true';

  searchParams.forEach((value, key) => {
    if (key === 'includefield') {
      sqlSelectColumns = parseIncludeFields(sqlSelectColumns, value);
    } else if (key === 'fuzzymatching') {
      return true;
    } else if (key === 'limit') {
      limit = parseInt(value, 10);
    } else if (key === 'offset') {
      offset = parseInt(value, 10);
    } else {
      parseMatchFields(sqlWhereColumns, key, value, fuzzyMatching);
    }
  });

  if (sqlSelectColumns.length === 0) {
    sqlSelectColumns = ['*'];
  }

  // Build SQL statement
  let statement = `SELECT ${sqlSelectColumns.join(', ')} FROM ${sqlTable}`;
  if (sqlWhereColumns.length > 0) {
    statement += ` WHERE `;
    sqlWhereColumns.forEach(({ column, comparator, value }, index) => {
      statement += `${column} ${comparator} ?`;
      sqlParams.push(value);
      if (index < sqlWhereColumns.length - 1) {
        statement += ' AND ';
      }
    });
  }
  statement += ` LIMIT ? OFFSET ?`;
  sqlParams.push(limit);
  sqlParams.push(offset);

  return { statement, params: sqlParams };
}
