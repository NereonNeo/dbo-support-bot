import "dotenv/config";
import "./app/app";
import { httpServer } from "./app/http/http-server";
import { botInstance } from "./shared/api/api-instance";

const httpPort = Number(process.env.HTTP_PORT ?? 3000);

httpServer.bootstrap(httpPort);
botInstance.bootstrap();
