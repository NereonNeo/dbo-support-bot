import { authHandler } from "../handlers/auth/auth.entry";
import { botMiddleware } from "./middleware/bot-middleware";

import { botInstance } from "../shared/api/api-instance";
const bot = botInstance.getSnapshot();
bot.use(botMiddleware.attachUser);

bot.command("start", authHandler.welcome);
bot.callbackQuery(/^lang:(ru|en|uz)$/, authHandler.chooseLanguage);
