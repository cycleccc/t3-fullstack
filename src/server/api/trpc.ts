import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import * as cookie from "cookie";
import { db } from "@/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Middleware to validate token from headers
 */
const authMiddleware = t.middleware(async ({ next, ctx }) => {
  // 从 headers 中获取 cookie
  const cookieHeader = ctx.headers.get("cookie");
  const cookies = cookie.parse(cookieHeader ?? "");
  const token = cookies.auth_token; // 替换为你的 cookie 名称

  if (!token) {
    throw new Error("Authorization token is required");
  }

  try {
    // 构建请求 URL，携带 token 和 app 参数
    const verifyUrl = new URL(process.env.VITE_VERIFY_URL!);
    verifyUrl.searchParams.append("token", token);
    verifyUrl.searchParams.append("app", "oss");

    // 发送 GET 请求
    const response = await fetch(verifyUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 检查响应状态
    if (response.status !== 200) {
      throw new Error("Token verification failed");
    }
  } catch (err) {
    console.error("Token verification error:", err);
    throw new Error("Invalid or expired token");
  }

  const result = await next();
  return result;
});
/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure (authenticated)
 *
 * This procedure will check for token and allow only authenticated requests.
 */
export const protectedProcedure = t.procedure
  .use(authMiddleware) // 使用自定义的 token 验证中间件
  .use(timingMiddleware);
