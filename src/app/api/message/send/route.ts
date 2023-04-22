import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { timeStamp } from "console";
import { Message, messageValidator } from "@/lib/validations/message";
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  try {
    const { text, chatId } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response("Unauthorizrd", { status: 401 });
    }

    const friendId = session.user.id == userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];

    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawSender = (await fetchRedis("get", `user:${session.user.id}`)) as string;
    const sender = JSON.parse(rawSender) as User
    
    // all ok we can send message

    const timestamp = Date.now()

    const messageData: Message = {
        id: nanoid(),
        senderId: session.user.id,
        text,
        timestamp,
    }

    const message = messageValidator.parse(messageData);

    await db.zadd(`chat:${chatId}:messages`, {
        score: timestamp,
        member: JSON.stringify(message),
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof Error){
        return new Response(error.message, {status:500})
    }
    return new Response('Internal Server Error', {status:500})
  }
}
