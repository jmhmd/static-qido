/**
 *
 * @param {{[key: string]: {vr: string; Value: (string | { Alphabetic: string })[]}}} values
 */
export default function cleanValues(values, ) {
  /** @type {{[key: string]: string | undefined}} */
  const cleanValues = {};

  for (let key of Object.keys(values)) {
    const value = values[key];

    /** @type {string} */
    let cleanValue;
    if (!value.Value) {
      cleanValues[key] = undefined;
      continue;
    }
    if (value.vr === 'PN') {
      if (typeof value.Value[0] !== 'string') {
        cleanValue = value.Value[0].Alphabetic;
      } else {
        throw new Error(
          `Unexpected value for key ${key} with vr of "PN": ${JSON.stringify(value.Value, null, 4)}`
        );
      }
    } else if (typeof value.Value[0] === 'string' || typeof value.Value[0] === 'number') {
      cleanValue = value.Value[0].toString();
    } else {
      // Don't deal with sequences, etc.
      cleanValue = '';
      // throw new Error(
      //   `Unexpected value. Key: ${key}, VR: ${value.vr}, value: ${JSON.stringify(
      //     value.Value,
      //     null,
      //     4
      //   )}`
      // );
    }

    cleanValues[key] = cleanValue;
  }

  return cleanValues;
}
