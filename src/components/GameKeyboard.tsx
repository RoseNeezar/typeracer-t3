import React from "react";
import { KeyInput } from "../store/useGame";

type Props = {
  isKeyPressed?: KeyInput[];
};

const GameKeyboard = (props: Props) => {
  return (
    <div className="flex flex-col">
      <div className="my-1 flex justify-center gap-1">
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "q"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          q
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "w"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          w
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "e"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          e
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "r"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          r
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "t"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          t
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "y"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          y
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "u"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          u
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "i"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          i
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "o"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          o
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "p"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          p
        </kbd>
      </div>
      <div className="my-1 flex justify-center gap-1">
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "a"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          a
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "s"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          s
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "d"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          d
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "f"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          f
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "g"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          g
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "h"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          h
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "j"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          j
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "k"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          k
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "l"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          l
        </kbd>
      </div>
      <div className="my-1 flex justify-center gap-1">
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "z"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          z
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "x"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          x
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "c"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          c
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "v"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          v
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "b"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          b
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "n"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          n
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "m"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          m
        </kbd>
        <kbd
          className={`${
            props.isKeyPressed &&
            props.isKeyPressed?.findIndex(
              (x) => x.key.toLocaleLowerCase() === "/"
            ) > -1 &&
            "bg-primary"
          } kbd`}
        >
          /
        </kbd>
      </div>
    </div>
  );
};

export default GameKeyboard;
