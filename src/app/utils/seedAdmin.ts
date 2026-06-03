import { prisma } from "../lib/prisma";
import { bcryptUtils } from "./bcrypt";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "12345678";

export const seedAdmin = async () => {
    try {
        const existingAdmin = await prisma.user.findUnique({
            where: { email: ADMIN_EMAIL },
        });

        if (existingAdmin) {
            console.log("Admin already exists. Skipping seed.");
            return;
        }

        const hashedPassword = await bcryptUtils.hash(ADMIN_PASSWORD);

        await prisma.user.create({
            data: {
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: "ADMIN",
                status: "ACTIVE",
                email_verified: true,
            },
        });

        console.log("Admin user seeded successfully.");
    } catch (error) {
        console.error("Failed to seed admin user:", error);
    }
};
