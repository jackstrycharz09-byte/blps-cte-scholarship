"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { z } from "zod";
import {
  applicationFormSchema,
  ApplicationFormValues,
  ESSAY_PROMPTS,
  FILE_UPLOAD_LIMITS,
  validateUploadedFile,
} from "@/lib/validation";
import { Card, Field, TextInput, TextArea, Button } from "./ui";
import { EssayField } from "./EssayField";
import { FileUploadField } from "./FileUploadField";

type FileState = {
  resume: File | null;
  transcript: File | null;
  cte_proof: File | null;
};

// GPA fields are coerced string -> number by the schema, so the form's
// *input* shape (what <input> elements produce) differs from its *output*
// shape (ApplicationFormValues, after zod coercion runs in the resolver).
type ApplicationFormInput = z.input<typeof applicationFormSchema>;

export function ApplicationForm() {
  const router = useRouter();
  // Honeypot: invisible to real users, but a basic bot filling every field
  // will trip it. Checked client-side (skip the request) and server-side
  // (the only check that matters for bots that skip the browser entirely).
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileState>({
    resume: null,
    transcript: null,
    cte_proof: null,
  });
  const [fileErrors, setFileErrors] = useState<Partial<Record<keyof FileState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormInput, unknown, ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      recommenders: [
        { name: "", email: "" },
        { name: "", email: "" },
      ],
    },
  });

  const essay1 = watch("essay1") ?? "";
  const essay2 = watch("essay2") ?? "";
  const essay3 = watch("essay3") ?? "";

  function validateFiles(): boolean {
    const nextErrors: Partial<Record<keyof FileState, string>> = {};
    (Object.keys(FILE_UPLOAD_LIMITS) as (keyof typeof FILE_UPLOAD_LIMITS)[])
      .filter((k) => k !== "recommender_letter")
      .forEach((kind) => {
        const key = kind as keyof FileState;
        const file = files[key];
        if (!file) {
          nextErrors[key] = `${FILE_UPLOAD_LIMITS[kind].label} is required.`;
          return;
        }
        const err = validateUploadedFile(kind, file);
        if (err) nextErrors[key] = err;
      });
    setFileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (honeypotRef.current?.value) {
      router.push("/apply/success");
      return;
    }

    const filesOk = validateFiles();
    if (!filesOk) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("fullName", values.fullName);
      formData.set("email", values.email);
      formData.set("unweightedGpa", String(values.unweightedGpa));
      formData.set("weightedGpa", String(values.weightedGpa));
      formData.set("cteCoursework", values.cteCoursework);
      formData.set("extracurriculars", values.extracurriculars);
      formData.set("essay1", values.essay1);
      formData.set("essay2", values.essay2);
      formData.set("essay3", values.essay3);
      formData.set("recommender1Name", values.recommenders[0].name);
      formData.set("recommender1Email", values.recommenders[0].email);
      formData.set("recommender2Name", values.recommenders[1].name);
      formData.set("recommender2Email", values.recommenders[1].email);
      formData.set("resume", files.resume as File);
      formData.set("transcript", files.transcript as File);
      formData.set("cte_proof", files.cte_proof as File);

      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong submitting your application.");
      }

      router.push("/apply/success");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <input
        ref={honeypotRef}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px overflow-hidden"
      />
      <Card className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-maroon">Your information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
            <TextInput id="fullName" {...register("fullName")} />
          </Field>
          <Field label="Email" htmlFor="email" required error={errors.email?.message}>
            <TextInput id="email" type="email" {...register("email")} />
          </Field>
          <Field
            label="Unweighted GPA"
            htmlFor="unweightedGpa"
            required
            hint="Minimum 3.0 required to submit"
            error={errors.unweightedGpa?.message}
          >
            <TextInput
              id="unweightedGpa"
              type="number"
              step="0.01"
              min="0"
              max="4"
              {...register("unweightedGpa")}
            />
          </Field>
          <Field
            label="Weighted GPA"
            htmlFor="weightedGpa"
            required
            error={errors.weightedGpa?.message}
          >
            <TextInput
              id="weightedGpa"
              type="number"
              step="0.01"
              min="0"
              max="6"
              {...register("weightedGpa")}
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-maroon">CTE background</h2>
        <Field
          label="CTE coursework, internship, or project"
          htmlFor="cteCoursework"
          required
          hint="Must represent at least one full year. CTE coursework is strongly recommended, but a year-long CTE-related internship or project also qualifies."
          error={errors.cteCoursework?.message}
        >
          <TextArea id="cteCoursework" rows={4} {...register("cteCoursework")} />
        </Field>
        <Field
          label="Extracurricular activities"
          htmlFor="extracurriculars"
          required
          error={errors.extracurriculars?.message}
        >
          <TextArea id="extracurriculars" rows={4} {...register("extracurriculars")} />
        </Field>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-maroon">Required documents</h2>
        <FileUploadField
          id="resume"
          label="Resume"
          accept="application/pdf"
          hint="PDF only"
          file={files.resume}
          onChange={(f) => setFiles((s) => ({ ...s, resume: f }))}
          error={fileErrors.resume}
        />
        <FileUploadField
          id="transcript"
          label="Transcript"
          accept="application/pdf"
          hint="PDF only"
          file={files.transcript}
          onChange={(f) => setFiles((s) => ({ ...s, transcript: f }))}
          error={fileErrors.transcript}
        />
        <FileUploadField
          id="cte_proof"
          label="Proof of CTE coursework, internship, or project"
          accept="application/pdf,image/png,image/jpeg"
          hint="PDF or image"
          file={files.cte_proof}
          onChange={(f) => setFiles((s) => ({ ...s, cte_proof: f }))}
          error={fileErrors.cte_proof}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-maroon">Recommenders</h2>
        <p className="text-sm text-foreground/70">
          Each recommender will automatically be emailed a unique link to submit their letter once you
          submit this application.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Recommender 1 name"
            htmlFor="recommender0Name"
            required
            error={errors.recommenders?.[0]?.name?.message}
          >
            <TextInput id="recommender0Name" {...register("recommenders.0.name")} />
          </Field>
          <Field
            label="Recommender 1 email"
            htmlFor="recommender0Email"
            required
            error={errors.recommenders?.[0]?.email?.message}
          >
            <TextInput id="recommender0Email" type="email" {...register("recommenders.0.email")} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 border-t border-maroon/10 pt-4">
          <Field
            label="Recommender 2 name"
            htmlFor="recommender1Name"
            required
            error={errors.recommenders?.[1]?.name?.message}
          >
            <TextInput id="recommender1Name" {...register("recommenders.1.name")} />
          </Field>
          <Field
            label="Recommender 2 email"
            htmlFor="recommender1Email"
            required
            error={errors.recommenders?.[1]?.email?.message}
          >
            <TextInput id="recommender1Email" type="email" {...register("recommenders.1.email")} />
          </Field>
        </div>
        <FieldRootError message={(errors.recommenders as { message?: string } | undefined)?.message} />
      </Card>

      <Card className="space-y-8">
        <h2 className="font-heading text-lg font-bold text-maroon">Essays</h2>
        <EssayField
          id="essay1"
          label="Essay 1"
          prompt={ESSAY_PROMPTS[0]}
          value={essay1}
          error={errors.essay1?.message}
          registerProps={register("essay1")}
        />
        <EssayField
          id="essay2"
          label="Essay 2"
          prompt={ESSAY_PROMPTS[1]}
          value={essay2}
          error={errors.essay2?.message}
          registerProps={register("essay2")}
        />
        <EssayField
          id="essay3"
          label="Essay 3"
          prompt={ESSAY_PROMPTS[2]}
          value={essay3}
          error={errors.essay3?.message}
          registerProps={register("essay3")}
        />
      </Card>

      {submitError && (
        <p className="rounded-md border border-maroon/30 bg-maroon/5 px-4 py-3 text-sm text-maroon-dark">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}

function FieldRootError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-maroon-dark">{message}</p>;
}
