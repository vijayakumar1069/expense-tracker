// lib/actions.ts

"use server"
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";

export async function createEmployee(formData: FormData) {
    try {
        const user = await requireAuth();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;

        console.log("Creating employee:", name, email);

        const newEmployee = await prisma.employee.create({
            data: {
                name,
                email,
                userId: user.id
            }
        });

        return {
            success: true,
            data: newEmployee
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Failed to create employee"
        };
    }
}

export async function getEmployees() {
    try {
        const user = await requireAuth();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const employees = await prisma.employee.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: employees
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Failed to fetch employees"
        };
    }
}

export async function getEmployeeById(id: string) {
    try {
        const user = await requireAuth();

        if (!user) {
            throw new Error("Unauthorized");
        }

        const employee = await prisma.employee.findUnique({
            where: {
                id,
                userId: user.id
            }
        });

        if (!employee) {
            throw new Error("Employee not found");
        }

        return {
            success: true,
            data: employee
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Failed to fetch employee"
        };
    }
}

export async function updateEmployee(id: string, formData: FormData) {
    try {
        const user = await requireAuth();

        if (!user) {
            throw new Error("Unauthorized");
        }

        // Check if employee exists and belongs to this user
        const existingEmployee = await prisma.employee.findUnique({
            where: {
                id,
                userId: user.id
            }
        });

        if (!existingEmployee) {
            throw new Error("Employee not found or unauthorized");
        }

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;

        const updatedEmployee = await prisma.employee.update({
            where: {
                id
            },
            data: {
                name,
                email,
                updatedAt: new Date()
            }
        });

        return {
            success: true,
            data: updatedEmployee
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Failed to update employee"
        };
    }
}

export async function deleteEmployee(id: string) {
    try {
        const user = await requireAuth();

        if (!user) {
            throw new Error("Unauthorized");
        }

        // Check if employee exists and belongs to this user
        const existingEmployee = await prisma.employee.findUnique({
            where: {
                id,
                userId: user.id
            }
        });

        if (!existingEmployee) {
            throw new Error("Employee not found or unauthorized");
        }

        await prisma.employee.delete({
            where: {
                id
            }
        });

        return {
            success: true
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Failed to delete employee"
        };
    }
}
