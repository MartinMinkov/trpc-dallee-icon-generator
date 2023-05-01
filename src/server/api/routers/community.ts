import { createTRPCRouter, publicProcedure } from "../trpc";

export const communityRouter = createTRPCRouter({
  getCommunityIcons: publicProcedure.query(async ({ ctx }) => {
    const icons = await ctx.prisma.icon.findMany({
      take: 25,
      select: {
        id: true,
        url: true,
      },
    });
    return icons;
  }),
});
