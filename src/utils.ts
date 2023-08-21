import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import type { DotenvParseOutput } from 'dotenv';
import type {
  EnumTypes,
  NotNullPluginOptions,
  PluginOptions,
  TypeDefinition,
} from '@/types';

export const parseOptions = (options: PluginOptions): NotNullPluginOptions => {
  const cwd = process.cwd();
  return {
    envDir: options.envDir ? path.resolve(cwd, options.envDir) : cwd,
    envPrefix: options.envPrefix ? options.envPrefix : 'ROLLUP_',
    envKey: options.envKey ? options.envKey : 'NODE_ENV',
    preventAssignment: options.preventAssignment ? true : false,
    values: options.values,
  };
};

export const getReplacements = (
  envDir: string,
  envPrefix: string,
  envKey: string,
  typeInfo: TypeDefinition,
): DotenvParseOutput => {
  const configkeys = Object.keys(typeInfo);
  const mode = process.env[envKey];
  const modeEnvFiles = mode ? [`.env.${mode}`, `.env.${mode}.local`] : [];

  const env = getEnv(['.env', '.env.local', ...modeEnvFiles], envDir);

  const expandEnv = perseDotenvExpand(env);

  return Object.fromEntries(
    Object.entries(expandEnv)
      .filter(([key]) => key.startsWith(envPrefix))
      .filter(([key]) => configkeys.includes(key))
      .map(([key, value]) => getReplaceKeyValue(key, value, typeInfo[key])),
  );
};

const getEnv = (envFiles: string[], envDir: string): DotenvParseOutput => {
  return envFiles
    .map((envFile) => path.resolve(envDir, envFile))
    .filter((envFile) => fs.existsSync(envFile))
    .map((envFile) => fs.readFileSync(envFile, { encoding: 'utf-8' }))
    .map((envContent) => dotenv.parse(envContent))
    .reduce((pre, current) => Object.assign(pre, current), {});
};

const perseDotenvExpand = (parsed: DotenvParseOutput): DotenvParseOutput => {
  const result = dotenvExpand.expand({
    ignoreProcessEnv: true,
    parsed,
  }).parsed;
  return result ? result : {};
};

const getReplaceKeyValue = (key: string, value: string, type: EnumTypes) => {
  return [`process.env.${key}`, perseTypedValue[type](value)];
};

const perseTypedValue = {
  string: function (value: string): string {
    return JSON.stringify(value);
  },
  number: function (value: string): string {
    return value;
  },
  boolean: function (value: string): string {
    const numbered = Number(value);
    const falsyValue = ['false', 'undefined', 'null', 'NaN'.toLowerCase(), '0'];

    return value.toLowerCase() === 'true' ||
      (numbered != 0 && !Number.isNaN(numbered)) ||
      (value.length > 0 && !falsyValue.includes(value.toLowerCase()))
      ? 'true'
      : 'false';
  },
};
