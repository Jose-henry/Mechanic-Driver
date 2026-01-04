import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
});

export const requestSchema = z.object({
    brand: z.string().min(1, "Please select a car brand"),
    model: z.string().min(1, "Please enter the car model"),
    year: z.coerce.number().min(1900, "Invalid year").max(new Date().getFullYear() + 1, "Future year not allowed"),
    licensePlate: z.string().optional(),
    pickupLocation: z.string().min(5, "Please enter a valid pickup address"),
    pickupDate: z.string().refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Pickup date cannot be in the past",
    }),
    pickupTime: z.string().min(1, "Please select a pickup time"),
    description: z.string().min(10, "Please provide more detail about the issue (at least 10 characters)"),
    // New fields
    serviceType: z.string().min(3, "Please specify the service needed"),
    isTowing: z.coerce.boolean().optional(),
    isCarWash: z.coerce.boolean().optional(),
});
