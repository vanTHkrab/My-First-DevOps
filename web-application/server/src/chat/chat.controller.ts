import { Controller, Post, Body } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatGateway: ChatGateway) {}

  @Post()
  handleChat(@Body() data: SendMessageDto): { success: boolean } {
    const msg = {
      id: data.id ?? crypto.randomUUID(),
      sender: data.sender,
      message: data.message,
      timestamp: data.timestamp ?? Date.now(),
    };

    this.chatGateway.server.emit('receive_message', msg);
    console.log(`[HTTP] message from ${msg.sender}: ${msg.message}`);
    return { success: true };
  }
}