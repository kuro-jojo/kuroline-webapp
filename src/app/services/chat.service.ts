import { Injectable, OnDestroy } from '@angular/core';
import { Message } from '../_interfaces/message';
import { WebSocketService } from './web-socket.service';
import { AuthenticationService } from './authentication.service';
import { map, Subscription, switchMap, takeUntil, tap, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService implements OnDestroy {

    private listenSubscription: Subscription | undefined;
    private destroy$ = new Subject<void>();

    constructor(
        private webSocketService: WebSocketService,
        private authService: AuthenticationService,
    ) { }

    /**
     * Connects to the WebSocket service and handles reconnection logic.
     */
    connect() {
        this.webSocketService.getIsConnectionOpened().pipe(
            tap(isConnectionOpened => {
                if (!isConnectionOpened) {
                    console.log("Connection has been closed. Reconnecting...");
                    this.webSocketService.connect(this.authService.getToken()!);
                }
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            error: (err) => {
                console.error('Error in connection:', err);
            }
        });
    }

    /**
     * Sends a message through the WebSocket service.
     * @param message The message to be sent.
     */
    sendMessage(message: Message) {
        this.webSocketService.send(message);
    }

    /**
     * Listens for incoming messages and pushes them to the provided array.
     * @param messages The array to store received messages.
     */
    listen(messages: Message[]) {
        console.log('Listening to messages');
        this.listenSubscription = this.webSocketService.getIsConnectionOpened().pipe(
            map(isConnectionOpened => !isConnectionOpened),
            switchMap(() => this.webSocketService.listen()),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (message: Message) => {
                messages.push(message);
            },
            error: (err) => {
                console.error('Error receiving message:', err);
            }
        });
    }

    /**
     * Disconnects from the WebSocket service.
     */
    disconnect() {
        this.webSocketService.disconnect();
    }

    /**
     * Cleans up subscriptions when the service is destroyed.
     */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.listenSubscription?.unsubscribe();
    }
}