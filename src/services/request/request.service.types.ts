import { RequestStatus } from "@/generated/prisma/client";

export type RequestListQuery = {
  userId: string;
};

export type RequestByTypeQuery = {
  telegramId?: number;
};

export type GetRequestsQuery = {
  page: number;
  limit: number;
  statuses?: RequestStatus[];
  inn?: string;
  telegramId?: number;
};
