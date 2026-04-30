import { AttachmentType, Language, RequestType, UserState } from "@/generated/prisma/client";
import { appealService } from "@/src/services/appeal/appeal.service";
import { CreateAppealAttachmentDTO } from "@/src/services/appeal/appeal.service.types";
import { CustomContext } from "@/src/shared/api/api-instance";
import { APPEAL_DOMAINS, findAppealDomainById, findAppealDomainByLabel, findAppealSubdomainByLabel } from "@/src/shared/config/appeal-domains";
import { statusLabel, t } from "@/src/shared/locale/messages";
import { buildAppealDomainKeyboard, buildAppealSubdomainKeyboard } from "@/src/shared/ui/appeal-keyboards";
import { buildRequestTypeKeyboard } from "@/src/shared/ui/request-type-keyboard";

type BufferedAppeal = {
  telegramId: string;
  userId: string;
  domain: string | null;
  subdomain: string | null;
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
    await this.promptDomainSelection(ctx);
  };

  promptDomainSelection = async (ctx: CustomContext) => {
    if (!ctx.user) return;
    const lang = ctx.user.lang ?? Language.RU;
    await ctx.reply(t(lang, "askAppealDomain"), {
      reply_markup: buildAppealDomainKeyboard(lang, APPEAL_DOMAINS),
    });
  };

  promptSubdomainSelection = async (ctx: CustomContext) => {
    if (!ctx.user) return;
    const lang = ctx.user.lang ?? Language.RU;
    const domain = findAppealDomainById(ctx.user.pendingAppealDomain);

    if (!domain) {
      await this.promptDomainSelection(ctx);
      return;
    }

    await ctx.reply(t(lang, "askAppealSubdomain"), {
      reply_markup: buildAppealSubdomainKeyboard(lang, domain),
    });
  };

  handleDomainSelection = async (ctx: CustomContext) => {
    if (!ctx.user || !ctx.message) return;
    if (ctx.user.state !== UserState.WAIT_APPEAL_DOMAIN || ctx.user.pendingRequestType !== this.requestType) return;

    const lang = ctx.user.lang ?? Language.RU;
    const input = "text" in ctx.message ? (ctx.message.text ?? "") : "";
    const normalizedInput = input.trim();

    if (normalizedInput === t(lang, "back") || normalizedInput === t(lang, "mainMenu")) {
      await this.service.clearPending(ctx.user.telegramId);
      await ctx.reply(t(lang, "chooseRequestType"), { reply_markup: buildRequestTypeKeyboard(lang) });
      return;
    }
    const domain = findAppealDomainByLabel(lang, normalizedInput);

    if (!domain) {
      await ctx.reply(t(lang, "appealDomainInvalid"), {
        reply_markup: buildAppealDomainKeyboard(lang, APPEAL_DOMAINS),
      });
      return;
    }

    const shouldAskSubdomain = domain.subdomains.length > 0;
    await this.service.chooseDomain({
      telegramId: ctx.user.telegramId,
      domain: domain.id,
      shouldAskSubdomain,
    });

    if (shouldAskSubdomain) {
      await ctx.reply(t(lang, "askAppealSubdomain"), {
        reply_markup: buildAppealSubdomainKeyboard(lang, domain),
      });
      return;
    }

    await ctx.reply(t(lang, "askRequestContent"), { reply_markup: { remove_keyboard: true } });
  };

  handleSubdomainSelection = async (ctx: CustomContext) => {
    if (!ctx.user || !ctx.message) return;
    if (ctx.user.state !== UserState.WAIT_APPEAL_SUBDOMAIN || ctx.user.pendingRequestType !== this.requestType) return;

    const lang = ctx.user.lang ?? Language.RU;
    const rawInput = "text" in ctx.message ? (ctx.message.text ?? "") : "";
    const normalizedInput = rawInput.trim();

    if (normalizedInput === t(lang, "mainMenu")) {
      await this.service.clearPending(ctx.user.telegramId);
      await ctx.reply(t(lang, "chooseRequestType"), { reply_markup: buildRequestTypeKeyboard(lang) });
      return;
    }

    if (normalizedInput === t(lang, "back")) {
      await this.service.start(ctx.user.telegramId);
      await this.promptDomainSelection(ctx);
      return;
    }

    const domain = findAppealDomainById(ctx.user.pendingAppealDomain);

    if (!domain) {
      await this.service.start(ctx.user.telegramId);
      await this.promptDomainSelection(ctx);
      return;
    }

    const subdomain = findAppealSubdomainByLabel(domain, lang, normalizedInput);
    if (!subdomain) {
      await ctx.reply(t(lang, "appealSubdomainInvalid"), {
        reply_markup: buildAppealSubdomainKeyboard(lang, domain),
      });
      return;
    }

    await this.service.chooseSubdomain({
      telegramId: ctx.user.telegramId,
      subdomain: subdomain.id,
    });
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
        domain: ctx.user.pendingAppealDomain ?? null,
        subdomain: ctx.user.pendingAppealSubdomain ?? null,
        text: text?.trim() ?? null,
        attachments,
      });
      return;
    }

    await this.submit({
      ctx,
      userId: ctx.user.id,
      telegramId: ctx.user.telegramId,
      domain: ctx.user.pendingAppealDomain,
      subdomain: ctx.user.pendingAppealSubdomain,
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
    domain: string | null;
    subdomain: string | null;
    text: string | null;
    attachments: CreateAppealAttachmentDTO[];
  }) {
    const { ctx, mediaGroupId, lang, domain, subdomain, text, attachments } = params;
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
      domain,
      subdomain,
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
      domain: buffered.domain,
      subdomain: buffered.subdomain,
      lang: buffered.lang,
      text: buffered.text,
      attachments: buffered.attachments,
    });
  }

  private async submit(params: {
    ctx: CustomContext;
    userId: string;
    telegramId: string;
    domain: string | null | undefined;
    subdomain: string | null | undefined;
    lang: Language;
    text: string | null;
    attachments: CreateAppealAttachmentDTO[];
  }) {
    const { ctx, userId, telegramId, domain, subdomain, lang, text, attachments } = params;
    if (!domain) {
      await this.service.start(telegramId);
      await this.promptDomainSelection(ctx);
      return;
    }

    const created = await this.service.create({ userId, domain, subdomain, text, attachments });
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
