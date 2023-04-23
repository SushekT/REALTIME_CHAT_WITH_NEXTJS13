"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );

  const acceptFriend = async (sendId: string) => {
    await axios.post("/api/friends/accept", { id: sendId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== sendId)
    );
    router.refresh();
  };

  const denyfriend = async (sendId: string) => {
    await axios.post("/api/friends/deny", { id: sendId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== sendId)
    );
    router.refresh();
  };

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);
    };

    pusherClient.bind(`incoming_friend_requests`, friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind(`incoming_friend_requests`, friendRequestHandler);
    };
  });

  return (
    <>
      {friendRequests.length == 0 ? (
        <p className="text-sm text-zinc-500">No Friend Requests.</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              aria-label="accept friend"
              onClick={() => acceptFriend(request.senderId)}
            >
              <Check className="font-semibold text-white w-3/4 h-3/4"></Check>
            </button>
            <button
              className="w-8 h-8 bg-red-800 hover:bg-red-900 grid place-items-center rounded-full transition hover:shadow-md"
              aria-label="deny friend"
              onClick={() => denyfriend(request.senderId)}
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
