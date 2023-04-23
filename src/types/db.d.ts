interface User {
    name: string
    email:string
    image: string
    id: string
}

interface Chat{
    id:string
    messages: Message[]
}

interface Message {
    id: string
    senderID: string
    receiverID: string
    text: string
    timestamp: number | null
}

interface FriendRequest {
    id: string
    senderId: string
    receiverId: string
}
