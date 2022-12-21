import React from "react";
import { IState, useTimerEvent } from "../store/useGame";

type Props = {
  player: IState["Game"]["players"][0];
  gameID: string;
};

const GameStartBtn = (props: Props) => {
  const data = useTimerEvent();
  // const { startGame, loadingGame } = useStartGame();
  const handleStart = async () => {
    // await startGame({
    //   playerID: props.player._id,
    //   gameID: props.gameID,
    // });
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
