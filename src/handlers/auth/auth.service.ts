import { Prisma } from "@/generated/prisma/client";
import { prismaService } from "@/src/shared/db/db-instance";
import { ChangeLanguageDTO } from "./auth.types";

class AuthService {
  constructor(private readonly prisma: typeof prismaService) {}

  async create(data: Prisma.UserCreateInput) {
    const response = await this.prisma.user.create({ data: data });
    return response;
  }

  async getOneUnique(telegramId: number) {
    const response = await this.prisma.user.findUnique({ where: { chatId: telegramId } });
    return response;
  }

  async changeLanguage(telegramId: number, data: ChangeLanguageDTO) {
    const response = await this.prisma.user.update({ where: { chatId: telegramId }, data: { lang: data.lang } });
    return response;
  }

  async isExist(telegramId: number) {
    const data = await this.getOneUnique(telegramId);
    if (!data) return false;
    return true;
  }
}

export const authService = new AuthService(prismaService);
