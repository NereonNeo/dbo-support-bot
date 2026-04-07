import { RequestStatus } from "@/generated/prisma/client";
import { requestService } from "@/src/services/request/request.service";
import { Request, Response, Router } from "express";

class RequestRoute {
  readonly router: Router;

  constructor(private readonly service: typeof requestService) {
    this.router = Router();
    this.router.get("/", this.getRequests);
  }

  private parseTelegramId(raw: unknown): number | null | undefined {
    if (raw === undefined) return undefined;
    if (typeof raw !== "string") return null;
    if (!/^\d+$/.test(raw)) return null;
    const parsed = Number(raw);
    if (!Number.isSafeInteger(parsed)) return null;
    return parsed;
  }

  private parsePage(raw: unknown): number | null {
    if (raw === undefined) return 1;
    if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
    const parsed = Number(raw);
    if (!Number.isSafeInteger(parsed) || parsed < 1) return null;
    return parsed;
  }

  private parseLimit(raw: unknown): number | null {
    if (raw === undefined) return 20;
    if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
    const parsed = Number(raw);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 100) return null;
    return parsed;
  }

  private parseInn(raw: unknown): string | null | undefined {
    if (raw === undefined) return undefined;
    if (typeof raw !== "string") return null;
    const value = raw.trim();
    if (value.length === 0) return undefined;
    if (!/^\d+$/.test(value)) return null;
    return value;
  }

  private parseStatuses(raw: unknown): RequestStatus[] | null | undefined {
    if (raw === undefined) return undefined;
    if (typeof raw !== "string") return null;

    const values = raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (values.length === 0) return undefined;

    const allowed = new Set(Object.values(RequestStatus));
    const invalid = values.find((v) => !allowed.has(v as RequestStatus));
    if (invalid) return null;

    return values as RequestStatus[];
  }

  private getRequests = async (req: Request, res: Response) => {
    const page = this.parsePage(req.query.page);
    if (page === null) {
      res.status(400).json({ message: "page must be a positive integer" });
      return;
    }

    const limit = this.parseLimit(req.query.limit);
    if (limit === null) {
      res.status(400).json({ message: "limit must be an integer between 1 and 100" });
      return;
    }

    const telegramId = this.parseTelegramId(req.query.telegramId);
    if (telegramId === null) {
      res.status(400).json({ message: "telegramId must be a valid number" });
      return;
    }

    const inn = this.parseInn(req.query.inn);
    if (inn === null) {
      res.status(400).json({ message: "inn must contain only digits" });
      return;
    }

    const statuses = this.parseStatuses(req.query.status);
    if (statuses === null) {
      res.status(400).json({
        message: `status must be comma-separated values from: ${Object.values(RequestStatus).join(", ")}`,
      });
      return;
    }

    const response = await this.service.getRequests({
      page,
      limit,
      statuses: statuses ?? undefined,
      inn: inn ?? undefined,
      telegramId: telegramId ?? undefined,
    });

    res.status(200).json(response);
  };
}

const requestRouteInstance = new RequestRoute(requestService);
export const requestRoute = requestRouteInstance.router;
