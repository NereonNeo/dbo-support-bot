type AttachmentWithTelegramFileId = {
  telegramFileId: string;
  fileUrl?: string | null;
};

class TelegramFileService {
  private readonly botToken = process.env.BOT_ID ?? "";
  private readonly botApiBaseUrl = "https://api.telegram.org";

  async populateFileUrls<T extends AttachmentWithTelegramFileId>(attachments: T[]): Promise<T[]> {
    return Promise.all(
      attachments.map(async (attachment) => ({
        ...attachment,
        fileUrl: await this.resolveFileUrl(attachment.telegramFileId),
      })),
    );
  }

  async resolveFileUrl(fileId: string): Promise<string | null> {
    if (!this.botToken || !fileId) return null;

    try {
      const response = await fetch(`${this.botApiBaseUrl}/bot${this.botToken}/getFile?file_id=${encodeURIComponent(fileId)}`);
      if (!response.ok) return null;

      const payload = (await response.json()) as {
        ok?: boolean;
        result?: { file_path?: string };
      };

      const filePath = payload.result?.file_path;
      if (!payload.ok || !filePath) return null;

      return `${this.botApiBaseUrl}/file/bot${this.botToken}/${filePath}`;
    } catch {
      return null;
    }
  }
}

export const telegramFileService = new TelegramFileService();
