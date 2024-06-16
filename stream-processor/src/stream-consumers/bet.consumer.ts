import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from '../kafka/consumer.service';
import { EachBatchPayload } from 'kafkajs';
import { NodeClickHouseClient } from '@clickhouse/client/dist/client';
import { CLICKHOUSE_CLIENT } from '../clickhouse/clickhouse.const';

@Injectable()
export class BetConsumer implements OnModuleInit {
  constructor(
    @Inject(CLICKHOUSE_CLIENT) private readonly chClient: NodeClickHouseClient,
    private readonly consumerService: ConsumerService,
  ) {}
  async onModuleInit() {
    await this.consumerService.consume(
      {
        groupId: 'betting',
        minBytes: 1, // Минимальное количество байт для чтения
        maxBytes: 1048576, // Максимальное количество байт для чтения (1MB)
        maxWaitTimeInMs: 100, // Максимальное время ожидания для формирования батча (100ms)
      },
      {
        topics: ['bets'],
        fromBeginning: true,
      },
      {
        eachBatch: this.handleBatch.bind(this),
      },
    );
  }

  private async handleBatch({
    batch,
    resolveOffset,
    heartbeat,
  }: EachBatchPayload) {
    const records = batch.messages.map((message) =>
      JSON.parse(message.value.toString()),
    );
    if (records.length > 0) {
      await this.writeBetBatchToClickhouse(records);
    }

    resolveOffset(batch.messages[batch.messages.length - 1].offset);
    await heartbeat();
    console.log('Processed:', batch.messages.length);
  }

  private async writeBetBatchToClickhouse(records: any[]) {
    try {
      const result = await this.chClient.insert({
        table: 'bets',
        values: records,
        format: 'JSONEachRow',
      });
      console.log('Batch data written to ClickHouse successfully', result);
    } catch (error) {
      console.error('Error writing batch to ClickHouse:', error);
    }
  }
}
