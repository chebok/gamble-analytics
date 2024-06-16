import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { BettingGateway } from './betting/betting.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),
    KafkaModule,
  ],
  providers: [BettingGateway],
})
export class AppModule {}
