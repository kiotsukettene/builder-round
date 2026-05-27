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
import { globalLimiter } from "./middleware/rate-limiter.js";
import { errorHandler } from "./middleware/error-handler.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
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

app.use(errorHandler);

export default app;
