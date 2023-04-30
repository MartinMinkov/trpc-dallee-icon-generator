import { createTRPCRouter } from "~/server/api/trpc";
import { iconRouter } from "~/server/api/routers/icon";
import { checkoutRouter } from "~/server/api/routers/checkout";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  icon: iconRouter,
  checkout: checkoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
