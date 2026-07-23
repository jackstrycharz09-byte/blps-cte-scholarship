"use client";

import { countWords, MIN_ESSAY_WORDS, MAX_ESSAY_WORDS } from "@/lib/validation";
import { Label, TextArea, FieldError } from "./ui";

export function EssayField({
  id,
  label,
  prompt,
  value,
  error,
  registerProps,
}: {
  id: string;
  label: string;
  prompt: string;
  value: string;
  error?: string;
  registerProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}) {
  const words = countWords(value);
  const inRange = words >= MIN_ESSAY_WORDS && words <= MAX_ESSAY_WORDS;
  const empty = words === 0;

  return (
    <div>
      <Label htmlFor={id} required>
        {label}
      </Label>
      <p className="text-sm text-foreground/70 italic mb-2">&ldquo;{prompt}&rdquo;</p>
      <TextArea id={id} rows={10} {...registerProps} />
      <div className="mt-1 flex items-center justify-between text-sm">
        <span
          className={
            empty
              ? "text-foreground/50"
              : inRange
                ? "text-green-700"
                : "text-maroon-dark"
          }
        >
          {words} words (250–500 required)
        </span>
      </div>
      <FieldError message={error} />
    </div>
  );
}
