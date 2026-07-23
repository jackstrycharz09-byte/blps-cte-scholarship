"use client";

import { useState } from "react";
import { Card, Field, TextInput, TextArea, Button, FieldError } from "./ui";

export function ReviewForm({
  applicantId,
  initialScore,
  initialComments,
}: {
  applicantId: string;
  initialScore: number | null;
  initialComments: string | null;
}) {
  const [score, setScore] = useState(initialScore != null ? String(initialScore) : "");
  const [comments, setComments] = useState(initialComments ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantId,
          score: score === "" ? null : Number(score),
          comments,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't save your review.");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save your review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-maroon">Your review</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Score (1-10)" htmlFor="score">
          <TextInput
            id="score"
            type="number"
            min={1}
            max={10}
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
        </Field>
        <Field label="Comments" htmlFor="comments">
          <TextArea
            id="comments"
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </Field>
        <FieldError message={error ?? undefined} />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save review"}
          </Button>
          {saved && <span className="text-sm text-green-700">Saved</span>}
        </div>
      </form>
    </Card>
  );
}
