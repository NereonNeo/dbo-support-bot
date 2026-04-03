import { AttachmentType, RequestType } from "@/generated/prisma/client";

export type CreateRequestAttachmentDTO = {
  telegramFileId: string;
  type: AttachmentType;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type CreateRequestDTO = {
  userId: number;
  type: RequestType;
  text?: string | null;
  attachments: CreateRequestAttachmentDTO[];
};
