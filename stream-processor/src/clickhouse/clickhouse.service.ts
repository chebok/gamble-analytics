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
    const queryLocal = `
      CREATE TABLE IF NOT EXISTS migrations_local on cluster cluster_2S_2R (
        id UInt32,
        name String,
        executed DateTime DEFAULT now()
      )
      ENGINE = ReplicatedMergeTree('/clickhouse/tables/migrations/{shard}', '{replica}')
      ORDER BY id;
    `;

    const queryDistributed = `
      CREATE TABLE IF NOT EXISTS migrations on cluster cluster_2S_2R AS migrations_local
      ENGINE = Distributed(cluster_2S_2R, default, migrations_local, rand());
    `;
    await this.chClient
      .query({ query: queryLocal })
      .then((resultSet) => resultSet.text());
    await this.chClient
      .query({ query: queryDistributed })
      .then((resultSet) => resultSet.text());
  }

  private async applyMigrations() {
    const migrations = [
      {
        id: 1,
        name: 'create_bets_local_table',
        up: () =>
          this.chClient.query({
            query: `
              CREATE TABLE IF NOT EXISTS bets_local on cluster cluster_2S_2R
              (
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
              )
              ENGINE = ReplicatedMergeTree('/clickhouse/tables/bets/{shard}', '{replica}')
              PARTITION BY toYYYYMMDD(event_time)
              ORDER BY (event_time, user_id, game_id)
              SETTINGS index_granularity = 8192;
            `,
          }),
      },
      {
        id: 2,
        name: 'create_bets_distributed_table',
        up: () =>
          this.chClient.query({
            query: `
              CREATE TABLE IF NOT EXISTS bets on cluster cluster_2S_2R AS bets_local
              ENGINE = Distributed(cluster_2S_2R, default, bets_local, rand())
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
      const [existedMigration] = await resultSet.text();

      if (!existedMigration) {
        await migration.up().then((resultSet) => resultSet.text());
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
