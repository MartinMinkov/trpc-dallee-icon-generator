import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const checkoutRouter = createTRPCRouter({
  checkout: protectedProcedure
    .input(z.object({}))
    .mutation(({ ctx, input }) => {
      return "checkout";
    }),
});
