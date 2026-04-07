import { requestMapper } from "@/src/handlers/request/request.mapper";
import { requestService } from "@/src/services/request/request.service";
import { CustomContext } from "@/src/shared/api/api-instance";
import { resolveLanguage, t } from "@/src/shared/locale/messages";

class RequestHandler {
  constructor(private readonly service: typeof requestService) {}

  getList = async (ctx: CustomContext) => {
    if (!ctx.user) return;
    const lang = resolveLanguage(ctx.user.lang);
    const response = await this.service.getRequestList({ userId: ctx.user.id });

    if (response.length === 0) {
      await ctx.reply(t(lang, "requestListEmpty"));
      return;
    }

    const items = requestMapper.requestsListToText(response, lang);
    await ctx.reply([t(lang, "requestListTitle"), ...items].join("\n\n"));
  };
}

export const requestHandler = new RequestHandler(requestService);
