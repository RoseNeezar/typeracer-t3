import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import GameCountdown from "../components/GameCountdown";
import GameDisplayWords from "../components/GameDisplayWords";
import GameIDContainer from "../components/GameIDContainer";
import GameInput from "../components/GameInput";
import GameProgressBar from "../components/GameProgressBar";
import GameScore from "../components/GameScore";
import GameStartBtn from "../components/GameStartBtn";
import { Modal } from "../components/Modal";
import {
  GameState,
  useCurrentPlayer,
  useGame,
  useGameStore,
} from "../store/useGame";
import { PusherProvider, useSubscribeToEvent } from "../utils/pusher";
import { trpc } from "../utils/trpc";
import JoinGame from "../view/JoinGame";

type Props = {};

const GameView: React.FC<{
  gameId: string;
  userId: string;
  nickname: string;
}> = (props) => {
  const data = useGame();

  const cachePlayer = useCurrentPlayer();

  const currentPlayer = useMemo(
    () => data.players.find((s) => s.id === cachePlayer?.id),
    [cachePlayer, data]
  );

  useSubscribeToEvent(
    "update-game",
    (data: { game: GameState }) => {
      useGameStore.setState({
        Game: data.game,
      });
    },
    "public"
  );
  useSubscribeToEvent(
    "client-up-key",
    (data) => console.log("up-key-===", data),
    "presence"
  );
  useSubscribeToEvent(
    "client-down-key",
    (data) => console.log("down-key-===", data),
    "presence"
  );

  useSubscribeToEvent(
    "me",
    (data) => console.log("me-user-meme-===", data),
    "user"
  );

  return (
    <>
      <div className="m-4">
        <div className="mockup-window border bg-base-300 py-8">
          <div className="min-h-16 flex flex-col">
            <div className="relative mb-10 flex items-center justify-center">
              <div className="absolute top-0 left-0 mx-3 flex h-fit w-fit flex-row rounded-lg bg-primary p-3">
                <div className="mr-3 font-bold">Name:</div>
                <div className="font-semibold">
                  {currentPlayer?.nickname ?? "Who ?"}
                </div>
              </div>
              {data.is_open && <GameIDContainer id={data.id} />}
            </div>
            {currentPlayer && (
              <>
                <GameDisplayWords player={currentPlayer!} words={data.words} />
                <GameInput
                  nickname={currentPlayer!.nickname}
                  gameID={data.id}
                  isOpen={data.is_open}
                  isOver={data.is_over}
                />
                <GameCountdown />
                {data.is_open && currentPlayer?.is_party_leader && (
                  <GameStartBtn gameID={data.id} player={currentPlayer!} />
                )}
                {currentPlayer.WPM === -1 && (
                  <GameProgressBar
                    player={currentPlayer!}
                    players={data.players}
                    wordsLength={data.words.length}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="">
        <GameScore players={data?.players} />
      </div>
    </>
  );
};

const GameContainerView: React.FC = (props) => {
  const router = useRouter();
  const [openUserModal, setOpenUserModal] = useState(false);

  const data = useGameStore.getState().Game;

  const cachePlayer = useGameStore.getState().currentPlayer;

  const currentPlayer = useMemo(
    () => data.players.find((s) => s.id === cachePlayer?.id),
    [cachePlayer, data, useGameStore]
  );

  useEffect(() => {
    if (data.id === "" || !currentPlayer) {
      setOpenUserModal(true);
    }
  }, [data, currentPlayer]);

  return (
    <>
      {currentPlayer ? (
        <PusherProvider
          gameId={data.id}
          player={currentPlayer.id}
          nickname={currentPlayer.nickname}
        >
          <GameView
            gameId={data.id}
            nickname={currentPlayer.nickname}
            userId={currentPlayer.id}
          />
        </PusherProvider>
      ) : (
        <Modal open={openUserModal} onClose={() => setOpenUserModal(false)}>
          <JoinGame
            gameID={router.query.id as string}
            closeModal={setOpenUserModal}
          />
        </Modal>
      )}
    </>
  );
};

const LazyGameContainerView = dynamic(
  () => Promise.resolve(GameContainerView),
  {
    ssr: false,
  }
);

const Game = (props: Props) => {
  const router = useRouter();

  const { data: checkGame, isLoading: loadingCheckGame } =
    trpc.typeracer.checkGame.useQuery(
      {
        gameId: router.query.id as string,
      },
      {
        onSuccess: (data) => {
          if (data) {
            useGameStore.setState({
              Game: data,
            });
          }
        },
        enabled: !!router.query.id,
      }
    );

  if (loadingCheckGame) {
    return <div className="loading"></div>;
  }

  if (!checkGame) {
    return router.push("/");
  }

  return <LazyGameContainerView />;
};

export default Game;
