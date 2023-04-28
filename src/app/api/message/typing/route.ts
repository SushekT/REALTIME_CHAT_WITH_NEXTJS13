import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const { text, chatPartner } = await req.json();

  const session = await getServerSession(authOptions);

  if (text.length > 1) {
    pusherServer.trigger(
      toPusherKey(`isTyping:${chatPartner.id}`),
      "isTypingMessage",
      { isTypingNow: true }
    );
  } else {
    pusherServer.trigger(
      toPusherKey(`isTyping:${chatPartner.id}`),
      "isTypingMessage",
      { isTypingNow: false }
    );
  }

  return new Response("OK");
}
