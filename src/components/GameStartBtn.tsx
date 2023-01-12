import React, { useState } from "react";
import { IState, useGame, useTimerEvent } from "../store/useGame";
import { trpc } from "../utils/trpc";

type Props = {
  player: IState["Game"]["players"][0];
  gameID: string;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const GameStartBtn = (props: Props) => {
  const data = useTimerEvent();
  const { mutateAsync: startGame, isLoading } =
    trpc.typeracer.gameStart.useMutation();
  const time = useGame();

  const handleStart = async () => {
    try {
      let num = time.countdown_time + 1;
      while (num >= 0) {
        await delay(1000);
        await startGame({
          playerID: props.player.id,
          gameID: props.gameID,
        });
        num--;
      }
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
