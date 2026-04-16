import { Prisma } from "@/generated/prisma/client";
import { prismaService } from "@/src/shared/db/db-instance";
import { GetRequestByNumberQuery, GetRequestsQuery, RequestListQuery, UpdateRequestStatusCommand } from "./request.service.types";

class RequestService {
  constructor(private readonly prisma: typeof prismaService) {}

  private readonly detailsInclude = {
    user: {
      select: {
        id: true,
        telegramId: true,
        name: true,
        phone: true,
        inn: true,
        lang: true,
      },
    },
    attachments: {
      select: {
        id: true,
        type: true,
        telegramFileId: true,
        fileUrl: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },
    },
  } satisfies Prisma.RequestInclude;

  //TODO Нужно убрать и там где использовался использовать getRequests так как он полностью покрывает все нужды
  getRequestList = (query: RequestListQuery) => {
    const response = this.prisma.request.findMany({ where: { userId: query.userId } });
    return response;
  };

  getRequests = async (query: GetRequestsQuery) => {
    const where: Prisma.RequestWhereInput = {
      ...(query.statuses && query.statuses.length > 0 ? { status: { in: query.statuses } } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.domain ? { domain: { contains: query.domain, mode: "insensitive" } } : {}),
      ...(query.inn ? { user: { inn: { contains: query.inn } } } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.request.count({ where }),
      this.prisma.request.findMany({
        where,
        include: this.detailsInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  };

  getRequestByNumber = (query: GetRequestByNumberQuery) => {
    return this.prisma.request.findUnique({
      where: { requestNumber: query.requestNumber },
      include: this.detailsInclude,
    });
  };

  updateRequestStatus = (command: UpdateRequestStatusCommand) => {
    return this.prisma.request.update({
      where: { requestNumber: command.requestNumber },
      data: { status: command.status },
      include: this.detailsInclude,
    });
  };
}

export const requestService = new RequestService(prismaService);
