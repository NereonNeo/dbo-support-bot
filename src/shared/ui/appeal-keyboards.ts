import { Language } from "@/generated/prisma/client";
import { Keyboard } from "grammy";
import { t } from "../locale/messages";
import { AppealDomain } from "../config/appeal-domains";

const buildKeyboardFromOptions = (labels: string[], extraRowButtons: string[] = []): Keyboard => {
  const keyboard = new Keyboard();

  for (const label of labels) {
    keyboard.text(label).row();
  }

  if (extraRowButtons.length > 0) {
    for (const label of extraRowButtons) {
      keyboard.text(label);
    }
    keyboard.row();
  }

  return keyboard.resized().oneTime();
};

export const buildAppealDomainKeyboard = (lang: Language, domains: AppealDomain[]): Keyboard => {
  return buildKeyboardFromOptions(domains.map((domain) => domain.label[lang]), [t(lang, "back"), t(lang, "mainMenu")]);
};

export const buildAppealSubdomainKeyboard = (lang: Language, domain: AppealDomain): Keyboard => {
  return buildKeyboardFromOptions(domain.subdomains.map((subdomain) => subdomain.label[lang]), [
    t(lang, "back"),
    t(lang, "mainMenu"),
  ]);
};
