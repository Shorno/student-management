import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { StudentForm } from "@/components/student-form";
import { getStudent, updateStudent } from "@/server/students.functions";

export const Route = createFileRoute("/students/$studentId/edit")({
  loader: async ({ params }) => {
    const student = await getStudent({ data: { studentId: params.studentId } });
    if (!student) throw notFound();
    return student;
  },
  notFoundComponent: () => (
    <div className="container mx-auto max-w-3xl px-4 py-6">Student not found.</div>
  ),
  component: EditStudentPage,
});

function EditStudentPage() {
  const student = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Update Student</h1>
        <p className="text-sm text-muted-foreground">Student ID: {student.studentId}</p>
      </div>
      <StudentForm
        mode="edit"
        initialValues={{ ...student, middleName: student.middleName ?? "" }}
        onSubmit={async (values) => {
          await updateStudent({ data: values });
          toast.success(`Student ${values.studentId} updated`);
          await navigate({ to: "/students" });
        }}
      />
    </div>
  );
}
