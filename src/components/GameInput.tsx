import React, { useEffect, useRef, useState } from "react";
import { usePresence } from "../utils/pusher";
import { trpc } from "../utils/trpc";

type Props = {
  playerID: string;
  isOpen: boolean;
  isOver: boolean;
  gameID: string;
  nickname: string;
};

const GameInput = (props: Props) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pusher = usePresence();
  const { mutateAsync } = trpc.typeracer.userInput.useMutation();
  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    let lastChar = value.charAt(value.length - 1);

    if (lastChar === " ") {
      await mutateAsync({
        gameID: props.gameID,
        playerID: props.playerID,
        userInput: input,
      });

      setInput("");
    } else {
      setInput(e.target.value);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code.substring(0, 3) !== "Key") return;
    const key = e.code.charAt(e.code.length - 1).toLocaleLowerCase();

    pusher.trigger("client-down-key", {
      gameID: props.gameID,
      key,
      nickname: props.nickname,
    });
  };

  const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code.substring(0, 3) !== "Key") return;
    const key = e.code.charAt(e.code.length - 1).toLocaleLowerCase();

    pusher.trigger("client-up-key", {
      gameID: props.gameID,
      key,
      nickname: props.nickname,
    });
  };

  useEffect(() => {
    if (!props.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [props.isOpen]);

  return (
    <div className="mt-5 text-center">
      <input
        type="text"
        readOnly={props.isOpen || props.isOver}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onChange={handleInput}
        value={input}
        ref={inputRef}
        placeholder="Type here"
        className="input-bordered input-primary input w-full max-w-xs"
      />
    </div>
  );
};

export default GameInput;
