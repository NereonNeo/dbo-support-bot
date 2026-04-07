import { AttachmentType, Language, RequestType, UserState } from "@/generated/prisma/client";
import { appealService } from "@/src/services/appeal/appeal.service";
import { CreateAppealAttachmentDTO } from "@/src/services/appeal/appeal.service.types";
import { CustomContext } from "@/src/shared/api/api-instance";
import { statusLabel, t } from "@/src/shared/locale/messages";
import { buildRequestTypeKeyboard } from "@/src/shared/ui/request-type-keyboard";

type BufferedAppeal = {
  telegramId: number;
  userId: string;
  lang: Language;
  text: string | null;
  attachments: CreateAppealAttachmentDTO[];
  timeout: ReturnType<typeof setTimeout>;
};

class AppealHandler {
  constructor(private readonly service: typeof appealService) {}

  private readonly mediaGroups = new Map<string, BufferedAppeal>();
  private readonly requestType = RequestType.APPEAL;

  start = async (ctx: CustomContext) => {
    if (!ctx.user) return;
    const lang = ctx.user.lang ?? Language.RU;
    if (!ctx.user.inn || ctx.user.state !== UserState.READY_FOR_REQUEST_TYPE) {
      return;
    }

    await this.service.start(ctx.user.telegramId);
    await ctx.reply(t(lang, "askRequestContent"), { reply_markup: { remove_keyboard: true } });
  };

  handleContent = async (ctx: CustomContext) => {
    if (!ctx.user || !ctx.message) return;
    if (ctx.user.state !== UserState.WAIT_REQUEST_CONTENT || ctx.user.pendingRequestType !== this.requestType) return;

    const lang = ctx.user.lang ?? Language.RU;
    const text = "text" in ctx.message ? ctx.message.text : "caption" in ctx.message ? ctx.message.caption : undefined;
    const attachments = this.extractAttachments(ctx);
    const mediaGroupId = "media_group_id" in ctx.message ? ctx.message.media_group_id : undefined;

    if ((!text || text.trim().length === 0) && attachments.length === 0) {
      await ctx.reply(t(lang, "emptyRequest"));
      return;
    }

    if (mediaGroupId) {
      this.bufferMediaGroup({
        ctx,
        mediaGroupId,
        lang,
        text: text?.trim() ?? null,
        attachments,
      });
      return;
    }

    await this.submit({
      ctx,
      userId: ctx.user.id,
      telegramId: ctx.user.telegramId,
      lang,
      text: text?.trim() ?? null,
      attachments,
    });
  };

  private extractAttachments(ctx: CustomContext): CreateAppealAttachmentDTO[] {
    if (!ctx.message) return [];

    const attachments: CreateAppealAttachmentDTO[] = [];

    if ("photo" in ctx.message && ctx.message.photo?.length) {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      attachments.push({
        telegramFileId: photo.file_id,
        type: AttachmentType.PHOTO,
        fileName: null,
        mimeType: null,
        fileSize: photo.file_size ?? null,
      });
    }

    if ("video" in ctx.message && ctx.message.video) {
      const video = ctx.message.video;
      attachments.push({
        telegramFileId: video.file_id,
        type: AttachmentType.VIDEO,
        fileName: video.file_name ?? null,
        mimeType: video.mime_type ?? null,
        fileSize: video.file_size ?? null,
      });
    }

    return attachments;
  }

  private bufferMediaGroup(params: {
    ctx: CustomContext;
    mediaGroupId: string;
    lang: Language;
    text: string | null;
    attachments: CreateAppealAttachmentDTO[];
  }) {
    const { ctx, mediaGroupId, lang, text, attachments } = params;
    const key = `${ctx.user!.telegramId}:${mediaGroupId}:appeal`;
    const existing = this.mediaGroups.get(key);

    if (existing) {
      clearTimeout(existing.timeout);
      existing.attachments.push(...attachments);
      if (!existing.text && text) existing.text = text;
      existing.timeout = setTimeout(async () => {
        await this.flushMediaGroup(key, ctx);
      }, 800);
      return;
    }

    const timeout = setTimeout(async () => {
      await this.flushMediaGroup(key, ctx);
    }, 800);

    this.mediaGroups.set(key, {
      telegramId: ctx.user!.telegramId,
      userId: ctx.user!.id,
      lang,
      text,
      attachments: [...attachments],
      timeout,
    });
  }

  private async flushMediaGroup(key: string, ctx: CustomContext) {
    const buffered = this.mediaGroups.get(key);
    if (!buffered) return;

    this.mediaGroups.delete(key);
    await this.submit({
      ctx,
      userId: buffered.userId,
      telegramId: buffered.telegramId,
      lang: buffered.lang,
      text: buffered.text,
      attachments: buffered.attachments,
    });
  }

  private async submit(params: {
    ctx: CustomContext;
    userId: string;
    telegramId: number;
    lang: Language;
    text: string | null;
    attachments: CreateAppealAttachmentDTO[];
  }) {
    const { ctx, userId, telegramId, lang, text, attachments } = params;
    const created = await this.service.create({ userId, text, attachments });
    await this.service.clearPending(telegramId);

    await ctx.reply(
      t(lang, "requestCreated", {
        requestNumber: created.requestNumber,
        status: statusLabel(lang, created.status),
      }),
      { reply_markup: buildRequestTypeKeyboard(lang) },
    );
  }
}

export const appealHandler = new AppealHandler(appealService);
