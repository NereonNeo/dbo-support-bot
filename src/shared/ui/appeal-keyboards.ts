import { Language } from "@/generated/prisma/client";
import { Keyboard } from "grammy";
import { AppealDomain } from "../config/appeal-domains";

const buildKeyboardFromOptions = (labels: string[]): Keyboard => {
  const keyboard = new Keyboard();

  for (const label of labels) {
    keyboard.text(label).row();
  }

  return keyboard.resized().oneTime();
};

export const buildAppealDomainKeyboard = (lang: Language, domains: AppealDomain[]): Keyboard => {
  return buildKeyboardFromOptions(domains.map((domain) => domain.label[lang]));
};

export const buildAppealSubdomainKeyboard = (lang: Language, domain: AppealDomain): Keyboard => {
  return buildKeyboardFromOptions(domain.subdomains.map((subdomain) => subdomain.label[lang]));
};
