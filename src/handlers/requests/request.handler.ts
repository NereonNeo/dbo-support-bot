import { AttachmentType, Language, RequestType, UserState } from "@/generated/prisma/client";
import { CustomContext } from "@/src/shared/api/api-instance";
import { statusLabel, t } from "@/src/shared/locale/messages";
import { CallbackQueryContext, Context } from "grammy";
import { buildRequestTypeKeyboard } from "./request.const";
import { requestService } from "./request.service";
import { CreateRequestAttachmentDTO } from "./request.types";

type BufferedRequest = {
  chatId: number;
  userId: number;
  lang: Language;
  type: RequestType;
  text: string | null;
  attachments: CreateRequestAttachmentDTO[];
  timeout: ReturnType<typeof setTimeout>;
};

class RequestHandler {
  constructor(private readonly service: typeof requestService) {}

  private readonly mediaGroups = new Map<string, BufferedRequest>();

  askRequestType = async (ctx: Context, lang: Language) => {
    await ctx.reply(t(lang, "chooseRequestType"), { reply_markup: buildRequestTypeKeyboard(lang) });
  };

  chooseType = async (ctx: CallbackQueryContext<CustomContext>) => {
    if (!ctx.user) return;
    const lang = ctx.user.lang ?? Language.RU;
    if (!ctx.user.inn) {
      await ctx.answerCallbackQuery();
      return;
    }

    const typeRaw = ctx.match[1];
    const type = typeRaw === "appeal" ? RequestType.APPEAL : RequestType.IMPROVEMENT;

    await this.service.setPendingType(ctx.user.chatId, type);
    await ctx.answerCallbackQuery();
    await ctx.reply(t(lang, "askRequestContent"));
  };

  handleRequestContent = async (ctx: CustomContext) => {
    if (!ctx.user || !ctx.message) return;
    if (ctx.user.state !== UserState.WAIT_REQUEST_CONTENT) {
      if (ctx.user.state === UserState.READY_FOR_REQUEST_TYPE) {
        await this.askRequestType(ctx, ctx.user.lang ?? Language.RU);
      }
      return;
    }

    const lang = ctx.user.lang ?? Language.RU;
    const pendingType = ctx.user.pendingRequestType;
    if (!pendingType) {
      await this.askRequestType(ctx, lang);
      return;
    }

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
        pendingType,
        text: text?.trim() ?? null,
        attachments,
      });
      return;
    }

    await this.submitRequest({
      ctx,
      userId: ctx.user.id,
      chatId: ctx.user.chatId,
      lang,
      type: pendingType,
      text: text?.trim() ?? null,
      attachments,
    });
  };

  private extractAttachments(ctx: CustomContext): CreateRequestAttachmentDTO[] {
    if (!ctx.message) return [];

    const attachments: CreateRequestAttachmentDTO[] = [];

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
    pendingType: RequestType;
    text: string | null;
    attachments: CreateRequestAttachmentDTO[];
  }) {
    const { ctx, mediaGroupId, lang, pendingType, text, attachments } = params;
    const key = `${ctx.user!.chatId}:${mediaGroupId}`;
    const existing = this.mediaGroups.get(key);

    if (existing) {
      clearTimeout(existing.timeout);
      existing.attachments.push(...attachments);
      if (!existing.text && text) {
        existing.text = text;
      }
      existing.timeout = setTimeout(async () => {
        await this.flushMediaGroup(key, ctx);
      }, 800);
      return;
    }

    const timeout = setTimeout(async () => {
      await this.flushMediaGroup(key, ctx);
    }, 800);

    this.mediaGroups.set(key, {
      chatId: ctx.user!.chatId,
      userId: ctx.user!.id,
      lang,
      type: pendingType,
      text,
      attachments: [...attachments],
      timeout,
    });
  }

  private async flushMediaGroup(key: string, ctx: CustomContext) {
    const buffered = this.mediaGroups.get(key);
    if (!buffered) return;

    this.mediaGroups.delete(key);
    await this.submitRequest({
      ctx,
      userId: buffered.userId,
      chatId: buffered.chatId,
      lang: buffered.lang,
      type: buffered.type,
      text: buffered.text,
      attachments: buffered.attachments,
    });
  }

  private async submitRequest(params: {
    ctx: CustomContext;
    userId: number;
    chatId: number;
    lang: Language;
    type: RequestType;
    text: string | null;
    attachments: CreateRequestAttachmentDTO[];
  }) {
    const { ctx, userId, chatId, lang, type, text, attachments } = params;

    const isDuplicate = this.service.isDuplicateSubmission({
      userId,
      type,
      text,
      attachments,
    });
    if (isDuplicate) {
      await ctx.reply(t(lang, "duplicateRequest"));
      return;
    }

    const request = await this.service.createRequest({
      userId,
      type,
      text,
      attachments,
    });

    await this.service.clearPending(chatId);

    await ctx.reply(
      t(lang, "requestCreated", {
        requestNumber: request.requestNumber,
        status: statusLabel(lang, request.status),
      }),
    );
  }
}

export const requestHandler = new RequestHandler(requestService);
