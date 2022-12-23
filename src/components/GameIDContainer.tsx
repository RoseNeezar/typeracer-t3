import React, { FC } from "react";

type Props = {};

const copyUrlToClipboard = (path: string) => () => {
  navigator.clipboard.writeText(`${window.location.origin}${path}`);
};

const GameIDContainer: FC<{ id: string }> = ({ id }) => {
  return (
    <div
      onClick={copyUrlToClipboard(`/${id}`)}
      className="flex w-fit cursor-pointer items-center justify-center rounded-lg border-2 border-gray-800 bg-gray-600 p-3"
    >
      <div className="mr-3">Game ID: </div>
      <button className="rounded-lg bg-gray-700 p-3">{id}</button>
    </div>
  );
};

export default GameIDContainer;
