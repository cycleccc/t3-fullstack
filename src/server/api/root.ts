import { projectRouter } from "@/server/api/routers/project";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { svnBranchRouter } from "./routers/svn-branch";
import { category1Router } from "./routers/category1";
import { textConfigRouter } from "./routers/text-config";
import { textContentRouter } from "./routers/text-content";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    project: projectRouter,
    svnBranch: svnBranchRouter,
    category1: category1Router,
    textConfig: textConfigRouter,
    textContent: textContentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
