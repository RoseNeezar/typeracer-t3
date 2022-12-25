import React from "react";
import { IState, useTimerEvent } from "../store/useGame";
import { trpc } from "../utils/trpc";

type Props = {
  player: IState["Game"]["players"][0];
  gameID: string;
};

const GameStartBtn = (props: Props) => {
  const data = useTimerEvent();
  const { mutateAsync: startGame, isLoading } =
    trpc.typeracer.gameStart.useMutation();

  const handleStart = async () => {
    try {
      await startGame({
        playerID: props.player.id,
        gameID: props.gameID,
      });
    } catch (error) {}
  };

  return Object.keys(data).length === 0 ? (
    <button
      className={`btn-primary btn m-auto mt-10 w-fit `}
      onClick={() => handleStart()}
    >
      Start Game
    </button>
  ) : null;
};

export default GameStartBtn;
