import { Injectable } from '@angular/core';
import { Message } from '../_interfaces/message';
import { WebSocketService } from './web-socket.service';
import { AuthenticationService } from './authentication.service';
import { Message as SMessage } from '@stomp/stompjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    constructor(
        private webSocketService: WebSocketService,
        private authService: AuthenticationService,
    ) { }

    connect() {
        this.webSocketService.connect(this.authService.token!);
    }

    sendMessage(message: Message) {
        this.webSocketService.send(message);
    }

    listen() {
        this.webSocketService.getIsConnected().subscribe(isConnected => {
            if (isConnected) {
              this.webSocketService.listen().subscribe({
                next: (message: Message) => {
                  console.log('Received message:', message);
                },
                error: (err) => {
                  console.error('Error receiving message:', err);
                }
              });
            }
          });
    }

    disconnect() {
        this.webSocketService.disconnect();
    }
}
