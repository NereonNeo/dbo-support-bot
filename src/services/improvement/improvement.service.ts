import { RequestStatus, RequestType, UserState } from "@/generated/prisma/client";
import { telegramFileService } from "@/src/shared/api/telegram-file.service";
import { prismaService } from "@/src/shared/db/db-instance";
import { formatRequestNumber } from "@/src/shared/utils/request-number";
import { CreateImprovementDTO } from "./improvement.service.types";

class ImprovementService {
  constructor(private readonly prisma: typeof prismaService) {}

  private readonly requestType = RequestType.IMPROVEMENT;

  async start(telegramId: number) {
    await this.prisma.user.update({
      where: { telegramId: telegramId },
      data: {
        pendingRequestType: this.requestType,
        pendingAppealDomain: null,
        pendingAppealSubdomain: null,
        state: UserState.WAIT_REQUEST_CONTENT,
      },
    });
  }

  async clearPending(telegramId: number) {
    await this.prisma.user.update({
      where: { telegramId: telegramId },
      data: {
        pendingRequestType: null,
        pendingAppealDomain: null,
        pendingAppealSubdomain: null,
        state: UserState.READY_FOR_REQUEST_TYPE,
      },
    });
  }

  async create(data: CreateImprovementDTO) {
    const attachments = await telegramFileService.populateFileUrls(data.attachments);

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.request.create({
        data: {
          requestNumber: `TEMP-${Date.now()}-${data.userId}`,
          userId: data.userId,
          type: this.requestType,
          text: data.text ?? null,
          status: RequestStatus.NEW,
        },
      });

      const requestNumber = formatRequestNumber(created.id, created.createdAt);
      const updated = await tx.request.update({
        where: { id: created.id },
        data: { requestNumber },
      });

      if (attachments.length > 0) {
        await tx.requestAttachment.createMany({
          data: attachments.map((attachment) => ({
            requestId: updated.id,
            telegramFileId: attachment.telegramFileId,
            fileUrl: attachment.fileUrl ?? null,
            type: attachment.type,
            fileName: attachment.fileName ?? null,
            mimeType: attachment.mimeType ?? null,
            fileSize: attachment.fileSize ?? null,
          })),
        });
      }

      return updated;
    });
  }
}

export const improvementService = new ImprovementService(prismaService);
