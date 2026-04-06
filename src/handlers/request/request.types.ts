import { RequestStatus } from "@/generated/prisma/enums";

export type RequestListQuery = {
  userId: string;
};

export type RequestList = {
  title: string;
  status: RequestStatus;
  requestNumber: string;
};
