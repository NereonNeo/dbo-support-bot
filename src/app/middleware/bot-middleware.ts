import { UserState } from "@/generated/prisma/client";
import { authService } from "@/src/services/auth/auth.service";
import { CustomContext } from "@/src/shared/api/api-instance";
import { MiddlewareFn } from "grammy";

class BotMiddleware {
  constructor(private readonly service: typeof authService) {}

  attachUser: MiddlewareFn<CustomContext> = async (ctx, next) => {
    if (!ctx.from) return;

    const telegramId = ctx.from.id;

    const user = await this.service.getOneUnique(telegramId);

    if (!user)
      ctx.user = await this.service.create({
        name: ctx.from?.username,
        telegramId: telegramId,
        state: UserState.WAIT_LANGUAGE,
      });
    if (user) ctx.user = user;

    await next();
  };
}

export const botMiddleware = new BotMiddleware(authService);
