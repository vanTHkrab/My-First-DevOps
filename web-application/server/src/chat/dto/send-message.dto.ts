import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  id?: string;
  @IsString()
  @IsNotEmpty()
  sender: string;
  @IsString()
  @IsNotEmpty()
  message: string;
  timestamp?: number;
}
