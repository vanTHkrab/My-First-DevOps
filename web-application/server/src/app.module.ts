import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [HealthModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

