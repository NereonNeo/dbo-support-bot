import { Language } from "@/generated/prisma/client";
import { InlineKeyboard } from "grammy";
import { t } from "@/src/shared/locale/messages";

export const buildRequestTypeKeyboard = (lang: Language): InlineKeyboard => {
  return new InlineKeyboard()
    .text(t(lang, "requestTypeAppeal"), "reqtype:appeal")
    .row()
    .text(t(lang, "requestTypeImprovement"), "reqtype:improvement");
};
