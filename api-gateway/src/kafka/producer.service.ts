import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Admin,
  ITopicConfig,
  Kafka,
  Partitioners,
  Producer,
  ProducerRecord,
} from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(ProducerService.name);
  // Моки
  private topicsData: ITopicConfig[] = [
    { topic: 'bets', numPartitions: 2, replicationFactor: 3 },
  ];

  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;

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

    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });

    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.admin.connect();

    // Инициализации всех топиков
    await this.initTopics();
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
    await this.admin.disconnect();
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
  }: ITopicConfig) {
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
