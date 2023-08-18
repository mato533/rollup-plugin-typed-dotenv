import type { Plugin } from 'rollup';

export interface PluginOptions {
  envDir?: string;
  envPrefix?: string;
  envKey?: string;
  preventAssignment?: boolean;
  values: TypeDefinition;
}

export type NotNullPluginOptions = Required<PluginOptions>;

export interface TypeDefinition {
  [name: string]: EnumTypes;
}
export type EnumTypes = 'boolean' | 'number' | 'string';

export default function typedDotenv(options?: PluginOptions): Plugin;
