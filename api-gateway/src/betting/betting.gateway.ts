import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { setTimeout } from 'node:timers/promises';
import { CreateBetDto } from './dto/create-bet.dto';
import { ProducerService } from '../kafka/producer.service';

@WebSocketGateway({
  namespace: '/betting',
  cors: {
    origin: '*',
  },
})
export class BettingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly producerService: ProducerService) {}

  @SubscribeMessage('placeBet')
  async handlePlaceBet(
    @MessageBody() createBetDto: CreateBetDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('Received bet:', createBetDto);
    // Логика обработки сервиса отвечающего за геймлей

    // Сразу отправляем клиенту подтверждение о приеме ставки
    client.emit('betReceived', { status: 'received', createBetDto });

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

    // Имитация обработки ставки с задержкой
    await setTimeout(2000); // Задержка 2 секунды для имитации обработки

    client.emit('betOutcome', {
      status: 'success',
      outcome: 'win',
    });
  }
}
