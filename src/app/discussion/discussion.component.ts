import { Component } from '@angular/core';
import { User } from '../_interfaces/user';
import { Message } from '../_interfaces/message';
import { ChatService } from '../services/chat.service';

@Component({
    selector: 'app-discussion',
    templateUrl: './discussion.component.html',
    styleUrl: './discussion.component.css'
})
export class DiscussionComponent {
    currentUser: User | undefined;
    messageContent: string = '';

    messages: Message[] = [];
    constructor(
        private chatService: ChatService,
    ) {
    }

    ngOnInit() {
        // Subscribe to incoming messages
        this.chatService.connect();
        this.chatService.listen()        
    }

    sendMessage() {
        if (this.messageContent) {
            const message: Message = {
                senderId: "my id",
                receiverId: "receiver id",
                content: this.messageContent,
                sentAt: new Date(),
            };
            console.log("Sending message");
            this.chatService.sendMessage(message);
            this.messageContent = '';
        }

        this.chatService.disconnect();
    }
}
