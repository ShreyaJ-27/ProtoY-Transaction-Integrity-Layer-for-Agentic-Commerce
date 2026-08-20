import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

const PORT = Number(process.env.PORT ?? 4021);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    network: process.env.ALGORAND_NETWORK ?? "unknown"
  });
});

app.get("/info", (c) => {
  return c.json({
    name: "Proto-Y",
    version: "1.0.0",
    description: "Transaction Integrity Layer for Agentic Commerce",
    network: process.env.ALGORAND_NETWORK ?? "unknown"
  });
});

app.get("/", (c) => {
  return c.json({
    name: "Proto-Y",
    message: "Transaction Integrity Layer online"
  });
});

console.log(`✓ Proto-Y server running on http://localhost:${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT
});