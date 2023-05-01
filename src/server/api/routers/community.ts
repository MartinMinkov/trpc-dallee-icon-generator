import { createTRPCRouter, publicProcedure } from "../trpc";

export const communityRouter = createTRPCRouter({
  getCommunityIcons: publicProcedure.query(async ({ ctx }) => {
    const iconsCount = await ctx.prisma.icon.count();
    const skip = Math.floor(Math.random() * iconsCount);

    const icons = await ctx.prisma.icon.findMany({
      skip,
      take: 25,
      select: {
        id: true,
        url: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return icons;
  }),
});
