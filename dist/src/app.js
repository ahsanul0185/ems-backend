import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
const app = express();
// Middlewares
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", IndexRoutes);
// Basic entry route
app.get('/', (req, res) => {
    res.status(200).send("EMS API Running.");
});
app.use(globalErrorHandler);
app.use(notFound);
export default app;
