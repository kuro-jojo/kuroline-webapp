import { Injectable } from '@angular/core';
import { Message } from '../_interfaces/message';
import { WebSocketService } from './web-socket.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    constructor(
        private webSocketService: WebSocketService,
        private authService: AuthenticationService,
    ) { }

    connect() {
        this.webSocketService.connect(this.authService.getToken()!);
    }

    sendMessage(message: Message) {
        this.webSocketService.send(message);
    }

    listen(messages: Message[]) {
        this.webSocketService.getIsConnected().subscribe(isConnected => {
            if (isConnected) {
                this.webSocketService.listen().subscribe({
                    next: (message: Message) => {
                        messages.push(message); 
                        // messages = output;
                     },
                    error: (err) => {
                        console.error('Error receiving message:', err);
                    }
                });
            }
        });
    }

    disconnect() {
        console.log('Disconnecting WebSocket');

        this.webSocketService.disconnect();
    }
}
