import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { rollup } from 'rollup';

import type { TypeDefinition } from '@/types';

import typedDotenv from '@/index';
import { getReplacements } from '@/utils';

interface TestParams {
  scenario: string;
  dirFixtures: string;
}

const dirnameFixtures = './__fixtures__';
const dirFixtures = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  dirnameFixtures,
);

const defineFixtureFileName = (param: TestParams) => {
  const { scenario, dirFixtures: dir } = param;
  const inputFile = path.join(dir, `${scenario}.js`);
  return inputFile;
};

const build = async (param: TestParams) => {
  const inputFile = defineFixtureFileName(param);
  const bundle = await rollup({
    input: inputFile,
    plugins: [
      typedDotenv({
        envDir: 'env',
        values: {
          ROLLUP_VALUE_STRING: 'string',
          ROLLUP_VALUE_NUMBER: 'number',
          ROLLUP_VALUE_FALSE: 'boolean',
        },
      }),
    ],
  });

  return await bundle.generate({});
};

const buildAndAssertOutput = async (param: TestParams) => {
  const output = await build(param);

  expect(output.output.length).toBe(1);
  const [{ code: generated }] = output.output;
  expect(generated).toMatchSnapshot();
};

describe('replace', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should replace with contents of env files', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(dirFixtures);

    await buildAndAssertOutput({
      scenario: 'index',
      dirFixtures: dirFixtures,
    });
  });
});

describe('env', () => {
  const envDir = path.join(dirFixtures, 'env');
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('should have priority order of env files', () => {
    it.each`
      key                       | expected
      ${'ROLLUP_VALUE_STRING1'} | ${'.env'}
      ${'ROLLUP_VALUE_STRING2'} | ${'.env.local'}
      ${'ROLLUP_VALUE_STRING3'} | ${'.env.test'}
      ${'ROLLUP_VALUE_STRING4'} | ${'.env.test.local'}
    `(
      'shoud be highest priority when it exists: $expected ',
      ({ key, expected }) => {
        const typeInfo: TypeDefinition = {};
        typeInfo[key] = 'string';

        const result = Object.values(
          getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo),
        );

        expect(result).toHaveLength(1);
        expect(JSON.parse(result[0])).toBe(expected);
      },
    );
  });

  it('should be enclosed in double quotes when type is string', () => {
    const typeInfo: TypeDefinition = {
      ROLLUP_VALUE_STRING: 'string',
    };
    const result = Object.values(
      getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(JSON.stringify('Test local value'));
  });

  it('should not be enclosed in double quotes when type is number', () => {
    const typeInfo: TypeDefinition = {
      ROLLUP_VALUE_NUMBER: 'number',
    };
    const result = Object.values(
      getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('2');
  });

  describe('should retern string of boolean value', () => {
    it.each`
      key            | expected
      ${'false'}     | ${false}
      ${'undefined'} | ${false}
      ${'empty'}     | ${false}
      ${'null'}      | ${false}
      ${'NaN'}       | ${false}
      ${'zero'}      | ${false}
      ${'true'}      | ${true}
      ${'one'}       | ${true}
      ${'string'}    | ${true}
    `('$key', ({ key, expected }) => {
      const typeInfo: TypeDefinition = {};
      typeInfo[`ROLLUP_VALUE_${key.toUpperCase()}`] = 'boolean';

      const result = Object.values(
        getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo),
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(JSON.stringify(expected));
    });
  });
});
