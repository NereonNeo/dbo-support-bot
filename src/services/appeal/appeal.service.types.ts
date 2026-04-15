import { AttachmentType } from "@/generated/prisma/client";

export type CreateAppealAttachmentDTO = {
  telegramFileId: string;
  fileUrl?: string | null;
  type: AttachmentType;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

export type CreateAppealDTO = {
  userId: string;
  domain: string;
  subdomain?: string | null;
  text?: string | null;
  attachments: CreateAppealAttachmentDTO[];
};
