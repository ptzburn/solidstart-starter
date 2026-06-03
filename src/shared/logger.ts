import env from "~/env.ts";
import pino, { type Logger } from "pino";
import pretty from "pino-pretty";

const logger: Logger = pino(
  { level: env.LOG_LEVEL || "info" },
  env.NODE_ENV === "production" ? undefined : pretty(),
);

export default logger;
