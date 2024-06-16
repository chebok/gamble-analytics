import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private kafka: Kafka;
  private readonly consumers: Consumer[] = [];

  constructor(configService: ConfigService) {
    const host = configService.get('KAFKA_HOST');
    const port = configService.get('KAFKA_PORT');

    this.kafka = new Kafka({
      brokers: [`${host}:${port}`],
    });
  }

  async consume(
    consumerConfig: ConsumerConfig,
    topics: ConsumerSubscribeTopics,
    consumerRunConfig: ConsumerRunConfig,
  ) {
    const consumer = this.kafka.consumer(consumerConfig);
    await consumer.connect();
    await consumer.subscribe(topics);
    await consumer.run(consumerRunConfig);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
