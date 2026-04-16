import { RequestStatus, RequestType } from "@/generated/prisma/client";

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
  domain?: string;
  type?: RequestType;
};

export type GetRequestByNumberQuery = {
  requestNumber: string;
};

export type UpdateRequestStatusCommand = {
  requestNumber: string;
  status: RequestStatus;
};
