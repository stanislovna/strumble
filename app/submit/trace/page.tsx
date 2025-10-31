"use client";

import { useState } from "react";

export default function SubmitTracePage() {
  const [url, setUrl] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Mock submit: " + url);
  };
  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">Submit a Trace (URL)</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          type="url"
          required
          className="w-full border rounded-lg p-2"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button className="border rounded-lg px-4 py-2">Submit (mock)</button>
      </form>
    </main>
  );
}
