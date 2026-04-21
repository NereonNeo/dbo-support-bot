import { Prisma, UserState } from "@/generated/prisma/client";
import { prismaService } from "@/src/shared/db/db-instance";
import { ChangeInnDTO, ChangeLanguageDTO, ChangePhoneDTO } from "./auth.service.types";

class AuthService {
  constructor(private readonly prisma: typeof prismaService) {}

  async create(data: Prisma.UserCreateInput) {
    const response = await this.prisma.user.create({ data: data });
    return response;
  }

  async getOneUnique(telegramId: string) {
    const response = await this.prisma.user.findUnique({ where: { telegramId: telegramId } });
    return response;
  }

  async changeLanguage(telegramId: string, data: ChangeLanguageDTO) {
    const response = await this.prisma.user.update({
      where: { telegramId: telegramId },
      data: { lang: data.lang, state: UserState.WAIT_CONTACT },
    });
    return response;
  }

  async changePhone(telegramId: string, data: ChangePhoneDTO) {
    const response = await this.prisma.user.update({
      where: { telegramId: telegramId },
      data: { phone: data.phone, state: UserState.WAIT_INN },
    });
    return response;
  }

  async changeInn(telegramId: string, data: ChangeInnDTO) {
    const response = await this.prisma.user.update({
      where: { telegramId: telegramId },
      data: { inn: data.inn, state: UserState.READY_FOR_REQUEST_TYPE },
    });
    return response;
  }

  async setState(telegramId: string, state: UserState) {
    const response = await this.prisma.user.update({ where: { telegramId: telegramId }, data: { state } });
    return response;
  }

  async isExist(telegramId: string) {
    const data = await this.getOneUnique(telegramId);
    if (!data) return false;
    return true;
  }
}

export const authService = new AuthService(prismaService);
