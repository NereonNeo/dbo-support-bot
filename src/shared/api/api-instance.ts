import { User } from "@/generated/prisma/client";
import { Bot as GrammyBot, Context } from "grammy";

export type CustomContext = Context & {
  user?: User;
};

class CoreBot {
  readonly bot: GrammyBot<CustomContext>;
  private readonly pollingEnabled: boolean;

  constructor(botId: string) {
    this.bot = new GrammyBot<CustomContext>(botId);
    this.pollingEnabled = (process.env.BOT_POLLING ?? "true").toLowerCase() === "true";
  }

  bootstrap() {
    if (!this.pollingEnabled) {
      console.log("Telegram polling disabled (BOT_POLLING=false)");
      return;
    }

    this.bot.start().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes("409") || message.includes("terminated by other getUpdates request")) {
        console.error("Telegram polling conflict (409): another bot instance is already running with this token.");
        return;
      }

      console.error("Telegram bot failed to start:", error);
    });
  }

  getSnapshot(): GrammyBot<CustomContext> {
    return this.bot;
  }
}

export const botInstance = new CoreBot(process.env.BOT_ID || "");
