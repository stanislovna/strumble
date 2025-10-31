"use client";

import { useState } from "react";

const questions = [
  "Helpfulness",
  "Safety",
  "Openness",
  "Tradition vs. Modern",
  "Pace of life",
  "Individual vs. Community",
  "Hospitality",
  "Equality vs. Hierarchy",
  "Importance of Religion",
  "Trust among people",
];

export type PollInput = number[]; // 10 значений 1–7

export default function PollSliders({
  onSubmit,
}: { onSubmit?: (values: PollInput) => void }) {
  const [values, setValues] = useState<number[]>(Array(10).fill(4));

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <label key={i} className="block">
          <div className="mb-1 text-sm">{q}</div>
          <input
            type="range"
            min={1}
            max={7}
            aria-label={q}
            value={values[i]}
            onChange={(e) => {
              const next = [...values];
              next[i] = Number(e.target.value);
              setValues(next);
            }}
            className="w-full"
          />
          <div className="text-xs opacity-60">Value: {values[i]}</div>
        </label>
      ))}
      <button
        onClick={() => onSubmit?.(values)}
        className="mt-2 border rounded-lg px-3 py-2 text-sm"
      >
        Submit (mock)
      </button>
    </div>
  );
}
