import { Language } from "@/generated/prisma/client";

type LocalizedText = Record<Language, string>;

export type AppealSubdomain = {
  id: string;
  label: LocalizedText;
};

export type AppealDomain = {
  id: string;
  label: LocalizedText;
  subdomains: AppealSubdomain[];
};

export const APPEAL_DOMAINS: AppealDomain[] = [
  {
    id: "AUTH",
    label: {
      [Language.RU]: "Регистрация-Вход",
      [Language.UZ]: "Royxatdan otish-Kirish",
      [Language.EN]: "Registration-Login",
    },
    subdomains: [
      {
        id: "EIMZO_CONFIRMATION",
        label: {
          [Language.RU]: "Подтверждение eimzo",
          [Language.UZ]: "EIMZO tasdiqlash",
          [Language.EN]: "EIMZO confirmation",
        },
      },
      {
        id: "MYID",
        label: {
          [Language.RU]: "MyID",
          [Language.UZ]: "MyID",
          [Language.EN]: "MyID",
        },
      },
      {
        id: "FORGOT_PIN",
        label: {
          [Language.RU]: "Забыл пинкод",
          [Language.UZ]: "PIN-kodni unutdim",
          [Language.EN]: "Forgot PIN",
        },
      },
      {
        id: "MFO",
        label: {
          [Language.RU]: "MFO",
          [Language.UZ]: "MFO",
          [Language.EN]: "MFO",
        },
      },
      {
        id: "DIRECTOR_CHANGED",
        label: {
          [Language.RU]: "Сменился директор",
          [Language.UZ]: "Direktor ozgardi",
          [Language.EN]: "Director changed",
        },
      },
      {
        id: "COMPANY_OR_EMPLOYEE_ADDITION",
        label: {
          [Language.RU]: "Добавление компании/сотрудника",
          [Language.UZ]: "Kompaniya/xodim qoshish",
          [Language.EN]: "Add company/employee",
        },
      },
    ],
  },
  {
    id: "TRANSACTION",
    label: {
      [Language.RU]: "Оплата",
      [Language.UZ]: "Tolov",
      [Language.EN]: "Transactions",
    },
    subdomains: [
      {
        id: "PAYMENT_ORDER",
        label: {
          [Language.RU]: "Платежное поручение",
          [Language.UZ]: "Tolov topshirigi",
          [Language.EN]: "Payment order",
        },
      },
      {
        id: "INTERNAL_TRANSFER",
        label: {
          [Language.RU]: "Между своими счетами",
          [Language.UZ]: "Oz hisoblari orasida",
          [Language.EN]: "Between own accounts",
        },
      },
      {
        id: "FAST_PAYMENTS_24_7",
        label: {
          [Language.RU]: "Система быстрых платежей 24/7",
          [Language.UZ]: "24/7 tezkor tolovlar",
          [Language.EN]: "Fast payments 24/7",
        },
      },
      {
        id: "BUDGET_PAYMENTS",
        label: {
          [Language.RU]: "Бюджетные платежи",
          [Language.UZ]: "Budjet tolovlari",
          [Language.EN]: "Budget payments",
        },
      },
      {
        id: "PAYMENT_TEMPLATES",
        label: {
          [Language.RU]: "Шаблоны платежей",
          [Language.UZ]: "Tolov shablonlari",
          [Language.EN]: "Payment templates",
        },
      },
      {
        id: "SALARY_PAYOUT",
        label: {
          [Language.RU]: "Выдача зарплаты",
          [Language.UZ]: "Ish haqi tolovi",
          [Language.EN]: "Salary payout",
        },
      },
      {
        id: "CORPORATE_CARDS",
        label: {
          [Language.RU]: "Корпоративные карты",
          [Language.UZ]: "Korporativ kartalar",
          [Language.EN]: "Corporate cards",
        },
      },
    ],
  },
  {
    id: "ACCOUNT",
    label: {
      [Language.RU]: "Счета",
      [Language.UZ]: "Hisoblar",
      [Language.EN]: "Accounts",
    },
    subdomains: [
      {
        id: "CANNOT_SEE_ACCOUNT",
        label: {
          [Language.RU]: "Не вижу счет",
          [Language.UZ]: "Hisob korinmayapti",
          [Language.EN]: "Cannot see account",
        },
      },
    ],
  },
  {
    id: "CREDIT",
    label: {
      [Language.RU]: "Кредиты",
      [Language.UZ]: "Kreditlar",
      [Language.EN]: "Credits",
    },
    subdomains: [
      {
        id: "REPAYMENT_SCHEDULE",
        label: {
          [Language.RU]: "График погашения",
          [Language.UZ]: "Tolov jadvali",
          [Language.EN]: "Repayment schedule",
        },
      },
      {
        id: "CREDIT_PAYMENT",
        label: {
          [Language.RU]: "Оплата кредита",
          [Language.UZ]: "Kredit tolovi",
          [Language.EN]: "Credit payment",
        },
      },
      {
        id: "CREDIT_ACCOUNTS",
        label: {
          [Language.RU]: "Кредитные счета",
          [Language.UZ]: "Kredit hisoblari",
          [Language.EN]: "Credit accounts",
        },
      },
    ],
  },
  {
    id: "REPORTS",
    label: {
      [Language.RU]: "Отчеты",
      [Language.UZ]: "Hisobotlar",
      [Language.EN]: "Reports",
    },
    subdomains: [],
  },
  {
    id: "MONITORING",
    label: {
      [Language.RU]: "Мониторинг",
      [Language.UZ]: "Monitoring",
      [Language.EN]: "Monitoring",
    },
    subdomains: [],
  },
  {
    id: "OTHER",
    label: {
      [Language.RU]: "Другое",
      [Language.UZ]: "Boshqa",
      [Language.EN]: "Other",
    },
    subdomains: [],
  },
];

export const findAppealDomainById = (domainId?: string | null): AppealDomain | undefined => {
  if (!domainId) return undefined;
  return APPEAL_DOMAINS.find((domain) => domain.id === domainId);
};

export const findAppealDomainByLabel = (lang: Language, label: string): AppealDomain | undefined => {
  const normalizedLabel = label.trim();
  return APPEAL_DOMAINS.find((domain) => domain.label[lang] === normalizedLabel);
};

export const findAppealSubdomainByLabel = (
  domain: AppealDomain,
  lang: Language,
  label: string,
): AppealSubdomain | undefined => {
  const normalizedLabel = label.trim();
  return domain.subdomains.find((subdomain) => subdomain.label[lang] === normalizedLabel);
};
