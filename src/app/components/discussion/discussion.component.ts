import { Component, OnDestroy, OnInit } from '@angular/core';
import { User, userStatuses } from '../../_interfaces/user';
import { Message } from '../../_interfaces/message';
import { Discussion } from '../../_interfaces/discussion';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { DiscussionService } from '../../services/discussion.service';
import { Subscription, switchMap } from 'rxjs';

@Component({
    selector: 'app-discussion',
    templateUrl: './discussion.component.html',
    styleUrl: './discussion.component.css',
})
export class DiscussionComponent implements OnInit, OnDestroy {
    currentUser: User | undefined;
    currentReceiver: User | undefined;
    messageContent: string = '';
    activeDiscussion: Discussion | undefined;
    lastSenderId: string | undefined;
    userStatuses = userStatuses;

    currentMessagesDate: Date = new Date();

    subscriptions: Subscription[] = [];

    constructor(
        private chatService: ChatService,
        private userService: UserService,
        private discussionService: DiscussionService,
    ) { }

    ngOnInit() {
        this.initializeCurrentUser();
        this.initializeDiscussion();
    }

    /**
     * Initializes the current user by subscribing to the user service.
     */
    private initializeCurrentUser(): void {
        this.subscriptions.push(
            this.userService.getCurrentUser().subscribe({
                next: (user: User) => {
                    this.currentUser = user;
                },
                error: (error) => {
                    console.error(error);
                }
            })
        )
    }

    /**
     * Initializes the discussion by connecting to the chat service and subscribing to the current discussion.
     */
    private initializeDiscussion(): void {
        this.chatService.connect();
        this.subscribeToDiscussion();
    }

    /**
     * Subscribes to the current discussion and updates the receiver and discussion details.
     */
    private subscribeToDiscussion(): void {
        this.subscriptions.push(
            this.discussionService.getCurrentDiscussion()
                .pipe(
                    switchMap((discussion: Discussion | undefined) => {
                        if (discussion && this.activeDiscussion?.id !== discussion.id) {
                            this.activeDiscussion = discussion;

                            if (!this.activeDiscussion.messages) {
                                this.activeDiscussion.messages = [];
                            } 
                            // Connect to the new discussion

                            this.chatService.listen(this.activeDiscussion!.messages!);

                            if (this.activeDiscussion.ownerId === this.currentUser?.id) {
                                return this.userService.getUserDetails(discussion.contactId);
                            }

                            if (this.activeDiscussion.contactId === this.currentUser?.id) {
                                return this.userService.getUserDetails(discussion.ownerId);
                            }
                        }
                        return [];
                    }))
                .subscribe({
                    next: (receiver: User) => {
                        this.currentReceiver = receiver;
                    },
                    error: (error) => {
                        console.error(error);
                    }
                })
        )
    }

    /**
     * Sends a message to the current receiver.
     */
    sendMessage(): void {
        if (this.messageContent) {
            const message: Message = {
                receiverId: this.currentReceiver?.id!,
                content: this.messageContent,
                discussionId: this.activeDiscussion!.id!,
            };
            this.chatService.sendMessage(message);
            this.messageContent = '';
        }
    }

    /**
     * Sends a message when the enter key is pressed.
     */
    onEnterPressed(): void {
        this.sendMessage();
    }

    /**
     * Cleans up subscriptions and disconnects from the chat service when the component is destroyed.
     */
    ngOnDestroy(): void {
        this.chatService.disconnect();
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }


}