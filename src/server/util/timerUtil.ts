import { Player, Prisma, PrismaClient } from "@prisma/client";
import Game from "../../pages/[id]";
import * as trpc from "@trpc/server";
import { pusherServerClient } from "../common/pusher";

export const calculateWPM = (
  endTime: number,
  startTime: number,
  player: Player
) => {
  const numOfWords = player.current_word_index;
  const timeInSeconds = (endTime - startTime) / 1000;
  const timeInMinutes = timeInSeconds / 60;
  const WPM = Math.floor(numOfWords / timeInMinutes);
  return WPM;
};

export const calculateTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const TimerID = (() => {
  let timerID: unknown = "";
  const setTimerID = (data: NodeJS.Timeout) => {
    timerID = data;
  };
  const getTimerID = () => {
    return timerID;
  };
  return {
    getTimerID,
    setTimerID,
  };
})();

export const startGameClock = async (
  gameID: string,
  prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
  >
) => {
  let game = await prisma.game.findFirst({
    where: {
      id: gameID,
    },
  });

  if (!game) {
    throw new trpc.TRPCError({
      code: "NOT_FOUND",
      message: "Game not found",
    });
  }

  game = await prisma.game.update({
    where: {
      id: gameID,
    },
    data: {
      start_time: new Date().getTime(),
    },
  });

  let time = 120;

  const startTimer = async () => {
    if (time >= 0 && !game?.is_over) {
      const formatTime = calculateTime(time);
      await pusherServerClient.trigger(`game-${gameID}`, "timer-start", {
        countDown: formatTime,
        msg: "Time Remaining",
      });

      time--;
    } else {
      // get time stamp of when the game ended
      const endTime = new Date().getTime();
      // find the game
      let game = await prisma.game.findFirst({
        where: {
          id: gameID,
        },
        include: {
          players: true,
        },
      });

      if (!game) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }
      // get the game start time
      const { start_time } = game!;

      // calculate all players WPM who haven't finished typing out sentence
      game.players.forEach((player, index) => {
        if (player.WPM === -1)
          game!.players![index]!.WPM = calculateWPM(
            endTime,
            start_time,
            player
          );
      });

      // save the game
      for (const i of game.players) {
        await prisma.player.updateMany({
          where: {
            WPM: -1,
            id: i.id,
          },
          data: {
            WPM: i.WPM,
          },
        });
      }

      game = await prisma.game.update({
        where: {
          id: gameID,
        },
        data: {
          is_over: true,
        },
        include: {
          players: true,
        },
      });
      // send updated game to all sockets within game
      await pusherServerClient.trigger(`game-${gameID}`, "update-game", {
        game,
      });

      clearInterval(timerID);
    }
  };
  startTimer();
  const timerID = setInterval(() => startTimer(), 1000);
  TimerID.setTimerID(timerID);
};
