import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const category1Router = createTRPCRouter({
    getAll: protectedProcedure
        .query(({ ctx }) => {
            return ctx.db.category1.findMany();
        }),
    addCategory1: protectedProcedure
        .input(z.object({
            name: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const newConfig = await ctx.db.category1.create({
                data: {
                    name: input.name,
                },
            });
            return newConfig;
        }),
});
