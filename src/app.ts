import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";

const app: Application = express();

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

// Basic entry route
app.get('/', (req: Request, res: Response) => {
    res.status(200).send("EMS API Running.");
});

export default app;
