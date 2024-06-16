import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
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
    { topic: 'bets', numPartitions: 2, replicationFactor: 1 },
  ];

  private readonly kafka = new Kafka({
    brokers: ['kafka1:9091'],
  });
  private readonly producer: Producer = this.kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });
  private readonly admin: Admin = this.kafka.admin();

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
