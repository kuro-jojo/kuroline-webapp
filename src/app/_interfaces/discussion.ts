import { Attachment } from "./attachment";
import { Message } from "./message";

export interface Discussion {
    id?: string;
    ownerId: string; // the current user
    contactId: string   // the contact with whom the user is having a discussion;
    messages?: Message[];
    lastMessageId?: string;
    lastMessageSentAt?: Date;
    lastMessageSentBy?: string; // the user who sent the last message
    attachments?: Attachment[];
}
