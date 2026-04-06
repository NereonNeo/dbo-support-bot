import { AttachmentType } from "@/generated/prisma/client";

export type CreateImprovementAttachmentDTO = {
  telegramFileId: string;
  type: AttachmentType;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type CreateImprovementDTO = {
  userId: number;
  text?: string | null;
  attachments: CreateImprovementAttachmentDTO[];
};
