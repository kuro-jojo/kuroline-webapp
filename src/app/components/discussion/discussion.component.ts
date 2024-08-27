import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../../_interfaces/user';
import { Message } from '../../_interfaces/message';
import { Discussion } from '../../_interfaces/discussion';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-discussion',
    templateUrl: './discussion.component.html',
    styleUrl: './discussion.component.css',
})
export class DiscussionComponent implements OnInit, OnDestroy {

    currentUser: User | undefined;
    currentReceiver: User | undefined;
    messageContent: string = '';
    discussion: Discussion | undefined;
    lastSenderId: string | undefined;

    constructor(
        private chatService: ChatService,
        private userService: UserService,
    ) {
    }

    ngOnInit() {
        // Retrieve the discussion between the current user and the receiver
        this.userService.getCurrentUser().subscribe({
            next: (user: User) => {
                this.currentUser = user;
                this.getDiscussionHistory();
            },
            error: (error) => {
                console.error(error);
            }
        });


    }

    getDiscussionHistory() {
        this.initializeDiscussion();
    }

    initializeDiscussion() {

        this.currentReceiver = {
            id: "receiver id",
            email: "receiver email",
            name: "receiver name",
            profilePicture: "https://buffer.com/library/content/images/size/w1200/2023/10/free-images.jpg",
        };
        this.discussion = {
            id: "discussion id",
            ownerId: this.currentUser!.id!,
            contactId: this.currentReceiver!.id!,
            lastMessageId: "",
            messages: [],
        };
        // // Subscribe to incoming messages
        this.chatService.connect();
        this.chatService.listen(this.discussion.messages);
    }

    ngOnDestroy(): void {
        this.chatService.disconnect();
    }

    sendMessage() {
        if (this.messageContent) {
            const message: Message = {
                receiverId: "receiver id",
                content: this.messageContent,
                discussionId: this.discussion!.id!,
            };
            this.chatService.sendMessage(message);
            this.messageContent = '';
        }
    }



    isSameSender(index: number, msg: Message): boolean {
        if (index > 0) {
            const prevMsg = this.discussion!.messages[index - 1];
            return prevMsg.senderId !== msg.senderId;
        }
        return true;
    }

    onKeyDown() {
        this.sendMessage();
    }

    trackByFn(index: number, item: any): string {
        console.log(item.id, index);
        return item.id; // or any unique identifier for your item
    }

}