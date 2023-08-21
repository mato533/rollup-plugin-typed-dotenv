/* eslint-disable no-undef */
console.log(process.env.ROLLUP_VALUE_STRING);
console.log(process.env.ROLLUP_VALUE_NUMBER);
console.log(process.env.ROLLUP_VALUE_FALSE);

process.env.ROLLUP_DEBUG = false;
if (process.env.ROLLUP_DEBUG === true) {
  console.log(process.env.ROLLUP_DEBUG);
}
