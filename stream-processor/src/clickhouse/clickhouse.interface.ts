import { ModuleMetadata } from '@nestjs/common';

export interface ICHConfig {
  host: string;
  port: number;
}

export interface ICHModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<ICHConfig> | ICHConfig;
  inject?: any[];
}
