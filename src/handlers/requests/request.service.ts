import { prismaService } from "@/src/shared/db/db-instance";
import { CreateRequestDTO } from "./request.types";
import { formatRequestNumber } from "@/src/shared/utils/request-number";
import { RequestStatus, RequestType, UserState } from "@/generated/prisma/client";

type SubmissionFingerprint = {
  fingerprint: string;
  createdAt: number;
};

class RequestService {
  constructor(private readonly prisma: typeof prismaService) {}

  private readonly recentSubmissions = new Map<number, SubmissionFingerprint>();

  async setPendingType(chatId: number, type: RequestType) {
    const response = await this.prisma.user.update({
      where: { chatId },
      data: { pendingRequestType: type, state: UserState.WAIT_REQUEST_CONTENT },
    });
    return response;
  }

  async clearPending(chatId: number) {
    const response = await this.prisma.user.update({
      where: { chatId },
      data: { pendingRequestType: null, state: UserState.READY_FOR_REQUEST_TYPE },
    });
    return response;
  }

  async createRequest(data: CreateRequestDTO) {
    const response = await this.prisma.$transaction(async (tx) => {
      const created = await tx.request.create({
        data: {
          requestNumber: `TEMP-${Date.now()}-${data.userId}`,
          userId: data.userId,
          type: data.type,
          text: data.text ?? null,
          status: RequestStatus.NEW,
        },
      });

      const requestNumber = formatRequestNumber(created.id, created.createdAt);
      const updated = await tx.request.update({
        where: { id: created.id },
        data: { requestNumber },
      });

      if (data.attachments.length > 0) {
        await tx.requestAttachment.createMany({
          data: data.attachments.map((attachment) => ({
            requestId: updated.id,
            telegramFileId: attachment.telegramFileId,
            type: attachment.type,
            fileName: attachment.fileName ?? null,
            mimeType: attachment.mimeType ?? null,
            fileSize: attachment.fileSize ?? null,
          })),
        });
      }

      return updated;
    });

    return response;
  }

  isDuplicateSubmission(data: CreateRequestDTO): boolean {
    const fingerprint = JSON.stringify({
      type: data.type,
      text: data.text?.trim() ?? null,
      attachments: data.attachments.map((attachment) => ({
        telegramFileId: attachment.telegramFileId,
        type: attachment.type,
      })),
    });
    const now = Date.now();
    const previous = this.recentSubmissions.get(data.userId);

    if (previous && previous.fingerprint === fingerprint && now - previous.createdAt < 15_000) {
      return true;
    }

    this.recentSubmissions.set(data.userId, { fingerprint, createdAt: now });
    return false;
  }
}

export const requestService = new RequestService(prismaService);
