import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { CLICKHOUSE_CLIENT } from './clickhouse.const';
import { ICHModuleAsyncOptions } from './clickhouse.interface';
import { ClickHouseService } from './clickhouse.service';

@Global()
@Module({})
export class CLickHouseModule {
  static forRootAsync(options: ICHModuleAsyncOptions): DynamicModule {
    const CLickHouseCLient = this.createAsyncClickHouseProvider(options);
    return {
      module: CLickHouseModule,
      imports: options.imports,
      providers: [CLickHouseCLient, ClickHouseService],
      exports: [CLickHouseCLient],
    };
  }

  private static createAsyncClickHouseProvider(
    options: ICHModuleAsyncOptions,
  ): Provider {
    return {
      provide: CLICKHOUSE_CLIENT,
      useFactory: async (...args: any[]) => {
        const { host, port } = await options.useFactory(...args);
        const client = createClient({
          url: `http://${host}:${port}`,
          username: 'default', // Опционально, если сервер не требует аутентификации
          password: '', // Опционально, если сервер не требует аутентификации
          database: 'default', // Опционально, если необходимо указать базу данных при подключении
        });
        await client.ping();
        return client;
      },
      inject: options.inject || [],
    };
  }
}
