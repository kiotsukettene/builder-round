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


startAppointmentReminderJob();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
