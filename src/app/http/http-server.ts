import { requestRoute } from "@/src/routes/request.route";
import cors from "cors";
import express from "express";

class HttpServer {
  private readonly app = express();

  constructor() {
    this.configure();
  }

  private configure() {
    this.app.use(express.json());
    this.app.use(cors({ origin: ["https://dbo-app.yakubs.online", "http://localhost:3000"] }));

    this.app.get("/health", (_req, res) => {
      res.status(200).json({ ok: true });
    });

    this.app.use("/api/requests", requestRoute);
  }

  bootstrap(port: number) {
    this.app.listen(port, () => {
      console.log(`HTTP server started on port ${port}`);
    });
  }
}

export const httpServer = new HttpServer();
