"use client";

import { use } from "react";
import PollSliders, { PollInput } from "@/components/PollSliders";
import PollChart from "@/components/PollChart";
import { usePollResults, useSubmitPoll } from "@/lib/queries/polls";
import { useStories } from "@/lib/queries/stories";
import { useTraces } from "@/lib/queries/traces";
import StoryCard from "@/components/StoryCard";
import TraceCard from "@/components/TraceCard";

export default function PlacePage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const polls = usePollResults(id);
  const submitPoll = useSubmitPoll(id);

  const stories = useStories(id);
  const traces  = useTraces(id);

  const handleSubmit = (values: PollInput) => {
    submitPoll.mutate(values, { onSuccess: () => alert("✅ Mock poll submitted!") });
  };

  return (
    <main className="container-page py-8">
      <h1 className="text-3xl font-bold mb-6">Place #{id}</h1>

      {/* Polls + Chart */}
      <section className="grid gap-8 lg:grid-cols-2 mb-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Polls</h2>
          <PollSliders onSubmit={handleSubmit} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Poll Results</h2>
          {polls.isLoading || !polls.data ? (
            <div className="h-64 grid place-items-center border rounded-lg opacity-60">Loading…</div>
          ) : (
            <PollChart locals={polls.data.locals} travelers={polls.data.travelers} />
          )}
        </div>
      </section>

      {/* Stories */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Stories</h2>
        {stories.isLoading ? (
          <div className="opacity-60">Loading…</div>
        ) : (
          <div className="grid gap-4">
            {stories.data?.map((s) => <StoryCard key={s.id} story={s} />)}
          </div>
        )}
        <div className="mt-4">
          <a className="text-sm underline opacity-80" href="/submit/story">+ Add Story</a>
        </div>
      </section>

      {/* Traces */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Traces</h2>
        {traces.isLoading ? (
          <div className="opacity-60">Loading…</div>
        ) : (
          <div className="grid gap-4">
            {traces.data?.map((t) => <TraceCard key={t.id} trace={t} />)}
          </div>
        )}
        <div className="mt-4">
          <a className="text-sm underline opacity-80" href="/submit/trace">+ Add Trace</a>
        </div>
      </section>
    </main>
  );
}
