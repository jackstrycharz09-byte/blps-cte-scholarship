"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RELATIONSHIP_OPTIONS, RATING_TRAITS, validateUploadedFile } from "@/lib/validation";
import { Card, Field, Label, TextInput, TextArea, Select, Button, FieldError } from "./ui";

type LetterMode = "text" | "file";

export function RecommenderForm({
  token,
  applicantName,
  defaultName,
  defaultEmail,
}: {
  token: string;
  applicantName: string;
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [relationship, setRelationship] = useState("");
  const [letterMode, setLetterMode] = useState<LetterMode>("text");
  const [letterText, setLetterText] = useState("");
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Your name and email are required.");
      return;
    }
    if (!relationship) {
      setError("Select your relationship to the applicant.");
      return;
    }
    if (letterMode === "text" && !letterText.trim()) {
      setError("Paste your letter text, or switch to uploading a PDF.");
      return;
    }
    if (letterMode === "file") {
      if (!letterFile) {
        setError("Upload a PDF, or switch to pasting letter text.");
        return;
      }
      const fileErr = validateUploadedFile("recommender_letter", letterFile);
      if (fileErr) {
        setError(fileErr);
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("email", email.trim());
      formData.set("relationship", relationship);
      if (letterMode === "text") {
        formData.set("letterText", letterText.trim());
      } else if (letterFile) {
        formData.set("letterFile", letterFile);
      }
      for (const trait of RATING_TRAITS) {
        if (ratings[trait.key]) formData.set(`rating_${trait.key}`, ratings[trait.key]);
      }

      const res = await fetch(`/api/recommend/${token}`, { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong submitting your letter.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="space-y-4">
        <p className="text-sm text-foreground/70">
          {`Please note: at least one recommender for ${applicantName} should ideally be a teacher. This is informational only — it isn’t enforced if you’re a different relationship.`}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="rec-name" required>
            <TextInput id="rec-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Your email" htmlFor="rec-email" required>
            <TextInput
              id="rec-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Relationship to applicant" htmlFor="rec-relationship" required>
          <Select
            id="rec-relationship"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          >
            <option value="">Select one&hellip;</option>
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-maroon">Letter of recommendation</h2>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={letterMode === "text"}
              onChange={() => setLetterMode("text")}
            />
            Paste text
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={letterMode === "file"}
              onChange={() => setLetterMode("file")}
            />
            Upload PDF
          </label>
        </div>
        {letterMode === "text" ? (
          <TextArea
            rows={12}
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            placeholder="Write or paste your letter of recommendation here."
          />
        ) : (
          <div>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setLetterFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-foreground/80 file:mr-4 file:rounded-md file:border-0 file:bg-maroon file:px-3 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:bg-maroon-dark"
            />
            {letterFile && <p className="mt-1 text-xs text-foreground/70">Selected: {letterFile.name}</p>}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-maroon">Quick-scan ratings (optional)</h2>
        <p className="text-sm text-foreground/70">
          Give the committee a fast signal alongside your full letter.
        </p>
        {RATING_TRAITS.map((trait) => (
          <div key={trait.key}>
            <Label>{trait.label}</Label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    name={`rating_${trait.key}`}
                    checked={ratings[trait.key] === String(n)}
                    onChange={() => setRatings((r) => ({ ...r, [trait.key]: String(n) }))}
                  />
                  {n}
                </label>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <FieldError message={error ?? undefined} />

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit letter"}
      </Button>
    </form>
  );
}
