import { Game, Player } from "@prisma/client";
import * as trpc from "@trpc/server";
import { z } from "zod";
import { getQuotesData } from "../../../utils/getQuotes";
import { pusherServerClient } from "../../common/pusher";
import { publicProcedure, router } from "../trpc";

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
