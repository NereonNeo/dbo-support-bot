import { RequestStatus, RequestType } from "@/generated/prisma/client";
import { requestService } from "@/src/services/request/request.service";
import { Request, Response, Router } from "express";

class RequestRoute {
  readonly router: Router;

  constructor(private readonly service: typeof requestService) {
    this.router = Router();
    this.router.patch("/:requestNumber/status", this.updateRequestStatus);
    this.router.get("/:requestNumber", this.getRequestByNumber);
    this.router.get("/", this.getRequests);
  }

  private parseRequestNumber(raw: unknown): string | null {
    if (typeof raw !== "string") return null;
    const value = raw.trim();
    if (value.length === 0) return null;
    return value;
  }

  private parseDomain(raw: unknown): string | null | undefined {
    if (raw === undefined) return undefined;
    if (typeof raw !== "string") return null;
    const value = raw.trim();
    if (value.length === 0) return undefined;
    return value;
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

  private parseType(raw: unknown): RequestType | null | undefined {
    if (raw === undefined) return undefined;
    if (typeof raw !== "string") return null;

    const value = raw.trim();
    if (value.length === 0) return undefined;

    const allowed = new Set(Object.values(RequestType));
    if (!allowed.has(value as RequestType)) return null;

    return value as RequestType;
  }

  private parseUpdatableStatus(raw: unknown): RequestStatus | null {
    if (typeof raw !== "string") return null;

    const value = raw.trim();
    const allowed = new Set<RequestStatus>([RequestStatus.RESOLVED, RequestStatus.REJECTED]);

    if (!allowed.has(value as RequestStatus)) return null;

    return value as RequestStatus;
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

    const domain = this.parseDomain(req.query.domain);
    if (domain === null) {
      res.status(400).json({ message: "domain must be a string" });
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

    const type = this.parseType(req.query.type);
    if (type === null) {
      res.status(400).json({
        message: `type must be one of: ${Object.values(RequestType).join(", ")}`,
      });
      return;
    }

    const response = await this.service.getRequests({
      page,
      limit,
      statuses: statuses ?? undefined,
      inn: inn ?? undefined,
      domain: domain ?? undefined,
      type: type ?? undefined,
    });

    res.status(200).json(response);
  };

  private getRequestByNumber = async (req: Request, res: Response) => {
    const requestNumber = this.parseRequestNumber(req.params.requestNumber);
    if (!requestNumber) {
      res.status(400).json({ message: "requestNumber is required" });
      return;
    }

    const request = await this.service.getRequestByNumber({ requestNumber });

    if (!request) {
      res.status(404).json({ message: "request not found" });
      return;
    }

    res.status(200).json(request);
  };

  private updateRequestStatus = async (req: Request, res: Response) => {
    const requestNumber = this.parseRequestNumber(req.params.requestNumber);
    if (!requestNumber) {
      res.status(400).json({ message: "requestNumber is required" });
      return;
    }

    const status = this.parseUpdatableStatus(req.body?.status);
    if (!status) {
      res.status(400).json({
        message: `status must be one of: ${[RequestStatus.RESOLVED, RequestStatus.REJECTED].join(", ")}`,
      });
      return;
    }

    try {
      const request = await this.service.updateRequestStatus({ requestNumber, status });
      res.status(200).json(request);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "P2025"
      ) {
        res.status(404).json({ message: "request not found" });
        return;
      }

      throw error;
    }
  };
}

const requestRouteInstance = new RequestRoute(requestService);
export const requestRoute = requestRouteInstance.router;
