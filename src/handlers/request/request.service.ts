import { prismaService } from "@/src/shared/db/db-instance";
import { RequestListQuery } from "./request.types";

class RequestService {
  constructor(private readonly prisma: typeof prismaService) {}

  getRequestList = (query: RequestListQuery) => {
    const response = this.prisma.request.findMany({ where: { userId: query.userId } });
    return response;
  };
}

export const requestService = new RequestService(prismaService);
