import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected:    ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('send_message')
  handleMessage(@MessageBody() data: CreateMessageDto): void {
    console.log(`[WS] message from ${data.sender}: ${data.message}`);
    this.server.emit('receive_message', data);
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @MessageBody() data: { sender: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.broadcast.emit('typing_start', { sender: data.sender });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @MessageBody() data: { sender: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.broadcast.emit('typing_stop', { sender: data.sender });
  }
}
