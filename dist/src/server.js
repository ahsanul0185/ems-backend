"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const attendance_cron_1 = require("./app/module/attendance/attendance.cron");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
let server;
const bootstrap = async () => {
    try {
        server = app_1.default.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            (0, attendance_cron_1.initializeCrons)();
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
