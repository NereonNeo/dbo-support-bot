import { Language, RequestType, UserState } from "@/generated/prisma/client";
import { appealHandler } from "@/src/handlers/appeal/appeal.entry";
import { authService } from "@/src/services/auth/auth.service";
import { CustomContext } from "@/src/shared/api/api-instance";
import { t } from "@/src/shared/locale/messages";
import { buildRequestTypeKeyboard } from "@/src/shared/ui/request-type-keyboard";
import { CallbackQueryContext, CommandContext } from "grammy";
import { buildContactKeyboard, LanguageKeyboard } from "./auth.const";

class AuthHandler {
  constructor(private readonly service: typeof authService) {}

  welcome = async (ctx: CommandContext<CustomContext>) => {
    if (!ctx.from) return;
    const user = await this.service.getOneUnique(String(ctx.from.id));
    if (!user || user.state === UserState.WAIT_LANGUAGE || !user.lang) {
      await ctx.replyWithPhoto("https://grammy.dev/images/grammY.png", { reply_markup: LanguageKeyboard, caption: t(Language.RU, "welcome") });
      return;
    }

    if (!user.phone || user.state === UserState.WAIT_CONTACT) {
      await ctx.reply(t(user.lang, "askContact"), { reply_markup: buildContactKeyboard(user.lang) });
      return;
    }

    if (!user.inn || user.state === UserState.WAIT_INN) {
      await ctx.reply(t(user.lang, "askInn"));
      return;
    }

    if (user.state === UserState.WAIT_APPEAL_DOMAIN) {
      await appealHandler.promptDomainSelection(ctx);
      return;
    }

    if (user.state === UserState.WAIT_APPEAL_SUBDOMAIN) {
      await appealHandler.promptSubdomainSelection(ctx);
      return;
    }

    if (user.state === UserState.WAIT_REQUEST_CONTENT) {
      if (user.pendingRequestType === RequestType.APPEAL && !user.pendingAppealDomain) {
        await appealHandler.promptDomainSelection(ctx);
        return;
      }

      await ctx.reply(t(user.lang, "askRequestContent"), { reply_markup: { remove_keyboard: true } });
      return;
    }

    const lang = user.lang ?? Language.RU;
    await ctx.reply(t(lang, "chooseRequestType"), { reply_markup: buildRequestTypeKeyboard(lang) });
  };

  chooseLanguage = async (ctx: CallbackQueryContext<CustomContext>) => {
    if (!ctx.user) return;
    const langRaw = ctx.match[1];
    const lang = langRaw === "ru" ? Language.RU : langRaw === "uz" ? Language.UZ : Language.EN;

    await ctx.answerCallbackQuery();
    await ctx.reply(t(lang, "askContact"), { reply_markup: buildContactKeyboard(lang) });
    await this.service.changeLanguage(ctx.user.telegramId, { lang });
  };

  handleContactInput = async (ctx: CustomContext) => {
    if (!ctx.user || !ctx.message) return;

    if (ctx.user.state !== UserState.WAIT_CONTACT) return;

    const lang = ctx.user.lang ?? Language.RU;
    if (!("contact" in ctx.message) || !ctx.message.contact?.phone_number) {
      await ctx.reply(t(lang, "contactInvalid"), { reply_markup: buildContactKeyboard(lang) });
      return;
    }

    if (ctx.message.contact.user_id && ctx.from && ctx.message.contact.user_id !== ctx.from.id) {
      await ctx.reply(t(lang, "contactInvalid"), { reply_markup: buildContactKeyboard(lang) });
      return;
    }

    const rawPhone = ctx.message.contact.phone_number;
    const normalizedPhone = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;
    const isValid = /^\+\d{7,15}$/.test(normalizedPhone);
    if (!isValid) {
      await ctx.reply(t(lang, "contactInvalid"), { reply_markup: buildContactKeyboard(lang) });
      return;
    }

    await this.service.changePhone(ctx.user.telegramId, { phone: normalizedPhone });
    await ctx.reply(t(lang, "askInn"), { reply_markup: { remove_keyboard: true } });
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

    await this.service.changeInn(ctx.user.telegramId, { inn });
    const lang = ctx.user.lang ?? Language.RU;
    await ctx.reply(t(lang, "chooseRequestType"), { reply_markup: buildRequestTypeKeyboard(lang) });
  };
}

export const authHandler = new AuthHandler(authService);
