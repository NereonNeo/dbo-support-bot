import { User } from "@/generated/prisma/client";
import { Bot as GrammyBot, Context } from "grammy";

export type CustomContext = Context & {
  user?: User;
};

class CoreBot {
  readonly bot: GrammyBot<CustomContext>;

  constructor(botId: string) {
    this.bot = new GrammyBot<CustomContext>(botId);
  }

  bootstrap() {
    this.bot.start();
  }

  getSnapshot(): GrammyBot<CustomContext> {
    return this.bot;
  }
}

export const botInstance = new CoreBot(process.env.BOT_ID || "");
