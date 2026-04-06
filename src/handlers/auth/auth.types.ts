import { Language } from "@/generated/prisma/client";

export type ChangeLanguageDTO = {
  lang: Language;
};

export type ChangeInnDTO = {
  inn: string;
};

export type ChangePhoneDTO = {
  phone: string;
};
