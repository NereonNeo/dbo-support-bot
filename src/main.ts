import "dotenv/config";
import "./app/app";
import { botInstance } from "./shared/api/api-instance";
botInstance.bootstrap();
