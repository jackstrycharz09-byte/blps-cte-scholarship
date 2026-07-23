"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui";

export function PublishDecisionsButton({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function onConfirm() {
    setPublishing(true);
    setResult(null);
    try {
      const res = await fetch("/api/dashboard/publish-decisions", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Couldn't publish decisions.");
      setResult(`Emailed ${body.published} applicant${body.published === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConfirming(false);
      setPublishing(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {confirming ? (
        <>
          <span className="text-sm text-foreground/70">
            Email {pendingCount} applicant{pendingCount === 1 ? "" : "s"} their decision now?
          </span>
          <Button onClick={onConfirm} disabled={publishing}>
            {publishing ? "Publishing…" : "Confirm"}
          </Button>
          <Button variant="secondary" onClick={() => setConfirming(false)} disabled={publishing}>
            Cancel
          </Button>
        </>
      ) : (
        <Button
          variant="secondary"
          disabled={pendingCount === 0}
          onClick={() => setConfirming(true)}
        >
          {pendingCount === 0 ? "No decisions to publish" : `Publish decisions (${pendingCount})`}
        </Button>
      )}
      {result && <span className="text-sm text-foreground/70">{result}</span>}
    </div>
  );
}
