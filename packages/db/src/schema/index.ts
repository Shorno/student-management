import { date, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  studentId: text("student_id").primaryKey(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  department: text("department").notNull(),
  batch: text("batch").notNull(),
  year: text("year").notNull(),
  semester: text("semester").notNull(),
  address: text("address").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  gender: text("gender").notNull(),
  clubs: text("clubs").array().notNull(),
  // Stored as a data URL (base64) to keep the project free of file storage setup.
  image: text("image").notNull(),
  birthDate: date("birth_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Student = typeof students.$inferSelect;
