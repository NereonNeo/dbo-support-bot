import { Language } from "@/generated/prisma/client";
import { Keyboard } from "grammy";
import { t } from "../locale/messages";

export const requestTypeOptions = (lang: Language) => {
  return {
    appeal: t(lang, "requestTypeAppeal"),
    improvement: t(lang, "requestTypeImprovement"),
    requestList: t(lang, "requestList"),
  };
};

export const buildRequestTypeKeyboard = (lang: Language): Keyboard => {
  const options = requestTypeOptions(lang);
  return new Keyboard().text(options.appeal).row().text(options.improvement).row().text(options.requestList).row();
};
