export interface Message {
    id?: string;
    senderId?: string;
    receiverId: string;
    content: string;
    discussionId?: string;
    groupId?: string;
    sentAt?: Date;
    status?: string;
}

export const messageStatues = {
    sent: "SENT",
    read: "READ",
    delivered: "DELIVERED",
    deleted: "DELETED"
}