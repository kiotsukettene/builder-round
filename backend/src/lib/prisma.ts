import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

const SLOW_QUERY_THRESHOLD_MS = 500;

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: [{ emit: "event", level: "query" }],
});

prisma.$on("query", (e) => {
  if (e.duration >= SLOW_QUERY_THRESHOLD_MS) {
    console.warn(`[slow-query] ${e.duration}ms — ${e.query}`);
  }
});

export default prisma;
