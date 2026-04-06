import { Language, Prisma } from "@/generated/prisma/client";
import { statusLabel, t } from "@/src/shared/locale/messages";

class RequestMapper {
  requestsListToText(list: Prisma.RequestModel[], lang: Language): string[] {
    return list.map((item) => {
      const title = item.text?.trim() ? `${item.text.trim().slice(0, 30)}${item.text.trim().length > 30 ? "..." : ""}` : t(lang, "requestListNoText");
      return t(lang, "requestListItem", {
        title,
        requestNumber: item.requestNumber,
        status: statusLabel(lang, item.status),
      });
    });
  }
}

export const requestMapper = new RequestMapper();
