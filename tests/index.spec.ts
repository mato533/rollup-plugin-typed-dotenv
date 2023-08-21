import path from 'path';

import {
  dirFixtures,
  buildAndAssertOutput,
  getTypeInfo,
  getEnvName,
} from './utils';

import type { NotNullPluginOptions } from '@/types';

import { getReplacements, parseOptions } from '@/utils';

describe('replace', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should replace with contents of env files', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(dirFixtures);

    await buildAndAssertOutput({
      scenario: 'index',
      dirFixtures: dirFixtures,
      options: {
        envDir: 'env',
        values: {
          ROLLUP_VALUE_STRING: 'string',
          ROLLUP_VALUE_NUMBER: 'number',
          ROLLUP_VALUE_FALSE: 'boolean',
        },
      },
    });
  });
  it('should throw error from rollup-plugin-replace', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(dirFixtures);
    expect(async () => {
      await buildAndAssertOutput({
        scenario: 'index',
        dirFixtures: dirFixtures,
        options: {
          envDir: 'env',
          values: {
            ROLLUP_DEBUG: 'boolean',
          },
        },
      });
    }).rejects.toThrowError();
  });
});

describe('option', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('envDir', () => {
    vi.spyOn(process, 'cwd').mockReturnValue(path.join(dirFixtures, 'env'));
    const key = 'ROLLUP_VALUE_STRING4';

    const values = getTypeInfo({ key, type: 'string' });

    const options: NotNullPluginOptions = parseOptions({ values });

    const result = getReplacements(
      options.envDir,
      options.envPrefix,
      options.envKey,
      options.values,
    );

    expect(Object.values(result)).toHaveLength(1);
    expect(JSON.parse(result[getEnvName(key)])).toBe('.env.test.local');
  });

  it('envPrefix', () => {
    vi.spyOn(process, 'cwd').mockReturnValue(path.join(dirFixtures, 'env'));
    const key = 'TEST_VALUE_STRING1';
    const values = getTypeInfo({ key, type: 'string' });

    const options: NotNullPluginOptions = parseOptions({
      envPrefix: 'TEST_VALUE_',
      values,
    });

    const result = getReplacements(
      options.envDir,
      options.envPrefix,
      options.envKey,
      options.values,
    );

    expect(Object.values(result)).toHaveLength(1);
    expect(JSON.parse(result[getEnvName(key)])).toBe('TEST_PREFIX');
  });
  it('envKey', () => {
    vi.spyOn(process, 'cwd').mockReturnValue(path.join(dirFixtures, 'env'));
    process.env['TEST_NODE_MODE'] = 'staging';

    const key1 = 'ROLLUP_VALUE_STAGING1';
    const key2 = 'ROLLUP_VALUE_STAGING2';

    const values = getTypeInfo([
      { key: key1, type: 'number' },
      { key: key2, type: 'number' },
    ]);

    const options: NotNullPluginOptions = parseOptions({
      envKey: 'TEST_NODE_MODE',
      values,
    });

    const result = getReplacements(
      options.envDir,
      options.envPrefix,
      options.envKey,
      options.values,
    );

    expect(Object.values(result)).toHaveLength(2);
    expect(result[getEnvName(key1)]).toBe('100');
    expect(result[getEnvName(key2)]).toBe('99');
    delete process.env.TEST_NODE_MODE;
  });
  it('envKey - not set to enviroment valiables', () => {
    vi.spyOn(process, 'cwd').mockReturnValue(path.join(dirFixtures, 'env'));

    const key = 'ROLLUP_VALUE_STAGING1';

    const typeInfo = getTypeInfo([{ key, type: 'number' }]);
    const { envDir, envPrefix, envKey, values }: NotNullPluginOptions =
      parseOptions({
        envKey: 'TEST_NODE_MODE',
        values: typeInfo,
      });

    const result = getReplacements(envDir, envPrefix, envKey, values);

    expect(Object.values(result)).toHaveLength(0);
  });
  it('preventAssignment', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(dirFixtures);

    await buildAndAssertOutput({
      scenario: 'index',
      dirFixtures: dirFixtures,
      options: {
        envDir: 'env',
        values: {
          ROLLUP_DEBUG: 'boolean',
        },
        preventAssignment: true,
      },
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
        const typeInfo = getTypeInfo({ key, type: 'string' });

        const result = getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo);
        expect(Object.values(result)).toHaveLength(1);
        expect(JSON.parse(result[getEnvName(key)])).toBe(expected);
      },
    );
  });
  describe('format', () => {
    describe('string', () => {
      it('should be enclosed in double quotes when type is string', () => {
        const key = 'ROLLUP_VALUE_STRING';
        const typeInfo = getTypeInfo({ key, type: 'string' });
        const result = getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo);

        expect(Object.values(result)).toHaveLength(1);
        expect(JSON.parse(result[getEnvName(key)])).toBe('Test local value');
      });
    });

    describe('number', () => {
      it('should not be enclosed in double quotes when type is number', () => {
        const key = 'ROLLUP_VALUE_NUMBER';
        const typeInfo = getTypeInfo({ key, type: 'number' });

        const result = getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo);

        expect(Object.values(result)).toHaveLength(1);
        expect(result[getEnvName(key)]).toBe('2');
      });
    });
    describe('boolean', () => {
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
      `('should retern string of boolean value: $key', ({ key, expected }) => {
        const formatedKey = `ROLLUP_VALUE_${key.toUpperCase()}`;
        const typeInfo = getTypeInfo({ key: formatedKey, type: 'boolean' });

        const result = getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo);

        expect(Object.values(result)).toHaveLength(1);
        expect(result[getEnvName(formatedKey)]).toBe(JSON.stringify(expected));
      });
    });
  });

  describe('env-expand', () => {
    it.each`
      key                       | expected
      ${'ROLLUP_VALUE_EXPAND2'} | ${'expand value with same env file'}
      ${'ROLLUP_VALUE_EXPAND3'} | ${'expand value with different env file'}
    `('shoud be expanded : $expected ', ({ key, expected }) => {
      const typeInfo = getTypeInfo({ key, type: 'string' });

      const result = getReplacements(envDir, 'ROLLUP_', 'NODE_ENV', typeInfo);

      expect(Object.values(result)).toHaveLength(1);
      expect(JSON.parse(result[getEnvName(key)])).toBe(expected);
    });
  });
});
