"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { APPLICANT_STATUS_LABELS, APPLICANT_STATUS_OPTIONS } from "@/lib/format";
import { Select } from "./ui";

export function StatusControl({
  applicantId,
  initialStatus,
}: {
  applicantId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  async function onChange(newStatus: string) {
    setStatus(newStatus);
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantId, status: newStatus }),
      });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        disabled={saving}
        onChange={(e) => onChange(e.target.value)}
        className="w-auto"
      >
        {APPLICANT_STATUS_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {APPLICANT_STATUS_LABELS[opt]}
          </option>
        ))}
      </Select>
      {saving && <span className="text-xs text-foreground/50">Saving…</span>}
    </div>
  );
}
