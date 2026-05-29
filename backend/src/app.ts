import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes.js";
import patientRoutes from "./modules/patients/patient.routes.js";
import doctorRoutes from "./modules/doctors/doctor.routes.js";
import recommendationRoutes from "./modules/recommendations/recommendation.routes.js";
import appointmentRoutes from "./modules/appointments/appointment.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import pushRoutes from "./modules/push/push.routes.js";
import scheduleRoutes from "./modules/schedules/schedule.routes.js";
import consultationRoutes from "./modules/consultations/consultation.routes.js";
import medicalRecordRoutes from "./modules/medical-records/medical-record.routes.js";
import { globalLimiter } from "./middleware/rate-limiter.js";
import { errorHandler } from "./middleware/error-handler.js";
import { env } from "./config/env.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(globalLimiter);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "telehealth-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/push", pushRoutes);
app.use("/api/v1/schedules", scheduleRoutes);
app.use("/api/v1/consultations", consultationRoutes);
app.use("/api/v1/medical-records", medicalRecordRoutes);

app.use(errorHandler);

export default app;
