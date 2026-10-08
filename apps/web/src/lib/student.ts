import { z } from "zod";

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electrical & Electronic Engineering",
  "Civil Engineering",
  "Business Administration",
  "English",
  "Law",
  "Pharmacy",
  "Architecture",
];

export const BATCHES = Array.from({ length: 16 }, (_, i) => String(50 + i));

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export const SEMESTERS = ["1st Semester", "2nd Semester"];

export const GENDERS = ["Male", "Female", "Other"];

export const CLUBS = [
  "Programming Club",
  "Robotics Club",
  "Debate Club",
  "Photography Club",
  "Sports Club",
  "Cultural Club",
  "Volunteer Club",
];

export const MAX_IMAGE_BYTES = 1024 * 1024;

const oneOf = (options: string[], message: string) =>
  z.string().refine((value) => options.includes(value), message);

const today = () => new Date().toISOString().slice(0, 10);

export const studentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  middleName: z.string().trim().max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  studentId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{3,20}$/, "Use 3–20 letters, digits or dashes"),
  department: oneOf(DEPARTMENTS, "Select a department"),
  batch: oneOf(BATCHES, "Select a batch"),
  year: oneOf(YEARS, "Select a year"),
  semester: oneOf(SEMESTERS, "Select a semester"),
  address: z.string().trim().min(1, "Address is required").max(200),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{10,15}$/, "Enter 10–15 digits, optionally starting with +"),
  gender: oneOf(GENDERS, "Select a gender"),
  clubs: z.array(oneOf(CLUBS, "Unknown club")).min(1, "Select at least one club"),
  image: z
    .string()
    .min(1, "Upload a photo")
    .refine((value) => value.startsWith("data:image/"), "Upload a valid image")
    // base64 adds ~33% on top of the file size
    .refine((value) => value.length <= MAX_IMAGE_BYTES * 1.4, "Image must be 1 MB or smaller"),
  birthDate: z.iso
    .date("Select your birth date")
    .refine((value) => value < today(), "Birth date must be in the past"),
});

export type StudentInput = z.infer<typeof studentSchema>;

export const emptyStudent: StudentInput = {
  firstName: "",
  middleName: "",
  lastName: "",
  studentId: "",
  department: "",
  batch: "",
  year: "",
  semester: "",
  address: "",
  email: "",
  phone: "",
  gender: "",
  clubs: [],
  image: "",
  birthDate: "",
};

export function fullName(s: Pick<StudentInput, "firstName" | "lastName"> & { middleName: string | null }) {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
}
