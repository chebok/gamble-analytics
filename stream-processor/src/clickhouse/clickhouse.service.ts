import { NodeClickHouseClient } from '@clickhouse/client/dist/client';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CLICKHOUSE_CLIENT } from './clickhouse.const';

@Injectable()
export class ClickHouseService {
  private readonly logger = new Logger(ClickHouseService.name);

  constructor(
    @Inject(CLICKHOUSE_CLIENT) private readonly chClient: NodeClickHouseClient,
  ) {}

  async onModuleInit() {
    await this.createMigrationTable();
    await this.applyMigrations();
  }

  private async createMigrationTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id UInt32,
        name String,
        executed DateTime DEFAULT now()
      ) ENGINE = MergeTree() ORDER BY id;
    `;
    await this.chClient.query({ query });
  }

  private async applyMigrations() {
    const migrations = [
      {
        id: 1,
        name: 'create_bets_table',
        up: () =>
          this.chClient.query({
            query: `
              CREATE TABLE IF NOT EXISTS bets (
                event_id UUID,
                user_id UInt32,
                game_id UInt32,
                bet_amount Float64,
                odds Float64,
                event_time DateTime64(3),
                location Enum('MobileApp' = 1, 'Web' = 2, 'DesktopApp' = 3),
                city String,
                device_type Enum('iOS' = 1, 'Android' = 2, 'Windows' = 3, 'MacOS' = 4),
                bet_type Enum('LineBet' = 1, 'TotalBet' = 2, 'MaxBet' = 3, 'FreeSpins' = 4, 'BonusBet' = 5, 'ProgressiveBet' = 6, 'FeatureBet' = 7)
              ) ENGINE = MergeTree()
              PARTITION BY toYYYYMMDD(event_time)
              ORDER BY (event_time, user_id, game_id)
              SETTINGS index_granularity = 8192;
            `,
          }),
      },
      // Добавьте другие миграции здесь
    ];
    for (const migration of migrations) {
      const resultSet = await this.chClient.query({
        query: `SELECT 1 FROM migrations WHERE id = ${migration.id}`,
        format: 'JSONEachRow',
      });
      const [existedMigration] = await resultSet.json();

      if (!existedMigration) {
        await migration.up();
        await this.chClient.insert({
          table: 'migrations',
          values: [
            {
              id: migration.id,
              name: migration.name,
            },
          ],
          format: 'JSONEachRow',
        });
        this.logger.log(`Migration ${migration.name} applied`);
      }
    }
  }
}
