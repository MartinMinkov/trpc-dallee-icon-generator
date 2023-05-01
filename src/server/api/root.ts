import { createTRPCRouter } from "~/server/api/trpc";
import { iconRouter } from "~/server/api/routers/icon";
import { checkoutRouter } from "~/server/api/routers/checkout";
import { communityRouter } from "./routers/community";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  icon: iconRouter,
  checkout: checkoutRouter,
  community: communityRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
