import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Admin,
  Consumer,
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly logger = new Logger(ConsumerService.name);
  private kafka: Kafka;
  private admin: Admin;
  private readonly consumers: Consumer[] = [];
  // Моки
  private topicsData = [
    { topic: 'bets', numPartitions: 2, replicationFactor: 3 },
  ];

  constructor(configService: ConfigService) {
    const host1 = configService.get('KAFKA_HOST_1');
    const port1 = configService.get('KAFKA_PORT_1');

    const host2 = configService.get('KAFKA_HOST_2');
    const port2 = configService.get('KAFKA_PORT_2');

    const host3 = configService.get('KAFKA_HOST_3');
    const port3 = configService.get('KAFKA_PORT_3');

    this.kafka = new Kafka({
      brokers: [`${host1}:${port1}`, `${host2}:${port2}`, `${host3}:${port3}`],
    });
  }

  async consume(
    consumerConfig: ConsumerConfig,
    topics: ConsumerSubscribeTopics,
    consumerRunConfig: ConsumerRunConfig,
  ) {
    this.admin = this.kafka.admin();
    await this.admin.connect();

    // Инициализации всех топиков
    await this.initTopics();
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

  private async initTopics() {
    for (const topicConfig of this.topicsData) {
      await this.createTopicIfNotExists(topicConfig);
    }
  }

  private async createTopicIfNotExists({
    topic,
    numPartitions,
    replicationFactor,
  }) {
    const topics = await this.admin.listTopics();

    if (!topics.includes(topic)) {
      await this.admin.createTopics({
        topics: [{ topic, numPartitions, replicationFactor }],
      });
      this.logger.log(
        `Topic ${topic} created with ${numPartitions} partitions and replication factor of ${replicationFactor}`,
      );
    } else {
      this.logger.log(`Topic ${topic} already exists`);
    }
  }
}
