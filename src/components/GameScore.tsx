import React, { useMemo } from "react";
import { useRouter } from "next/router";
import { IState } from "../store/useGame";

type Props = {
  players: IState["Game"]["players"];
};

const GameScore = (props: Props) => {
  const navigate = useRouter();
  const scoreBoard = useMemo(() => {
    const scoreBoard = props.players.filter((player) => player.WPM !== -1);
    return scoreBoard.sort((a, b) =>
      a.WPM > b.WPM ? -1 : b.WPM > a.WPM ? 1 : 0
    );
  }, [props.players]);

  if (scoreBoard.length === 0) return null;
  return (
    <div className="flex flex-col justify-center">
      <div className="m-5 overflow-x-auto rounded-lg border-2 border-primary p-1">
        <table className="table w-full">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>WPM</th>
            </tr>
          </thead>
          <tbody>
            {scoreBoard.map((player, index) => {
              return (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{player.nickname}</td>
                  <td>{player.WPM}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => navigate.push("/")}
        className="btn-secondary btn m-auto"
      >
        Back
      </button>
    </div>
  );
};

export default GameScore;
