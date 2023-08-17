import replace from '@rollup/plugin-replace';
import { Plugin } from 'rollup';

import { name, version } from '../package.json';

import type { PluginOptions } from '@/types';

import { parseOptions, getReplacements } from '@/utils';

const typedDotenv = (options: PluginOptions): Plugin => {
  const {
    envDir,
    envPrefix,
    envKey,
    values: typeInfo,
    preventAssignment,
  } = parseOptions(options);

  const values = getReplacements(envDir, envPrefix, envKey, typeInfo);

  return {
    ...replace({
      values,
      preventAssignment,
    }),
    name,
    version,
  };
};

export default typedDotenv;
