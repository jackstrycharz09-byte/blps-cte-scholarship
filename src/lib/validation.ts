import { z } from "zod";

export const MIN_UNWEIGHTED_GPA = 3.0;
export const MIN_ESSAY_WORDS = 250;
export const MAX_ESSAY_WORDS = 500;

export const RELATIONSHIP_OPTIONS = [
  "Teacher",
  "Counselor",
  "Employer",
  "Coach/Advisor",
  "Other",
] as const;

export const ESSAY_PROMPTS = [
  "How have CTE courses at your high school impacted your time in high school and your future plans?",
  "Describe a time in your life when you experienced hardship, and how you overcame it.",
  "How have you positively impacted your community?",
] as const;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

const essaySchema = z
  .string()
  .trim()
  .min(1, { error: "This essay is required." })
  .superRefine((val, ctx) => {
    const words = countWords(val);
    if (words < MIN_ESSAY_WORDS) {
      ctx.addIssue({
        code: "custom",
        message: `Essay must be at least ${MIN_ESSAY_WORDS} words (currently ${words}).`,
      });
    } else if (words > MAX_ESSAY_WORDS) {
      ctx.addIssue({
        code: "custom",
        message: `Essay must be at most ${MAX_ESSAY_WORDS} words (currently ${words}).`,
      });
    }
  });

const recommenderContactSchema = z.object({
  name: z.string().trim().min(2, { error: "Recommender name is required." }),
  email: z.email({ error: "Enter a valid email address." }),
});

export const applicationFormSchema = z
  .object({
    fullName: z.string().trim().min(2, { error: "Full name is required." }),
    email: z.email({ error: "Enter a valid email address." }),
    unweightedGpa: z.coerce
      .number({ error: "Enter your unweighted GPA." })
      .min(MIN_UNWEIGHTED_GPA, {
        error: `Unweighted GPA must be at least ${MIN_UNWEIGHTED_GPA.toFixed(1)} to submit.`,
      })
      .max(4.0, { error: "Unweighted GPA can't be greater than 4.0." }),
    weightedGpa: z.coerce
      .number({ error: "Enter your weighted GPA." })
      .min(0)
      .max(6.0, { error: "Enter a realistic weighted GPA." }),
    cteCoursework: z
      .string()
      .trim()
      .min(20, {
        error:
          "Describe your CTE coursework, internship, or project in more detail — it must represent at least one full year.",
      }),
    extracurriculars: z
      .string()
      .trim()
      .min(10, { error: "Tell us about your extracurricular activities." }),
    recommenders: z
      .tuple([recommenderContactSchema, recommenderContactSchema])
      .refine((r) => r[0].email.toLowerCase() !== r[1].email.toLowerCase(), {
        error: "The two recommenders must have different email addresses.",
      }),
    essay1: essaySchema,
    essay2: essaySchema,
    essay3: essaySchema,
  })
  .refine((data) => data.weightedGpa >= data.unweightedGpa, {
    error: "Weighted GPA is usually equal to or higher than unweighted GPA — please double-check.",
    path: ["weightedGpa"],
  });

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

export const RATING_TRAITS = [
  { key: "workEthic", label: "Work ethic" },
  { key: "reliability", label: "Reliability" },
  { key: "readiness", label: "Readiness for next steps" },
] as const;

const ratingsSchema = z
  .object({
    workEthic: z.coerce.number().int().min(1).max(5).optional(),
    reliability: z.coerce.number().int().min(1).max(5).optional(),
    readiness: z.coerce.number().int().min(1).max(5).optional(),
  })
  .partial();

// Whether a letter file was uploaded isn't known to this schema (multipart
// data) — the "text OR file" requirement is enforced in the API route once
// both are available.
export const recommenderFormSchema = z.object({
  name: z.string().trim().min(2, { error: "Your name is required." }),
  email: z.email({ error: "Enter a valid email address." }),
  relationship: z.enum(RELATIONSHIP_OPTIONS, {
    error: "Select your relationship to the applicant.",
  }),
  letterText: z.string().trim().optional(),
  ratings: ratingsSchema.optional(),
});

export type RecommenderFormValues = z.infer<typeof recommenderFormSchema>;

export const FILE_UPLOAD_LIMITS = {
  resume: { label: "Resume", accept: ["application/pdf"], maxSizeMb: 10 },
  transcript: { label: "Transcript", accept: ["application/pdf"], maxSizeMb: 10 },
  cte_proof: {
    label: "Proof of CTE coursework, internship, or project",
    accept: ["application/pdf", "image/png", "image/jpeg"],
    maxSizeMb: 10,
  },
  recommender_letter: { label: "Letter", accept: ["application/pdf"], maxSizeMb: 10 },
} as const;

export function validateUploadedFile(
  kind: keyof typeof FILE_UPLOAD_LIMITS,
  file: { type: string; size: number },
): string | null {
  const limits = FILE_UPLOAD_LIMITS[kind];
  if (!limits.accept.includes(file.type as never)) {
    return `${limits.label} must be a ${limits.accept.join(" or ")} file.`;
  }
  if (file.size > limits.maxSizeMb * 1024 * 1024) {
    return `${limits.label} must be smaller than ${limits.maxSizeMb}MB.`;
  }
  return null;
}
