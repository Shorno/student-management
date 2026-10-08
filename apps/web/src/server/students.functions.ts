import { students } from "@student-management/db";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq, getColumns, ilike, sql } from "drizzle-orm";
import { z } from "zod";

import { studentSchema, type StudentInput } from "@/lib/student";

import { db } from "../services";

const studentIdInput = z.object({ studentId: z.string().trim().min(1) });

function toRow(data: StudentInput) {
  return { ...data, middleName: data.middleName || null };
}

export const listStudents = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().trim().optional() }))
  .handler(async ({ data }) => {
    return db
      .select({
        ...getColumns(students),
        // Derived attribute: computed from birth_date at query time, never stored.
        age: sql<number>`date_part('year', age(${students.birthDate}))::int`,
      })
      .from(students)
      .where(
        data.q
          ? ilike(students.studentId, `%${data.q.replace(/[\\%_]/g, "\\$&")}%`)
          : undefined,
      )
      .orderBy(asc(students.studentId));
  });

export const getStudent = createServerFn({ method: "GET" })
  .validator(studentIdInput)
  .handler(async ({ data }) => {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.studentId, data.studentId));
    return student ?? null;
  });

export const createStudent = createServerFn({ method: "POST" })
  .validator(studentSchema)
  .handler(async ({ data }) => {
    const [existing] = await db
      .select({ studentId: students.studentId })
      .from(students)
      .where(eq(students.studentId, data.studentId));
    if (existing) {
      throw new Error(`Student ID "${data.studentId}" already exists`);
    }
    await db.insert(students).values(toRow(data));
    return { studentId: data.studentId };
  });

export const updateStudent = createServerFn({ method: "POST" })
  .validator(studentSchema)
  .handler(async ({ data }) => {
    const updated = await db
      .update(students)
      .set(toRow(data))
      .where(eq(students.studentId, data.studentId))
      .returning({ studentId: students.studentId });
    if (updated.length === 0) {
      throw new Error(`Student ID "${data.studentId}" was not found`);
    }
    return { studentId: data.studentId };
  });

export const deleteStudent = createServerFn({ method: "POST" })
  .validator(studentIdInput)
  .handler(async ({ data }) => {
    await db.delete(students).where(eq(students.studentId, data.studentId));
    return { studentId: data.studentId };
  });
