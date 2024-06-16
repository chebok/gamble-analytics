import { Body, Controller, Post } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ProducerService } from '../kafka/producer.service';
import { CreateBetDto } from './dto/create-bet.dto';

@Controller('betting')
export class BettingController {
  constructor(private readonly producerService: ProducerService) {}

  @Post()
  async postBet(@Body() createBetDto: CreateBetDto) {
    // Здесь происходит логика создания самой ставки.
    // .............

    // Подготавливаем данные для отправки в Kafka
    const message = JSON.stringify(
      Object.assign(createBetDto, { event_id: uuidv4() }),
    );

    // Отправляем в кафку
    await this.producerService.produce({
      topic: 'bets',
      messages: [
        {
          value: message,
        },
      ],
    });

    return { message: 'OK' };
  }
}
