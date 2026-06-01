import path from "path";
import dotenv from "dotenv";

dotenv.config();

const root = path.resolve(__dirname, "../..");

export const env = {
  port: Number(process.env.PORT) || 3001,
  databasePath:
    process.env.DATABASE_PATH || path.join(root, "data", "nfe.db"),
  clientesApiUrl:
    process.env.CLIENTES_API_URL || "http://localhost:3002/clientes",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};
