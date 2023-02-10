import { authRouter } from "./router/auth";
import { chefRouter } from "./router/chef";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  chef: chefRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
