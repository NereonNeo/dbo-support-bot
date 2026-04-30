import { Language, RequestStatus } from "@/generated/prisma/client";

export type LocaleKey =
  | "welcome"
  | "chooseLanguage"
  | "askContact"
  | "shareContactButton"
  | "contactInvalid"
  | "askInn"
  | "innInvalid"
  | "back"
  | "mainMenu"
  | "chooseRequestType"
  | "requestTypeAppeal"
  | "requestTypeImprovement"
  | "askAppealDomain"
  | "appealDomainInvalid"
  | "askAppealSubdomain"
  | "appealSubdomainInvalid"
  | "askRequestContent"
  | "emptyRequest"
  | "somethingWentWrong"
  | "requestCreated"
  | "requestStatusChanged"
  | "requestList"
  | "requestListTitle"
  | "requestListEmpty"
  | "requestListItem"
  | "requestListNoText";

type LocaleDict = Record<LocaleKey, string>;

const messages: Record<Language, LocaleDict> = {
  [Language.RU]: {
    welcome:
      "Здравствуйте! Добро пожаловать в бот поддержки AgroZamin Business.\nЗдесь вы можете отправить жалобу или предложение по улучшению.\nДля продолжения выберите язык.",
    chooseLanguage: "Пожалуйста, выберите язык.",
    askContact: "Пожалуйста, отправьте ваш номер телефона кнопкой ниже.",
    shareContactButton: "Отправить контакт",
    contactInvalid: "Не удалось получить корректный номер телефона. Пожалуйста, отправьте контакт кнопкой ниже.",
    askInn: "Пожалуйста, отправьте ваш ИНН или ПИНФЛ.",
    innInvalid: "ИНН/ПИНФЛ введен некорректно. Отправьте 9 цифр (ИНН) или 14 цифр (ПИНФЛ).",
    back: "Назад",
    mainMenu: "Основное меню",
    chooseRequestType: "Выберите тип заявки:",
    requestTypeAppeal: "Проблема",
    requestTypeImprovement: "Предложение",
    askAppealDomain: "Выберите категорию проблемы:",
    appealDomainInvalid: "Выберите категорию проблемы кнопкой ниже.",
    askAppealSubdomain: "Выберите суть проблемы:",
    appealSubdomainInvalid: "Выберите суть проблемы кнопкой ниже.",
    askRequestContent: "Отправьте текст заявки, фото, видео или оба варианта вместе.",
    emptyRequest: "Заявка не может быть пустой. Отправьте текст, фото, видео или оба варианта.",
    somethingWentWrong: "Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.",
    requestCreated: "Ваша заявка принята.\nНомер заявки: {requestNumber}\nСтатус: {status}\nСкоро с вами свяжутся.",
    requestStatusChanged:
      "Статус вашей заявки под номером: <b>{requestNumber}</b>\nизменен на <b>{status}</b>, пожалуйста проверьте всё\nЕсли будут вопросы — обращайтесь сюда:\n@growth_ish",
    requestList: "Список заявок",
    requestListTitle: "Ваши заявки:",
    requestListEmpty: "У вас пока нет заявок.",
    requestListItem: "Тема: {title}\nНомер: {requestNumber}\nСтатус: {status}",
    requestListNoText: "Без текста",
  },
  [Language.UZ]: {
    welcome:
      "Assalomu alaykum! AgroZamin qo‘llab-quvvatlash botiga xush kelibsiz.\nBu yerda shikoyat yoki taklif yuborishingiz mumkin.\nDavom etish uchun tilni tanlang.",
    chooseLanguage: "Iltimos, tilni tanlang.",
    askContact: "Iltimos, quyidagi tugma orqali telefon raqamingizni yuboring.",
    shareContactButton: "Kontaktni yuborish",
    contactInvalid: "Telefon raqami noto‘g‘ri. Iltimos, kontaktni quyidagi tugma orqali yuboring.",
    askInn: "Iltimos, INN yoki PINFL raqamingizni yuboring.",
    innInvalid: "INN/PINFL noto‘g‘ri kiritildi. Iltimos, 9 ta raqam (INN) yoki 14 ta raqam (PINFL) yuboring.",
    back: "Orqaga",
    mainMenu: "Asosiy menyu",
    chooseRequestType: "Ariza turini tanlang:",
    requestTypeAppeal: "Muommo",
    requestTypeImprovement: "Taklif",
    askAppealDomain: "Muammo toifasini tanlang:",
    appealDomainInvalid: "Quyidagi tugma orqali muammo toifasini tanlang.",
    askAppealSubdomain: "Muammo turini tanlang:",
    appealSubdomainInvalid: "Quyidagi tugma orqali muammo turini tanlang.",
    askRequestContent: "Ariza matnini, foto, video yoki ikkalasini birga yuboring.",
    emptyRequest: "Ariza bo‘sh bo‘lishi mumkin emas. Matn, foto, video yoki ikkalasini yuboring.",
    somethingWentWrong: "Arizani yuborishda xatolik yuz berdi. Iltimos, keyinroq urinib ko‘ring.",
    requestCreated: "Arizangiz qabul qilindi.\nAriza raqami: {requestNumber}\nStatus: {status}\nTez orada siz bilan bog‘lanishadi.",
    requestStatusChanged:
      "Arizangiz raqami: <b>{requestNumber}</b>\nstatusi <b>{status}</b> ga o‘zgardi, iltimos tekshirib ko‘ring\nSavollar bo‘lsa — shu yerga yozing:\n@growth_ish",
    requestList: "Mening arizalarim",
    requestListTitle: "Sizning arizalaringiz:",
    requestListEmpty: "Hozircha arizalar yo‘q.",
    requestListItem: "Mavzu: {title}\nRaqam: {requestNumber}\nStatus: {status}",
    requestListNoText: "Matnsiz",
  },
  [Language.EN]: {
    welcome: "Hello! Here you can submit an appeal or an improvement suggestion. Please choose a language to continue.",
    chooseLanguage: "Please choose a language.",
    askContact: "Please share your phone number using the button below.",
    shareContactButton: "Share contact",
    contactInvalid: "Unable to get a valid phone number. Please send your contact using the button below.",
    askInn: "Please send your INN or PINFL.",
    innInvalid: "The INN/PINFL is invalid. Send 9 digits (INN) or 14 digits (PINFL).",
    back: "Back",
    mainMenu: "Main menu",
    chooseRequestType: "Choose request type:",
    requestTypeAppeal: "Appeal",
    requestTypeImprovement: "Improvement",
    askAppealDomain: "Choose the problem domain:",
    appealDomainInvalid: "Choose the problem domain using the buttons below.",
    askAppealSubdomain: "Choose the problem category:",
    appealSubdomainInvalid: "Choose the problem category using the buttons below.",
    askRequestContent: "Send request text, photo, video, or both.",
    emptyRequest: "The request cannot be empty. Send text, photo, video, or both.",
    somethingWentWrong: "An error occurred while sending the request. Please try again later.",
    requestCreated: "Your request has been accepted.\nRequest number: {requestNumber}\nStatus: {status}\nWe will contact you soon.",
    requestStatusChanged:
      "Your request number: <b>{requestNumber}</b>\nstatus has been changed to <b>{status}</b>, please check it\nIf you have any questions, contact us here:\n@growth_ish",
    requestList: "Request List",
    requestListTitle: "Your requests:",
    requestListEmpty: "You do not have any requests yet.",
    requestListItem: "Subject: {title}\nNumber: {requestNumber}\nStatus: {status}",
    requestListNoText: "No text",
  },
};

const FALLBACK_LANGUAGE = Language.UZ;

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
