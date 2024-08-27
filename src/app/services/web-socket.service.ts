import { Injectable } from '@angular/core';
import { RxStomp } from "@stomp/rx-stomp";
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { Message } from '../_interfaces/message';
import { InjectableRxStompConfig } from '@stomp/ng2-stompjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {

    private client: RxStomp = new RxStomp();
    private isConnected = new BehaviorSubject<boolean>(false);

    constructor() { }

    connect(token: string): void {
        const stompConfig: InjectableRxStompConfig = {
            brokerURL: environment.webSocketUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            heartbeatIncoming: 0, // Adjust heartbeat settings if necessary
            heartbeatOutgoing: 20000,
            reconnectDelay: 5000,
            // debug: (msg: string): void => {
            //     console.log(new Date(), msg);
            // }
        };

        this.client.configure(stompConfig);
        this.client.activate();

        // Handle connection state
        this.client.connected$.subscribe({
            next: () => {
                this.isConnected.next(true);
                console.log('Connected to WebSocket');
            },
            error: () => {
                this.isConnected.next(false);
                console.error('WebSocket connection error');
            }
        });
    }

    send(message: Message): void {
        if (this.client.active) {
            this.client.publish({
                destination: '/app/send',
                body: JSON.stringify(message)
            });
        } else {
            console.error('Cannot send message, WebSocket is not connected.');
        }
    }

    listen(): Observable<Message> {
        if (!this.client.active) {
            console.error('Cannot listen, WebSocket is not connected.');
            return new Observable<Message>();
        }

        return this.client.watch('/topic/public').pipe(
            map((message: any) => {
                // Parse the message body as your Message model
                return JSON.parse(message.body) as Message;
            }),
            catchError((err) => {
                console.error('Error receiving message', err);
                return throwError(() => err);
            })
        );
    }

    disconnect(): void {
        if (this.client.active) {
            this.client.deactivate();
            this.isConnected.next(false);
        }
    }

    getIsConnected(): Observable<boolean> {
        return this.isConnected.asObservable();
    }
}
