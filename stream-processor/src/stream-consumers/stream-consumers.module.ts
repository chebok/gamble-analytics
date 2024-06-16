import { Module } from '@nestjs/common';
import { KafkaModule } from '../kafka/kafka.module';
import { BetConsumer } from './bet.consumer';

@Module({
  imports: [KafkaModule],
  providers: [BetConsumer],
})
export class StreamConsumersModule {}
