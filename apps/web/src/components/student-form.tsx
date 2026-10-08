import { Button } from "@student-management/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@student-management/ui/components/card";
import { Checkbox } from "@student-management/ui/components/checkbox";
import { Input } from "@student-management/ui/components/input";
import { Label } from "@student-management/ui/components/label";
import { Textarea } from "@student-management/ui/components/textarea";
import { cn } from "@student-management/ui/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  BATCHES,
  CLUBS,
  DEPARTMENTS,
  GENDERS,
  MAX_IMAGE_BYTES,
  SEMESTERS,
  YEARS,
  emptyStudent,
  studentSchema,
  type StudentInput,
} from "@/lib/student";

import { Captcha, generateCaptcha } from "./captcha";

type Errors = Partial<Record<keyof StudentInput | "captcha" | "terms", string>>;

type StudentFormProps = {
  mode: "create" | "edit";
  initialValues?: StudentInput;
  onSubmit: (values: StudentInput) => Promise<void>;
};

export function StudentForm({ mode, initialValues = emptyStudent, onSubmit }: StudentFormProps) {
  const [values, setValues] = useState<StudentInput>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Generated on the client only, so server and client HTML match.
  useEffect(() => setCaptcha(generateCaptcha()), []);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const set = <K extends keyof StudentInput>(key: K, value: StudentInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleClub = (club: string, checked: boolean) =>
    set("clubs", checked ? [...values.clubs, club] : values.clubs.filter((c) => c !== club));

  const handleImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Choose an image file" }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((prev) => ({ ...prev, image: "Image must be 1 MB or smaller" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = studentSchema.safeParse(values);
    const nextErrors: Errors = {};
    if (!result.success) {
      for (const [key, messages] of Object.entries(z.flattenError(result.error).fieldErrors)) {
        nextErrors[key as keyof StudentInput] = (messages as string[])[0];
      }
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      nextErrors.captcha = "Captcha does not match. Try the new one.";
    }
    if (mode === "create" && !acceptedTerms) {
      nextErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(nextErrors);
    if (!result.success || Object.keys(nextErrors).length > 0) {
      if (nextErrors.captcha) refreshCaptcha();
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <Section title="Personal Information">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="First Name" htmlFor="firstName" error={errors.firstName} required>
            <Input
              id="firstName"
              value={values.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              aria-invalid={!!errors.firstName}
            />
          </Field>
          <Field label="Middle Name" htmlFor="middleName" error={errors.middleName} hint="Optional">
            <Input
              id="middleName"
              value={values.middleName}
              onChange={(e) => set("middleName", e.target.value)}
            />
          </Field>
          <Field label="Last Name" htmlFor="lastName" error={errors.lastName} required>
            <Input
              id="lastName"
              value={values.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              aria-invalid={!!errors.lastName}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Birth Date" htmlFor="birthDate" error={errors.birthDate} required>
            <Input
              id="birthDate"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={values.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
              aria-invalid={!!errors.birthDate}
              className="scheme-light dark:scheme-dark"
            />
          </Field>
          <Field label="Gender" error={errors.gender} required>
            <div role="radiogroup" aria-label="Gender" className="flex h-8 items-center gap-5">
              {GENDERS.map((gender) => (
                <Label key={gender} className="cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={values.gender === gender}
                    onChange={() => set("gender", gender)}
                    className="size-4 accent-primary"
                  />
                  {gender}
                </Label>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Photo" htmlFor="image" error={errors.image} required hint="JPG or PNG, up to 1 MB">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden border border-input bg-muted/40 text-muted-foreground">
              {values.image ? (
                <img src={values.image} alt="Selected photo" className="size-full object-cover" />
              ) : (
                <span>No photo</span>
              )}
            </div>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files?.[0])}
              aria-invalid={!!errors.image}
              className="h-auto py-1.5"
            />
          </div>
        </Field>
      </Section>

      <Section title="Academic Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Student ID"
            htmlFor="studentId"
            error={errors.studentId}
            required
            hint={mode === "edit" ? "Student ID is the primary key and can't be changed" : undefined}
          >
            <Input
              id="studentId"
              value={values.studentId}
              onChange={(e) => set("studentId", e.target.value)}
              disabled={mode === "edit"}
              placeholder="e.g. 221-15-1234"
              aria-invalid={!!errors.studentId}
            />
          </Field>
          <Field label="Department" htmlFor="department" error={errors.department} required>
            <Select
              id="department"
              value={values.department}
              options={DEPARTMENTS}
              placeholder="Select department"
              invalid={!!errors.department}
              onChange={(v) => set("department", v)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Batch" htmlFor="batch" error={errors.batch} required>
            <Select
              id="batch"
              value={values.batch}
              options={BATCHES}
              placeholder="Select batch"
              invalid={!!errors.batch}
              onChange={(v) => set("batch", v)}
            />
          </Field>
          <Field label="Year" htmlFor="year" error={errors.year} required>
            <Select
              id="year"
              value={values.year}
              options={YEARS}
              placeholder="Select year"
              invalid={!!errors.year}
              onChange={(v) => set("year", v)}
            />
          </Field>
          <Field label="Semester" htmlFor="semester" error={errors.semester} required>
            <Select
              id="semester"
              value={values.semester}
              options={SEMESTERS}
              placeholder="Select semester"
              invalid={!!errors.semester}
              onChange={(v) => set("semester", v)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Contact Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email" error={errors.email} required>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
            />
          </Field>
          <Field label="Phone Number" htmlFor="phone" error={errors.phone} required>
            <Input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="01XXXXXXXXX"
              aria-invalid={!!errors.phone}
            />
          </Field>
        </div>
        <Field label="Address" htmlFor="address" error={errors.address} required>
          <Textarea
            id="address"
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            aria-invalid={!!errors.address}
          />
        </Field>
      </Section>

      <Section title="Club Membership" description="Select all clubs you are a member of.">
        <Field error={errors.clubs}>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {CLUBS.map((club) => (
              <Label key={club} className="cursor-pointer">
                <Checkbox
                  checked={values.clubs.includes(club)}
                  onCheckedChange={(checked) => toggleClub(club, checked)}
                />
                {club}
              </Label>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Verification">
        <Field label="Captcha" htmlFor="captcha" error={errors.captcha} required hint="Type the characters shown in the image">
          <div className="flex flex-wrap items-center gap-3">
            <Captcha code={captcha} onRefresh={refreshCaptcha} />
            <Input
              id="captcha"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value);
                setErrors((prev) => ({ ...prev, captcha: undefined }));
              }}
              autoComplete="off"
              className="w-40 uppercase"
              aria-invalid={!!errors.captcha}
            />
          </div>
        </Field>
        {mode === "create" && (
          <Field error={errors.terms}>
            <Label className="cursor-pointer">
              <Checkbox
                checked={acceptedTerms}
                onCheckedChange={(checked) => {
                  setAcceptedTerms(checked);
                  setErrors((prev) => ({ ...prev, terms: undefined }));
                }}
                aria-invalid={!!errors.terms}
              />
              I confirm the information above is correct and I accept the terms and conditions.
            </Label>
          </Field>
        )}
      </Section>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={submitting} className="min-w-32">
          {submitting && <Loader2 className="animate-spin" />}
          {mode === "create" ? "Submit" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid content-start gap-1.5">
      {label && (
        <Label htmlFor={htmlFor} className="font-medium">
          {label}
          {required && <span className="-ml-1.5 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function Select({
  id,
  value,
  options,
  placeholder,
  invalid,
  onChange,
}: {
  id: string;
  value: string;
  options: string[];
  placeholder: string;
  invalid?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={invalid}
      className={cn(
        "h-8 w-full border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30",
        !value && "text-muted-foreground",
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option} className="bg-popover text-popover-foreground">
          {option}
        </option>
      ))}
    </select>
  );
}
