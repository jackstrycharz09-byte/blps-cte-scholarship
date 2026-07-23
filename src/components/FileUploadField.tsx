"use client";

import { Label, FieldError } from "./ui";

export function FileUploadField({
  id,
  label,
  accept,
  hint,
  file,
  onChange,
  error,
}: {
  id: string;
  label: string;
  accept: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} required>
        {label}
      </Label>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-foreground/80 file:mr-4 file:rounded-md file:border-0 file:bg-maroon file:px-3 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:bg-maroon-dark"
      />
      {hint && !error && <p className="mt-1 text-xs text-foreground/60">{hint}</p>}
      {file && <p className="mt-1 text-xs text-foreground/70">Selected: {file.name}</p>}
      <FieldError message={error} />
    </div>
  );
}
