import React, { FC, useCallback } from "react";
import GameKeyboard from "./GameKeyboard";
import { IState, useKeyEvent } from "../store/useGame";

type Props = {
  player: IState["Game"]["players"][0];
  players: IState["Game"]["players"];
  wordsLength: number;
};

const ProgressBar: FC<{ percentage: number }> = ({ percentage }) => {
  return (
    <div
      className="radial-progress border-4 border-primary bg-primary text-primary-content"
      // @ts-ignore
      style={{ "--value": percentage }}
    >
      {percentage}%
    </div>
  );
};

const GameProgressBar = (props: Props) => {
  const data = useKeyEvent();

  const calculatePercentage = useCallback(
    (player: Props["player"], wordsLength: Props["wordsLength"]) => {
      if (player.current_word_index !== 0) {
        return parseFloat(
          ((player.current_word_index / wordsLength) * 100).toFixed(2)
        );
      }
      return 0;
    },
    []
  );

  const isKeyPressed = useCallback(
    (player: string, KeyEvents: IState["KeyEvents"]) => {
      return KeyEvents.filter((x) => x.nickname === player);
    },
    []
  );

  return (
    <div className="flex w-full flex-col py-10">
      {props.players.map((p) => {
        const percentage = calculatePercentage(p, props.wordsLength);
        return (
          p.id !== props.player.id && (
            <div key={p.id}>
              <div className="divider"></div>
              <div className="card rounded-box grid h-32 place-items-center bg-base-300">
                <div className="flex w-full items-center justify-between px-4">
                  <div className="w-24 font-bold">{p.nickname}</div>
                  <GameKeyboard isKeyPressed={isKeyPressed(p.nickname, data)} />
                  <ProgressBar percentage={percentage} />
                </div>
              </div>
            </div>
          )
        );
      })}
    </div>
  );
};

export default GameProgressBar;
