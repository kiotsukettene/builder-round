import { createServer } from "http";
import app from "./app.js";
import { initializeSocket } from "./lib/socket.js";
import prisma from "./lib/prisma.js";
import { startAppointmentReminderJob } from "./jobs/appointment-reminder.job.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT ?? 3000;

const server = createServer(app);
initializeSocket(server);

const DB_KEEPALIVE_INTERVAL_MS = 4 * 60 * 1000;
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.error("Database keepalive failed");
  }
}, DB_KEEPALIVE_INTERVAL_MS);

startAppointmentReminderJob();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
