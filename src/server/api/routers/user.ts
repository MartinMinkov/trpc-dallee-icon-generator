import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        credits: true,
      },
    });
    return user?.credits ?? 0;
  }),

  getUserIcons: protectedProcedure.query(async ({ ctx }) => {
    const icons = await ctx.prisma.icon.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return icons;
  }),
});
