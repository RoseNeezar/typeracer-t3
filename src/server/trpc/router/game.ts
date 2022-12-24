import { Game, Player } from "@prisma/client";
import * as trpc from "@trpc/server";
import { z } from "zod";
import { getQuotesData } from "../../../utils/getQuotes";
import { pusherServerClient } from "../../common/pusher";
import { publicProcedure, router } from "../trpc";
import { TimerID, calculateWPM, startGameClock } from "../../util/timerUtil";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const gameRouter = router({
  createGame: publicProcedure
    .input(z.object({ nickname: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const quotableData = await getQuotesData();

      let game = await ctx.prisma.game.create({
        data: {
          start_time: 0,
          words: quotableData,
        },
        include: {
          players: true,
        },
      });

      let player = await ctx.prisma.player.findFirst({
        where: {
          nickname: input.nickname,
        },
      });

      if (!player) {
        player = await ctx.prisma.player.create({
          data: {
            is_party_leader: true,
            nickname: input.nickname,
            game_id: game.id,
          },
        });
      } else {
        player = await ctx.prisma.player.update({
          where: {
            id: player.id,
          },
          data: {
            game: {
              connect: {
                id: game.id,
              },
            },
          },
        });
      }

      game = (await ctx.prisma.game.findFirst({
        where: {
          id: game.id,
        },
        include: {
          players: true,
        },
      })) as Game & { players: Player[] };

      return {
        game: game as Game & { players: Player[] },
        currentPlayer: player,
      };
    }),
  checkGame: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input, ctx }) => {
      const check = await ctx.prisma.game.findFirst({
        where: {
          id: input.gameId,
        },
        include: {
          players: true,
        },
      });

      return check;
    }),
  joinGame: publicProcedure
    .input(z.object({ nickname: z.string(), gameID: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let game = (await ctx.prisma.game.findFirst({
        where: {
          id: input.gameID,
        },
        include: {
          players: true,
        },
      })) as Game & {
        players: Player[];
      };

      if (!game) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      let player = await ctx.prisma.player.findFirst({
        where: {
          nickname: input.nickname,
        },
      });

      if (player) {
        player = await ctx.prisma.player.update({
          where: {
            nickname: input.nickname,
          },
          data: {
            game_id: game.id,
          },
        });
      } else {
        player = await ctx.prisma.player.create({
          data: {
            is_party_leader: false,
            nickname: input.nickname,
            game_id: game.id,
          },
        });
      }

      game.players.push(player);

      await pusherServerClient.trigger(`game-${input.gameID}`, "update-game", {
        game,
      });

      return {
        game,
        currentPlayer: player,
      };
    }),
  userInput: publicProcedure
    .input(
      z.object({
        userInput: z.string(),
        playerID: z.string(),
        gameID: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let game = await ctx.prisma.game.findFirst({
        where: {
          id: input.gameID,
        },
        include: {
          players: true,
        },
      });

      if ((game?.is_open && game?.is_over) || !game) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      let player = game?.players.find((x) => x.id === input.playerID);

      if (!player) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Player not found",
        });
      }

      let word = game?.words[player!.current_word_index];

      if (word === input.userInput) {
        player.current_word_index++;

        if (player.current_word_index !== game?.words.length) {
          await ctx.prisma.player.update({
            where: {
              id: input.playerID,
            },
            data: {
              current_word_index: player.current_word_index,
            },
          });

          await pusherServerClient.trigger(
            `game-${input.gameID}`,
            "update-game",
            {
              game,
            }
          );
        } else {
          let endTime = new Date().getTime();
          let { start_time } = game;

          player.WPM = calculateWPM(endTime, start_time, player);

          await ctx.prisma.player.update({
            where: {
              id: input.playerID,
            },
            data: {
              WPM: player.WPM,
            },
          });

          const gameStatus = game.players
            .map((x) => x.WPM)
            .filter((x) => x === -1);

          if (gameStatus.length === 0) {
            console.log("here:========2");
            clearInterval(TimerID.getTimerID() as NodeJS.Timeout);

            game = await ctx.prisma.game.update({
              where: {
                id: input.gameID,
              },
              data: {
                is_over: true,
              },
              include: {
                players: true,
              },
            });
          }
          console.log("here:========3", input.playerID);

          await pusherServerClient.sendToUser(input.playerID, "game-end", {
            endStatus: true,
          });
          await sleep(1000);
          await pusherServerClient.trigger(
            `game-${input.gameID}`,
            "update-game",
            {
              game,
            }
          );
        }
      }
    }),
  gameStart: publicProcedure
    .input(
      z.object({
        gameID: z.string(),
        playerID: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let countDown = 5;

      let game = await ctx.prisma.game.findFirst({
        where: {
          id: input.gameID,
        },
      });

      if (!game) {
        throw new trpc.TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      let player = await ctx.prisma.player.findFirst({
        where: {
          id: input.playerID,
        },
      });

      if (player && player.is_party_leader && !game.is_over) {
        let timerID = setInterval(async () => {
          if (countDown >= 0) {
            // emit countDown to all players within game
            await pusherServerClient.trigger(
              `game-${input.gameID}`,
              "timer-start",
              {
                countDown,
                msg: "Starting Game",
              }
            );

            countDown--;
          }
          // start time clock over, now time to start game
          else {
            ctx.prisma;
            game = await ctx.prisma.game.update({
              where: {
                id: input.gameID,
              },
              data: {
                is_open: false,
              },
            });
            // send updated game to all sockets within game
            await pusherServerClient.trigger(
              `game-${input.gameID}`,
              "update-game",
              {
                game,
              }
            );

            // start game clock
            startGameClock(game.id, ctx.prisma);
            clearInterval(timerID);
          }
        }, 1000);
      }
    }),
  updateGame: publicProcedure
    .input(
      z.object({
        gameID: z.string(),
        nickname: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await pusherServerClient.sendToUser(input.nickname, "me", {
        hello: "sendToUser--meee",
      });

      let countDown = 6;
      let timerID = setInterval(async () => {
        if (countDown >= 0) {
          await pusherServerClient.trigger(
            `game-${input.gameID}`,
            "update-game",
            {
              hello: countDown,
            }
          );
          countDown--;
        }
        // start time clock over, now time to start game
        else {
          // close game so no one else can join
          await pusherServerClient.trigger(
            `game-${input.gameID}`,
            "update-game",
            {
              hello: "Done",
            }
          );
          clearInterval(timerID);
        }
      }, 1000);
    }),
});
