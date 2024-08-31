import { Injectable } from '@angular/core';
import { RxStomp, RxStompState } from "@stomp/rx-stomp";
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { Message } from '../_interfaces/message';
import { InjectableRxStompConfig } from '@stomp/ng2-stompjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {

    private readonly client: RxStomp = new RxStomp();
    private readonly isConnected$ = new BehaviorSubject<boolean>(false);

    constructor() {
        this.initializeConnectionStateMonitoring();
    }

    /**
     * Initializes the monitoring of the WebSocket connection state.
     */
    private initializeConnectionStateMonitoring(): void {
        this.client.connectionState$.subscribe((state: RxStompState) => {
            const isConnected = state === RxStompState.OPEN;
            this.isConnected$.next(isConnected);
            if (isConnected) {
                console.log("Connected to WebSocket");
            }
        });
    }

    /**
     * Configures and activates the WebSocket connection.
     * @param token - The authentication token.
     */
    connect(token: string): void {
        const stompConfig = this.getStompConfig(token);
        this.client.configure(stompConfig);
        if (this.client.connectionState$.getValue() !== RxStompState.CLOSING) {
            this.client.activate();
        }
    }

    /**
     * Returns the configuration settings for the WebSocket connection.
     * @param token - The authentication token.
     * @returns The configuration settings.
     */
    private getStompConfig(token: string): InjectableRxStompConfig {
        return {
            brokerURL: environment.webSocketUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            heartbeatIncoming: 0,
            heartbeatOutgoing: 20000,
            reconnectDelay: 5000,
        };
    }

    /**
     * Sends a message through the WebSocket connection.
     * @param destination - The destination endpoint.
     * @param message - The message to send.
     */
    private sendMessage(destination: string, message: any): void {
        if (this.client.active) {
            this.client.publish({
                destination,
                body: JSON.stringify(message)
            });
        } else {
            console.error('Cannot send message, WebSocket is not connected.');
        }
    }

    /**
     * Sends a new message through the WebSocket connection.
     * @param message - The message to send.
     */
    sendNewMessage(message: Message): void {
        this.sendMessage('/app/send', message);
    }

    /**
     * Sends an updated message through the WebSocket connection.
     * @param message - The message to send.
     */
    sendUpdatedMessage(message: Message): void {
        this.sendMessage('/app/update', message);
    }

    /**
     * Sends multiple updated messages through the WebSocket connection.
     * @param messages - The messages to send.
     */
    sendUpdateMessages(messages: Message[]): void {
        this.sendMessage('/app/update-messages', messages);
    }

    /**
     * Listens for new messages from the WebSocket connection.
     * @returns An observable that emits received messages.
     */
    listenForNewMessage(): Observable<Message> {
        return this.client.watch('/topic/message').pipe(
            map((message: any) => JSON.parse(message.body) as Message),
            catchError((err) => {
                console.error('Error receiving message', err);
                return throwError(() => err);
            })
        );
    }

    /**
     * Listens for a list of messages from the WebSocket connection.
     * @returns An observable that emits received messages.
     */
    listenForListOfMessages(): Observable<Message[]> {
        return this.client.watch('/topic/messages').pipe(
            map((message: any) => JSON.parse(message.body) as Message[]),
            catchError((err) => {
                console.error('Error receiving message', err);
                return throwError(() => err);
            })
        );
    }

    /**
     * Disconnects the WebSocket connection.
     */
    disconnect(): void {
        if (this.client.active) {
            console.log('Disconnecting WebSocket');
            this.client.deactivate();
            this.isConnected$.complete();
        }
    }

    /**
     * Returns an observable that emits the connection state.
     * @returns An observable that emits a boolean indicating if the connection is open.
     */
    getIsConnectionOpened(): Observable<boolean> {
        return this.isConnected$.asObservable();
    }
}