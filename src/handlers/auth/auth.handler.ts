import { CustomContext } from "@/src/shared/api/api-instance";
import { CallbackQueryContext, CommandContext, Context } from "grammy";
import { LanguageKeyboard } from "./auth.const";
import { authService } from "./auth.service";

class AuthHandler {
  constructor(private readonly service: typeof authService) {}

  welcome = async (ctx: CommandContext<Context>) => {
    const isExist = await this.service.isExist(ctx.from!.id);
    if (isExist) return ctx.reply("Welcome Again");

    await ctx.reply("Welcome!!", { reply_markup: LanguageKeyboard });
  };

  chooseLanguage = async (ctx: CallbackQueryContext<CustomContext>) => {
    if (!ctx.user) return;
    const lang = ctx.match[1];

    this.service.changeLanguage(ctx.user.chatId, { lang });
    await ctx.answerCallbackQuery(`Язык сохранён: ${lang}`);
  };
}

export const authHandler = new AuthHandler(authService);
