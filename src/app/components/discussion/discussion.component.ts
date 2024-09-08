import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, switchMap } from 'rxjs';

import { User, userStatuses } from '../../_interfaces/user';
import { Message, messageStatues } from '../../_interfaces/message';
import { Discussion } from '../../_interfaces/discussion';

import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { DiscussionService } from '../../services/discussion.service';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
    selector: 'app-discussion',
    templateUrl: './discussion.component.html',
    styleUrls: ['./discussion.component.css'],
})
export class DiscussionComponent implements OnInit, OnDestroy {
    currentUser: User | undefined;
    currentReceiver: User | undefined;
    messageContent: string = '';
    activeDiscussion: Discussion | undefined;
    lastSenderId: string | undefined;
    userStatuses = userStatuses;
    messageStatues = messageStatues;

    subscriptions: Subscription[] = [];

    isEmojiPickerOpened: boolean = false;

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
                    console.error('Error fetching current user:', error);
                }
            }));
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
                    switchMap((discussion: Discussion | undefined) => this.handleDiscussionChange(discussion))
                )
                .subscribe({
                    next: (receiver: User) => {
                        this.currentReceiver = receiver;
                    },
                    error: (error) => {
                        console.error('Error subscribing to discussion:', error);
                    }
                }))
    }

    /**
     * Handles changes in the discussion and updates the receiver details.
     * @param discussion The current discussion.
     * @returns An observable of the receiver details.
     */
    private handleDiscussionChange(discussion: Discussion | undefined) {
        if (!discussion || this.activeDiscussion?.id === discussion.id) {
            return [];
        }

        this.activeDiscussion = discussion;
        this.activeDiscussion.messages = this.activeDiscussion.messages ?? [];

        this.connectToDiscussion();

        const unreadMessages = this.getUnreadMessages();
        if (unreadMessages.length > 0) {
            this.markMessagesAsRead(unreadMessages);
        }

        return this.fetchReceiverDetails(discussion);
    }

    /**
     * Connects to the current discussion to listen for new messages.
     */
    private connectToDiscussion(): void {
        this.chatService.listenForNewMessage(this.activeDiscussion!);
        this.chatService.listenForListOfMessages(this.activeDiscussion!);
    }

    /**
     * Retrieves unread messages for the current user.
     * @returns An array of unread messages.
     */
    private getUnreadMessages(): Message[] {
        return this.activeDiscussion!.messages!.filter(
            message => message.receiverId === this.currentUser?.id && message.status !== messageStatues.read
        );
    }

    /**
     * Marks the given messages as read and sends an update to the chat service.
     * @param unreadMessages An array of unread messages.
     */
    private markMessagesAsRead(unreadMessages: Message[]): void {
        unreadMessages.forEach(message => {
            message.status = messageStatues.read;
            message.discussionId = this.activeDiscussion!.id ?? '';
        });
        this.chatService.sendUpdateMessages(unreadMessages);
    }

    /**
     * Fetches the receiver details based on the discussion.
     * @param discussion The current discussion.
     * @returns An observable of the receiver details.
     */
    private fetchReceiverDetails(discussion: Discussion) {
        if (this.activeDiscussion!.ownerId === this.currentUser?.id) {
            return this.userService.getUserDetails(discussion.contactId);
        }

        if (this.activeDiscussion!.contactId === this.currentUser?.id) {
            return this.userService.getUserDetails(discussion.ownerId);
        }

        return [];
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
            this.isEmojiPickerOpened = false;
        }
    }

    /**
     * Opens the emoji picker.
     */

    openEmojiPicker(): void {
        this.isEmojiPickerOpened = !this.isEmojiPickerOpened;
    }

    addEmojiToMessage(event: EmojiEvent): void {
        this.messageContent += event.emoji.native;
    }
    /**
     * Cleans up subscriptions and disconnects from the chat service when the component is destroyed.
     */
    ngOnDestroy(): void {
        console.log("Destroying discussion component");
        this.chatService.disconnect();
        this.discussionService.setCurrentDiscussion(undefined);
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}