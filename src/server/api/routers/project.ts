import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const projectRouter = createTRPCRouter({
    getAll: protectedProcedure
        .query(({ ctx }) => {
            return ctx.db.project.findMany();
        }),
});
