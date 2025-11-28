"use client";

import { use } from "react";
import StrumbleMap from "@/components/Map";
import PollSliders, { PollInput } from "@/components/PollSliders";
import PollChart from "@/components/PollChart";
import { usePollResults, useSubmitPoll } from "@/lib/queries/polls";
import { useStories } from "@/lib/queries/stories";
import { useTraces } from "@/lib/queries/traces";
import StoryCard from "@/components/StoryCard";
import TraceCard from "@/components/TraceCard";

export default function PlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Моки данных как будто с бэка
  const placeName = mockPlaceName(id); // просто для заголовка
  const polls = usePollResults(id);
  const submitPoll = useSubmitPoll(id);
  const stories = useStories(id);
  const traces = useTraces(id);

  const handleSubmit = (values: PollInput) => {
    submitPoll.mutate(values, {
      onSuccess: () => alert("✅ Mock poll submitted!"),
    });
  };

  return (
    <main className="container-page py-8">
      {/* ─────────────────── Hero c картой ─────────────────── */}
      <section className="mb-10">
        <div className="relative rounded-2xl border overflow-hidden">
          {/* Карта как фон */}
          <div className="h-[42vh] md:h-[56vh]">
            {/* Если карта «тяжёлая», можно временно заменить на div с градиентом */}
            <StrumbleMap />
          </div>

          {/* Тёмный градиент для читаемости текста */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />

          {/* Заголовок поверх карты */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <p className="text-base md:text-lg opacity-90">How’s life in</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
              {placeName}?
            </h1>

            {/* Узкая «капсула» под заголовком — как на мокапе */}
            <div className="mt-6 w-[min(720px,90%)]">
              <div className="h-10 rounded-full border flex items-center justify-between px-4 text-sm opacity-80">
                <span>STRUMBLE</span>
                <span aria-hidden>⟶</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── Polls + Chart ─────────────────── */}
      <section className="grid gap-8 lg:grid-cols-2 mb-12">
        <div className="rounded-2xl border p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Polls</h2>
          <PollSliders onSubmit={handleSubmit} />
        </div>

        <div className="rounded-2xl border p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Poll Results</h2>
          {polls.isLoading || !polls.data ? (
            <div className="h-64 grid place-items-center rounded-lg opacity-60">
              Loading…
            </div>
          ) : (
            <PollChart locals={polls.data.locals} travelers={polls.data.travelers} />
          )}
        </div>
      </section>

      {/* ─────────────────── Stories Teasers ─────────────────── */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Stories from {placeName}</h2>

        {stories.isLoading ? (
          <div className="opacity-60">Loading…</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* Тизер-кард под визу из макета: верхний «фото»-блок + контент */}
            {stories.data?.map((s) => (
              <div key={s.id} className="rounded-2xl border overflow-hidden">
                {/* «Фото» заглушка (можно заменить реальным полем photo) */}
                <div className="h-40 bg-gradient-to-br from-neutral-800 to-neutral-700" />
                <div className="p-4">
                  {/* теги-чипсы / категории можно придумать позже */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[11px] px-2 py-0.5 rounded-full border opacity-80">
                      STORY
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border opacity-60">
                      {placeName}
                    </span>
                  </div>

                  {/* Внутри — уже готовая карточка StoryCard (текст/дата/автор) */}
                  <StoryCard story={s} />
                  <div className="mt-3">
                    <a className="text-sm underline opacity-80" href="#">
                      READ STRUMBLE
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Если историй мало — добавим пустые «фреймы» для симметрии */}
            {Array.from({ length: Math.max(0, 3 - (stories.data?.length ?? 0)) }).map(
              (_, i) => (
                <div
                  key={`ghost-${i}`}
                  className="rounded-2xl border border-dashed opacity-30 h-[320px]"
                />
              )
            )}
          </div>
        )}

        <div className="mt-5">
          <a className="text-sm underline opacity-80" href="/submit/story">
            + Add Story
          </a>
        </div>
      </section>

      {/* ─────────────────── Traces (ссылочные карточки) ─────────────────── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4">Traces</h2>

        {traces.isLoading ? (
          <div className="opacity-60">Loading…</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {traces.data?.map((t) => (
              <div key={t.id} className="rounded-2xl border overflow-hidden">
                <div className="h-24 bg-gradient-to-tr from-neutral-800 to-neutral-700" />
                <div className="p-4">
                  <TraceCard trace={t} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5">
          <a className="text-sm underline opacity-80" href="/submit/trace">
            + Add Trace
          </a>
        </div>
      </section>
    </main>
  );
}

/** простая заглушка названия — до реального бэка */
function mockPlaceName(id: string) {
  const map: Record<string, string> = {
    "1": "Negrar Valpolicella",
    "2": "Cape Town",
    "3": "Tbilisi",
  };
  return map[id] ?? `Place #${id}`;
}
