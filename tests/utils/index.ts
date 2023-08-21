import path from 'path';
import { fileURLToPath } from 'url';

import { rollup } from 'rollup';
import { expect } from 'vitest';

import typedDotenv from '../../src/index';

import type { TestParams, TestTypeDefinition } from '../types';

const dirnameFixtures = '../__fixtures__';

const defineFixtureFileName = (param: TestParams) => {
  const { scenario, dirFixtures: dir } = param;
  const inputFile = path.join(dir, `${scenario}.js`);
  return inputFile;
};

const build = async (param: TestParams) => {
  const inputFile = defineFixtureFileName(param);
  const bundle = await rollup({
    input: inputFile,
    treeshake: false,
    plugins: [typedDotenv(param.options)],
  });

  return await bundle.generate({});
};

export const dirFixtures = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  dirnameFixtures,
);

export const buildAndAssertOutput = async (param: TestParams) => {
  const output = await build(param);

  expect(output.output.length).toBe(1);
  const [{ code: generated }] = output.output;
  expect(generated).toMatchSnapshot();
};

export const getEnvName = (key: string) => {
  return `process.env.${key}`;
};

export const getTypeInfo = (
  typeInfo: TestTypeDefinition | TestTypeDefinition[],
) => {
  if (Array.isArray(typeInfo)) {
    return typeInfo.reduce(
      (pre, current) => Object.assign(pre, { [current.key]: current.type }),
      {},
    );
  } else {
    return { [typeInfo.key]: typeInfo.type };
  }
};
