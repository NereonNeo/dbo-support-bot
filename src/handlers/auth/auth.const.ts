import { Language } from "@/generated/prisma/client";
import { t } from "@/src/shared/locale/messages";
import { InlineKeyboard } from "grammy";
import { Keyboard } from "grammy";

export const LanguageKeyboard = new InlineKeyboard().text("Русский", "lang:ru").text("English", "lang:en").row().text("O‘zbekcha", "lang:uz");

export const buildContactKeyboard = (lang: Language): Keyboard => {
  return new Keyboard().requestContact(t(lang, "shareContactButton")).resized().oneTime();
};
