export interface Message {
    id : number;
    senderId : number;
    receiverId : number;
    content : string;
    sentAt : Date;
    isRead : boolean;
    isDelivered : boolean;
    isDeleted : boolean;
}
