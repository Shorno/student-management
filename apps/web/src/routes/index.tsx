import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { StudentForm } from "@/components/student-form";
import { createStudent } from "@/server/students.functions";

export const Route = createFileRoute("/")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Student Information Form</h1>
        <p className="text-sm text-muted-foreground">Fields marked * are required.</p>
      </div>
      <StudentForm
        mode="create"
        onSubmit={async (values) => {
          await createStudent({ data: values });
          toast.success(`Student ${values.studentId} added`);
          await navigate({ to: "/students" });
        }}
      />
    </div>
  );
}
