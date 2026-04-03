import { Language, UserState } from "@/generated/prisma/client";
import { CustomContext } from "@/src/shared/api/api-instance";
import { t } from "@/src/shared/locale/messages";
import { CallbackQueryContext, CommandContext } from "grammy";
import { requestHandler } from "../requests/request.entry";
import { LanguageKeyboard } from "./auth.const";
import { authService } from "./auth.service";

class AuthHandler {
  constructor(private readonly service: typeof authService) {}

  welcome = async (ctx: CommandContext<CustomContext>) => {
    if (!ctx.from) return;
    const user = await this.service.getOneUnique(ctx.from.id);
    if (!user || user.state === UserState.WAIT_LANGUAGE || !user.lang) {
      await ctx.reply(t(Language.RU, "welcome"), { reply_markup: LanguageKeyboard });
      return;
    }

    if (!user.inn || user.state === UserState.WAIT_INN) {
      await ctx.reply(t(user.lang, "askInn"));
      return;
    }

    if (user.state === UserState.WAIT_REQUEST_CONTENT) {
      await ctx.reply(t(user.lang, "askRequestContent"));
      return;
    }

    await requestHandler.askRequestType(ctx, user.lang ?? Language.RU);
  };

  chooseLanguage = async (ctx: CallbackQueryContext<CustomContext>) => {
    if (!ctx.user) return;
    const langRaw = ctx.match[1];
    const lang = langRaw === "ru" ? Language.RU : langRaw === "uz" ? Language.UZ : Language.EN;

    await this.service.changeLanguage(ctx.user.chatId, { lang });
    await ctx.answerCallbackQuery();
    await ctx.reply(t(lang, "askInn"));
  };

  handleInnInput = async (ctx: CustomContext) => {
    if (!ctx.user || !ctx.message || !("text" in ctx.message)) return;
    if (ctx.user.state !== UserState.WAIT_INN) return;

    const inn = (ctx.message.text ?? "").trim();
    const isValid = /^[0-9]{9}$/.test(inn);
    if (!isValid) {
      await ctx.reply(t(ctx.user.lang ?? Language.RU, "innInvalid"));
      return;
    }

    await this.service.changeInn(ctx.user.chatId, { inn });
    await requestHandler.askRequestType(ctx, ctx.user.lang ?? Language.RU);
  };
}

export const authHandler = new AuthHandler(authService);
