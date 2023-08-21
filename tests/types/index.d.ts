import type { EnumTypes, PluginOptions } from '@/types';

export interface TestParams {
  scenario: string;
  dirFixtures: string;
  options: PluginOptions;
}

export interface TestTypeDefinition {
  key: string;
  type: EnumTypes;
}
