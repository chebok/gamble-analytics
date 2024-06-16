import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { StreamConsumersModule } from './stream-consumers/stream-consumers.module';
import { CLickHouseModule } from './clickhouse/clickhouse.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),
    CLickHouseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('CH_HOST'),
        port: configService.get<number>('CH_PORT'),
      }),
    }),
    KafkaModule,
    StreamConsumersModule,
  ],
})
export class AppModule {}
