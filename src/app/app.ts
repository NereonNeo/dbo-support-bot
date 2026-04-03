import { authHandler } from "../handlers/auth/auth.entry";
import { requestHandler } from "../handlers/requests/request.entry";
import { resolveLanguage, t } from "../shared/locale/messages";
import { botMiddleware } from "./middleware/bot-middleware";

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
bot.callbackQuery(/^reqtype:(appeal|improvement)$/, requestHandler.chooseType);

bot.on("message:text", authHandler.handleInnInput);
bot.on("message", requestHandler.handleRequestContent);
