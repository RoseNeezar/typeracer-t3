import Pusher, { Channel, PresenceChannel } from "pusher-js";
import reactZustandCreate from "zustand";
import vanillaCreate, { StoreApi } from "zustand/vanilla";

const pusher_key = process.env.NEXT_PUBLIC_PUSHER_APP_KEY!;
const pusher_server_host = process.env.NEXT_PUBLIC_PUSHER_SERVER_HOST!;
const pusher_server_port = parseInt(
  process.env.NEXT_PUBLIC_PUSHER_SERVER_PORT!,
  10
);
const pusher_server_tls = process.env.NEXT_PUBLIC_PUSHER_SERVER_TLS === "true";
const pusher_server_cluster = process.env.NEXT_PUBLIC_PUSHER_SERVER_CLUSTER!;

interface PusherZustandStore {
  pusherClient: Pusher;
  channel: Channel;
  presenceChannel: PresenceChannel;
  userChannel: UserFacade;
  members: Map<string, any>;
}
let store: StoreApi<PusherZustandStore>;
const createPusherStore = (
  nickname: string,
  playerId: string,
  gameId: string
) => {
  if (store) {
    return store;
  }

  const pusherClient = new Pusher(pusher_key, {
    wsHost: pusher_server_host,
    wsPort: pusher_server_port,
    wssPort: pusher_server_port,
    enabledTransports: pusher_server_tls ? ["ws", "wss"] : ["ws"],
    forceTLS: false,
    cluster: "",
    disableStats: true,
    authEndpoint: "/api/pusher/auth-channel",
    auth: {
      headers: { user_id: playerId, nickname },
    },
    userAuthentication: {
      endpoint: "/api/pusher/auth-user",
      transport: "ajax",
      headers: { user_id: playerId, nickname },
    },
  });

  pusherClient.signin();

  const channel = pusherClient.subscribe(`game-${gameId}`);

  const userChannel = pusherClient.user;

  const presenceChannel = pusherClient.subscribe(
    `presence-${gameId}`
  ) as PresenceChannel;

  const newStore = vanillaCreate<PusherZustandStore>((set) => {
    return {
      pusherClient: pusherClient,
      channel: channel,
      presenceChannel: presenceChannel,
      userChannel,
      members: new Map(),
    };
  });

  const updateMembers = () => {
    newStore.setState(() => ({
      members: presenceChannel.members.members,
    }));

    console.log("members", presenceChannel.members.members, pusherClient);
  };

  presenceChannel.bind("pusher:subscription_succeeded", updateMembers);
  presenceChannel.bind("pusher:member_added", updateMembers);
  presenceChannel.bind("pusher:member_removed", updateMembers);

  store = newStore;

  return newStore;
};

/**
 * Section 2: "The Context Provider"
 *
 * This creates a "Zustand React Context" that we can provide in the component tree.
 */
import createContext from "zustand/context";
const { Provider: PusherZustandStoreProvider, useStore: usePusherStore } =
  createContext<StoreApi<PusherZustandStore>>();

import React from "react";
import UserFacade from "pusher-js/types/src/core/user";
/**
 * This provider is the thing you mount in the app to "give access to Pusher"
 *
 * Note: MAKE SURE THIS IS NOT SSR'D
 */
export const PusherProvider: React.FC<
  React.PropsWithChildren<{ nickname: string; player: string; gameId: string }>
> = ({ nickname, player, gameId, children }) => {
  return (
    <PusherZustandStoreProvider
      createStore={() =>
        reactZustandCreate(createPusherStore(nickname, player, gameId))
      }
    >
      {children}
    </PusherZustandStoreProvider>
  );
};

/**
 * Section 3: "The Hooks"
 *
 * The exported hooks you use to interact with this store (in this case just an event sub)
 */
export function useSubscribeToEvent<MessageType>(
  eventName: string,
  callback: (data: MessageType) => void,
  channelType: "public" | "presence" | "user"
) {
  const channel = usePusherStore((state) => state.channel);
  const userChannel = usePusherStore((state) => state.userChannel);
  const presenceChannel = usePusherStore((state) => state.presenceChannel);

  const stableCallback = React.useRef(callback);

  // Keep callback sync'd
  React.useEffect(() => {
    stableCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const reference = (data: MessageType) => {
      stableCallback.current(data);
    };
    switch (channelType) {
      case "public":
        channel.bind(eventName, reference);
        break;
      case "user":
        userChannel.bind(eventName, reference);
        break;
      case "presence":
        presenceChannel.bind(eventName, reference);

        break;
      default:
        break;
    }

    return () => {
      channel.unbind(eventName, reference);
      userChannel.unbind(eventName, reference);
      presenceChannel.unbind(eventName, reference);
    };
  }, [channel, eventName, presenceChannel]);
}

export const useCurrentMemberCount = () =>
  usePusherStore((s) => Object.keys(s.members).length);

export const usePresence = () => usePusherStore((s) => s.presenceChannel);
