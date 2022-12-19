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
  privateChannel: Channel;
  members: Map<string, any>;
}
let store: StoreApi<PusherZustandStore>;
const createPusherStore = (
  nickname: string,
  player: string,
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
      headers: { user_id: player, nickname },
    },
  });
  console.log("---", player);
  const channel = pusherClient.subscribe(`game-${gameId}`);
  const privateChannel = pusherClient.subscribe(`current-user-${player}`);

  const presenceChannel = pusherClient.subscribe(
    `presence-${gameId}`
  ) as PresenceChannel;

  (window as any).presenceChannel = presenceChannel;

  const newStore = vanillaCreate<PusherZustandStore>((set) => {
    return {
      pusherClient: pusherClient,
      channel: channel,
      presenceChannel,
      privateChannel,
      members: new Map(),
    };
  });

  const updateMembers = () => {
    newStore.setState(() => ({
      members: presenceChannel.members.members,
    }));

    console.log("members???", presenceChannel.members.members);
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
  isPrivate?: boolean
) {
  const channel = usePusherStore((state) => state.channel);
  const privateChannel = usePusherStore((state) => state.privateChannel);

  const stableCallback = React.useRef(callback);

  // Keep callback sync'd
  React.useEffect(() => {
    stableCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const reference = (data: MessageType) => {
      stableCallback.current(data);
    };

    if (isPrivate) {
      privateChannel.bind(eventName, reference);
    } else {
      channel.bind(eventName, reference);
    }

    return () => {
      channel.unbind(eventName, reference);
      privateChannel.unbind(eventName, reference);
    };
  }, [channel, eventName]);
}

export const useCurrentMemberCount = () =>
  usePusherStore((s) => Object.keys(s.members).length);
