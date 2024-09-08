import { Injectable, OnDestroy } from '@angular/core';
import { Message, messageStatues } from '../_interfaces/message';
import { WebSocketService } from './web-socket.service';
import { AuthenticationService } from './authentication.service';
import { DiscussionService } from './discussion.service';
import { Discussion } from '../_interfaces/discussion';
import { map, Subscription, switchMap, takeUntil, tap, Subject, of } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService implements OnDestroy {

    private listenSubscription: Subscription | undefined;
    private destroy$ = new Subject<void>();

    constructor(
        private webSocketService: WebSocketService,
        private authService: AuthenticationService,
        private discussionService: DiscussionService,
        private userService : UserService
    ) { }

    /**
     * Connects to the WebSocket service and handles reconnection logic.
     */
    connect(): void {

        this.webSocketService.initializeConnectionStateMonitoring()

        this.webSocketService.getIsConnectionOpened().pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (isConnectionOpened) => {
                if (!isConnectionOpened) {
                    console.log("Connection has been closed. Reconnecting...");
                    this.webSocketService.connect(this.authService.getToken()!);
                }
            },
            error: (err) => {
                console.error('Error while connecting to WebSocket:', err);
            }
        });
    }

    /**
     * Sends a message through the WebSocket service.
     * @param message The message to be sent.
     */
    sendMessage(message: Message): void {
        this.webSocketService.sendNewMessage(message);
    }

    /**
     * Sends an updated message through the WebSocket service.
     * @param message The message to be updated.
     */
    sendUpdatedMessage(message: Message): void {
        this.webSocketService.sendUpdatedMessage(message);
    }

    /**
     * Sends multiple updated messages through the WebSocket service.
     * @param messages The array of messages to be updated.
     */
    sendUpdateMessages(messages: Message[]): void {
        this.webSocketService.sendUpdateMessages(messages);
    }

    /**
     * Listens for incoming messages and updates the provided discussion.
     * @param discussion The discussion to update with new messages.
     * @param currentUserId The ID of the current user.
     */
    listenForNewMessage(discussion: Discussion): void {
        console.log('Listening for new messages');
        
        this.listenSubscription = this.webSocketService.getIsConnectionOpened().pipe(
            map(isConnectionOpened => !isConnectionOpened),
            switchMap(() => this.webSocketService.listenForNewMessage()),
            switchMap((message: Message) => {
                let currentUserId = this.userService.userInfoSubject$.getValue().id;
                if (currentUserId === message.receiverId && message.status !== messageStatues.read) {                    
                    message.status = messageStatues.read;
                    message.discussionId = discussion.id;
                    this.sendUpdatedMessage(message);
                    return this.discussionService.updateMessageStatus(discussion.id!, message);
                }
                return of(message);
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (message: Message) => {
                const index = discussion.messages!.findIndex(m => m.id === message.id);
                if (index !== -1) {
                    console.log("Updating message status");
                    discussion.messages![index] = message;
                } else {
                    discussion.messages!.push(message);
                }
            },
            error: (err) => {
                console.error('Error receiving message:', err);
            }
        });
    }

    /**
     * Listens for a list of messages and updates the provided discussion.
     * @param discussion The discussion to update with the list of messages.
     */
    listenForListOfMessages(discussion: Discussion): void {
        console.log('Listening for updated messages');
        this.listenSubscription = this.webSocketService.getIsConnectionOpened().pipe(
            map(isConnectionOpened => !isConnectionOpened),
            switchMap(() => this.webSocketService.listenForListOfMessages()),
            takeUntil(this.destroy$)
        ).subscribe({
            next: (messages: Message[]) => {
                messages.forEach(message => {
                    const index = discussion.messages!.findIndex(m => m.id === message.id);
                    if (index !== -1) {
                        console.log("Updating message status");
                        discussion.messages![index] = message;
                    }
                });
            },
            error: (err) => {
                console.error('Error receiving a list of messages:', err);
            }
        });
    }

    /**
     * Disconnects from the WebSocket service.
     */
    disconnect(): void {
        console.log('Disconnecting from WebSocket');
        this.listenSubscription?.unsubscribe();
        this.webSocketService.disconnect();
    }

    /**
     * Cleans up subscriptions when the service is destroyed.
     */
    ngOnDestroy(): void {
        console.log('Destroying ChatService');
        this.destroy$.next();
        this.destroy$.complete();
        this.disconnect();
    }
}