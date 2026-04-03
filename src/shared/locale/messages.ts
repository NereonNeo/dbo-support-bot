import { Language, RequestStatus } from "@/generated/prisma/client";

export type LocaleKey =
  | "welcome"
  | "chooseLanguage"
  | "askInn"
  | "innInvalid"
  | "chooseRequestType"
  | "requestTypeAppeal"
  | "requestTypeImprovement"
  | "askRequestContent"
  | "emptyRequest"
  | "duplicateRequest"
  | "somethingWentWrong"
  | "requestCreated";

type LocaleDict = Record<LocaleKey, string>;

const messages: Record<Language, LocaleDict> = {
  [Language.RU]: {
    welcome: "Здравствуйте! Добро пожаловать. Здесь вы можете отправить обращение или предложение по улучшению. Для продолжения выберите язык.",
    chooseLanguage: "Пожалуйста, выберите язык.",
    askInn: "Пожалуйста, отправьте ваш ИНН.",
    innInvalid: "ИНН введен некорректно. Пожалуйста, отправьте корректный ИНН.",
    chooseRequestType: "Выберите тип заявки:",
    requestTypeAppeal: "Обращение",
    requestTypeImprovement: "Предложение",
    askRequestContent: "Отправьте текст заявки, фото, видео или оба варианта вместе.",
    emptyRequest: "Заявка не может быть пустой. Отправьте текст, фото, видео или оба варианта.",
    duplicateRequest: "Похоже, такая заявка уже была отправлена. Если нужно, отправьте новую с изменениями.",
    somethingWentWrong: "Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.",
    requestCreated: "Ваша заявка принята.\nНомер заявки: {requestNumber}\nСтатус: {status}\nСкоро с вами свяжутся.",
  },
  [Language.UZ]: {
    welcome: "Assalomu alaykum! Bu yerda murojaat yoki taklif yuborishingiz mumkin. Davom etish uchun tilni tanlang.",
    chooseLanguage: "Iltimos, tilni tanlang.",
    askInn: "Iltimos, INN raqamingizni yuboring.",
    innInvalid: "INN noto‘g‘ri kiritildi. Iltimos, INNni qayta yuboring.",
    chooseRequestType: "Ariza turini tanlang:",
    requestTypeAppeal: "Murojaat",
    requestTypeImprovement: "Taklif",
    askRequestContent: "Ariza matnini, foto, video yoki ikkalasini birga yuboring.",
    emptyRequest: "Ariza bo‘sh bo‘lishi mumkin emas. Matn, foto, video yoki ikkalasini yuboring.",
    duplicateRequest: "Bu ariza allaqachon yuborilganga o‘xshaydi. Kerak bo‘lsa, o‘zgartirib qayta yuboring.",
    somethingWentWrong: "Arizani yuborishda xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.",
    requestCreated: "Arizangiz qabul qilindi.\nAriza raqami: {requestNumber}\nStatus: {status}\nTez orada siz bilan bog‘lanishadi.",
  },
  [Language.EN]: {
    welcome: "Hello! Here you can submit an appeal or an improvement suggestion. Please choose a language to continue.",
    chooseLanguage: "Please choose a language.",
    askInn: "Please send your INN.",
    innInvalid: "The INN is invalid. Please send a correct INN.",
    chooseRequestType: "Choose request type:",
    requestTypeAppeal: "Appeal",
    requestTypeImprovement: "Improvement",
    askRequestContent: "Send request text, photo, video, or both.",
    emptyRequest: "The request cannot be empty. Send text, photo, video, or both.",
    duplicateRequest: "This request looks already submitted. If needed, send a new one with changes.",
    somethingWentWrong: "An error occurred while sending the request. Please try again later.",
    requestCreated: "Your request has been accepted.\nRequest number: {requestNumber}\nStatus: {status}\nWe will contact you soon.",
  },
};

const FALLBACK_LANGUAGE = Language.RU;

export const resolveLanguage = (lang?: Language | null): Language => {
  if (!lang) return FALLBACK_LANGUAGE;
  return lang;
};

export const t = (lang: Language | null | undefined, key: LocaleKey, vars?: Record<string, string>): string => {
  const resolved = resolveLanguage(lang);
  let text = messages[resolved][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
};

const statusMessages: Record<Language, Record<RequestStatus, string>> = {
  [Language.RU]: {
    [RequestStatus.NEW]: "Новая",
    [RequestStatus.IN_PROGRESS]: "В работе",
    [RequestStatus.RESOLVED]: "Решена",
    [RequestStatus.REJECTED]: "Отклонена",
    [RequestStatus.CLOSED]: "Закрыта",
  },
  [Language.UZ]: {
    [RequestStatus.NEW]: "Yangi",
    [RequestStatus.IN_PROGRESS]: "Jarayonda",
    [RequestStatus.RESOLVED]: "Hal qilindi",
    [RequestStatus.REJECTED]: "Rad etildi",
    [RequestStatus.CLOSED]: "Yopildi",
  },
  [Language.EN]: {
    [RequestStatus.NEW]: "New",
    [RequestStatus.IN_PROGRESS]: "In Progress",
    [RequestStatus.RESOLVED]: "Resolved",
    [RequestStatus.REJECTED]: "Rejected",
    [RequestStatus.CLOSED]: "Closed",
  },
};

export const statusLabel = (lang: Language | null | undefined, status: RequestStatus): string => {
  const resolved = resolveLanguage(lang);
  return statusMessages[resolved][status];
};
