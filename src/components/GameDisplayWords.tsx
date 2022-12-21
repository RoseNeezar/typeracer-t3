import { FC, useMemo } from "react";
import { IState } from "../store/useGame";

type Props = {
  words: Array<string>;
  player: IState["Game"]["players"][0];
};

const WordTyped: FC<Props> = ({ words, player }) => {
  const currentWords = useMemo(
    () => words.slice(0, player.current_word_index).join(" "),
    [words, player]
  );

  return <span className="font-semibold text-green-600">{currentWords}</span>;
};
const WordLeft: FC<Props> = ({ words, player }) => {
  const wordsToBeTyped = useMemo(
    () => words.slice(player.current_word_index + 1, words.length).join(" "),
    [words, player]
  );

  return <span className="">{wordsToBeTyped}</span>;
};

const CurrentWord: FC<Props> = ({ words, player }) => {
  return (
    <span className="mx-2 font-bold underline">
      {words[player.current_word_index]}
    </span>
  );
};

const GameDisplayWords = (props: Props) => {
  return (
    <div className="my-6 flex justify-center p-5 text-center ">
      <div className="rounded-2xl bg-gray-700 p-4">
        <WordTyped {...props} />
        <CurrentWord {...props} />
        <WordLeft {...props} />
      </div>
    </div>
  );
};

export default GameDisplayWords;
