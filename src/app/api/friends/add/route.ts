import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    if (!idToAdd) {
      return new Response("This account does not exist.", { status: 400 });
    }

    console.log("done", idToAdd);

    const session = await getServerSession(authOptions);
    // UnAuthorized Access

    if (!session) {
      return new Response("UnAuthorized Access", { status: 401 });
    }
    // Cannot add yourself as a friend
    if (idToAdd === session.user.id) {
      return new Response("You cannot add yourself as a friend", {
        status: 400,
      });
    }

    // check if user is already added as a friend
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return new Response("Already Added. Please try with different user", {
        status: 400,
      });
    }

    // check if user is already  a friend
    const alreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (alreadyFriends) {
      return new Response(
        "You are Already Friend. Please try with different user",
        { status: 400 }
      );
    }

    // valid request, i.e. sending friend request

    pusherServer.trigger(
      toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
      `incoming_friend_requests`,
      {
        senderId: session.user.id,
        senderEmail: session.user.email,
      }
    );

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response("ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid Request payload", { status: 422 });
    }
    return new Response("Invalid Request", { status: 400 });
  }
}
