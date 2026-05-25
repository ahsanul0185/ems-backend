import app from "./app";
import dotenv from "dotenv";
import { initializeCrons } from "./app/module/attendance/attendance.cron";
dotenv.config();
const PORT = process.env.PORT || 5000;
let server;
const bootstrap = async () => {
    try {
        server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            initializeCrons();
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
    }
};
// Graceful shutdowns
const handleExit = () => {
    if (server) {
        server.close(() => {
            console.log("Server closed gracefully.");
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
};
process.on("SIGTERM", handleExit);
process.on("SIGINT", handleExit);
bootstrap();
