import { RequestType, UserState } from "@/generated/prisma/client";
import { appealHandler } from "../handlers/appeal/appeal.entry";
import { authHandler } from "../handlers/auth/auth.entry";
import { improvementHandler } from "../handlers/improvement/improvement.entry";
import { resolveLanguage, t } from "../shared/locale/messages";
import { requestTypeOptions } from "../shared/ui/request-type-keyboard";
import { botMiddleware } from "./middleware/bot-middleware";

import { requestHandler } from "@/src/handlers/request/request.entry";
import { botInstance } from "../shared/api/api-instance";

const bot = botInstance.getSnapshot();
bot.catch(async (error) => {
  console.error("Bot error", error.error);

  const lang = resolveLanguage(error.ctx.user?.lang);
  try {
    await error.ctx.reply(t(lang, "somethingWentWrong"));
  } catch (replyError) {
    console.error("Bot reply error", replyError);
  }
});

bot.use(botMiddleware.attachUser);

bot.command("start", authHandler.welcome);
bot.callbackQuery(/^lang:(ru|en|uz)$/, authHandler.chooseLanguage);

bot.on("message", async (ctx) => {
  if (!ctx.user) return;

  if (ctx.user.state === UserState.WAIT_CONTACT) {
    await authHandler.handleContactInput(ctx);
    return;
  }

  if (ctx.user.state === UserState.WAIT_INN && "text" in ctx.message) {
    await authHandler.handleInnInput(ctx);
    return;
  }

  if (ctx.user.state === UserState.WAIT_APPEAL_DOMAIN) {
    await appealHandler.handleDomainSelection(ctx);
    return;
  }

  if (ctx.user.state === UserState.WAIT_APPEAL_SUBDOMAIN) {
    await appealHandler.handleSubdomainSelection(ctx);
    return;
  }

  if (ctx.user.state === UserState.READY_FOR_REQUEST_TYPE && "text" in ctx.message) {
    const lang = resolveLanguage(ctx.user.lang);
    const options = requestTypeOptions(lang);
    const value = (ctx.message.text ?? "").trim();

    if (value === options.appeal) {
      await appealHandler.start(ctx);
      return;
    }

    if (value === options.requestList) {
      await requestHandler.getList(ctx);
    }

    if (value === options.improvement) {
      await improvementHandler.start(ctx);
      return;
    }
  }

  if (ctx.user.state !== UserState.WAIT_REQUEST_CONTENT) return;

  if (ctx.user.pendingRequestType === RequestType.APPEAL) {
    await appealHandler.handleContent(ctx);
    return;
  }

  if (ctx.user.pendingRequestType === RequestType.IMPROVEMENT) {
    await improvementHandler.handleContent(ctx);
  }
});
