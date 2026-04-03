import { UserModel } from "@/generated/prisma/models";
import { Context, Bot as GrammyBot } from "grammy";

export type CustomContext = Context & {
  user?: UserModel;
};

class CoreBot {
  readonly bot: GrammyBot;

  constructor(botId: string) {
    this.bot = new GrammyBot<CustomContext>(botId);
  }

  bootstrap() {
    this.bot.start();
  }

  getSnapshot(): GrammyBot {
    return this.bot;
  }
}

export const botInstance = new CoreBot(process.env.BOT_ID || "");
