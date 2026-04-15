import { AttachmentType } from "@/generated/prisma/client";

export type CreateImprovementAttachmentDTO = {
  telegramFileId: string;
  fileUrl?: string | null;
  type: AttachmentType;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type CreateImprovementDTO = {
  userId: string;
  text?: string | null;
  attachments: CreateImprovementAttachmentDTO[];
};
