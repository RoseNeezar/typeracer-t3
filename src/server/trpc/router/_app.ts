import { router } from "../trpc";
import { gameRouter } from "./game";

export const appRouter = router({
  typeracer: gameRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
