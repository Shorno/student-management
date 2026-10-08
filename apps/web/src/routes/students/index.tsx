import { Button, buttonVariants } from "@student-management/ui/components/button";
import { Input } from "@student-management/ui/components/input";
import { Link, createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { fullName } from "@/lib/student";
import { deleteStudent, listStudents } from "@/server/students.functions";

export const Route = createFileRoute("/students/")({
  // The router parses numeric-looking params (e.g. ?q=221) as numbers, so coerce back to a string.
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    const q = typeof search.q === "string" || typeof search.q === "number" ? String(search.q).trim() : "";
    return q ? { q } : {};
  },
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => listStudents({ data: { q: deps.q } }),
  component: StudentsPage,
});

const COLUMNS = [
  "Photo",
  "Student ID",
  "Name",
  "Department",
  "Batch",
  "Year",
  "Semester",
  "Gender",
  "Birth Date",
  "Age",
  "Email",
  "Phone",
  "Address",
  "Clubs",
  "Actions",
];

function StudentsPage() {
  const students = Route.useLoaderData();
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const router = useRouter();
  const [query, setQuery] = useState(q ?? "");

  const search = (value: string) => navigate({ search: value.trim() ? { q: value.trim() } : {} });

  const handleDelete = async (studentId: string) => {
    if (!window.confirm(`Delete student ${studentId}? This cannot be undone.`)) return;
    try {
      await deleteStudent({ data: { studentId } });
      toast.success(`Student ${studentId} deleted`);
      await router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete student");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            {students.length} {students.length === 1 ? "record" : "records"}
            {q && ` matching “${q}”`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              search(query);
            }}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Student ID"
              aria-label="Search by Student ID"
              className="w-56"
            />
            <Button type="submit" variant="outline">
              <Search /> Search
            </Button>
            {q && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  search("");
                }}
              >
                <X /> Clear
              </Button>
            )}
          </form>
          <Link to="/" className={buttonVariants()}>
            <Plus /> Add Student
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto border">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50">
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} className="px-3 py-2 font-medium whitespace-nowrap">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-10 text-center text-muted-foreground">
                  {q ? `No student found with ID matching “${q}”.` : "No students yet."}
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.studentId} className="border-t align-top hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <img src={s.image} alt={fullName(s)} className="size-10 object-cover" />
                  </td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{s.studentId}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{fullName(s)}</td>
                  <td className="px-3 py-2">{s.department}</td>
                  <td className="px-3 py-2">{s.batch}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.year}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.semester}</td>
                  <td className="px-3 py-2">{s.gender}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.birthDate}</td>
                  <td className="px-3 py-2 font-medium">{s.age}</td>
                  <td className="px-3 py-2">{s.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.phone}</td>
                  <td className="min-w-48 px-3 py-2">{s.address}</td>
                  <td className="min-w-40 px-3 py-2">{s.clubs.join(", ")}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Link
                        to="/students/$studentId/edit"
                        params={{ studentId: s.studentId }}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        <Pencil /> Edit
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(s.studentId)}>
                        <Trash2 /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
