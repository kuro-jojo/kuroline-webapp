export interface Message {
    id? : string;
    senderId : string;
    receiverId : string;
    content : string;
    sentAt : Date;
    isRead? : boolean;
    isDelivered? : boolean;
    isDeleted? : boolean;
}
