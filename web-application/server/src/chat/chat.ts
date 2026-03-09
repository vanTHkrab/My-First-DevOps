export class Chat {
  id: string;
  sender: string;
  message: string;
  timestamp: number;

  constructor(sender: string, message: string) {
    this.id = crypto.randomUUID();
    this.sender = sender;
    this.message = message;
    this.timestamp = Date.now();
  }
}

