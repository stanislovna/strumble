"use client";

import { useState } from "react";

export default function SubmitStoryPage() {
  const [text, setText] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Mock submit: " + text.slice(0, 40));
  };
  return (
    <main className="container-page py-10">
      <h1 className="text-2xl font-bold mb-6">Submit a Story</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <textarea
          className="w-full h-40 border rounded-lg p-2"
          placeholder="Write your story..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="border rounded-lg px-4 py-2">Submit (mock)</button>
      </form>
    </main>
  );
}
