// lib/api.ts

// --- helpers ---
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rnd = (a = 300, b = 600) => Math.floor(Math.random() * (b - a)) + a;

// --- Polls ---
export async function getPollResults(placeId: string) {
  await delay(rnd());
  return {
    labels: [
      "Helpfulness","Safety","Openness","Trad/Modern","Pace",
      "Indiv/Comm","Hospitality","Equality","Religion","Trust",
    ],
    locals:     [4,5,4,3,4,5,4,3,2,4],
    travelers:  [5,4,5,4,4,4,5,4,3,4],
  };
}

export async function postPoll(placeId: string, values: number[]) {
  await delay(rnd());
  console.log("📤 mock POST poll", placeId, values);
  return { ok: true };
}

// --- In-memory mock DB ---
type Story = {
  id: string; placeId: string; title: string; text: string;
  author?: string; createdAt: string;
};
type Trace = {
  id: string; placeId: string; url: string; host: string;
  title: string; description?: string; image?: string; createdAt: string;
};

const memory = {
  stories: <Story[]>[
    {
      id: "s1", placeId: "1",
      title: "A moment I won’t forget",
      text: "In 2017 we were more than thirty people who wanted to fight the drugs in our town...",
      author: "Local", createdAt: new Date().toISOString(),
    },
    {
      id: "s2", placeId: "1",
      title: "When someone helped me",
      text: "We blocked the road so people would listen. The police came with a truck…",
      createdAt: new Date().toISOString(),
    },
  ],
  traces: <Trace[]>[
    {
      id: "t1", placeId: "1",
      url: "https://kathmandupost.com", host: "kathmandupost.com",
      title: "Old folks lonely but happy…",
      description: "Preview description…",
      createdAt: new Date().toISOString(),
    },
    {
      id: "t2", placeId: "1",
      url: "https://dawn.com", host: "dawn.com",
      title: "World Water Day serves a reminder…",
      description: "Preview description…",
      createdAt: new Date().toISOString(),
    },
  ],
};

// --- Stories ---
export async function getStories(placeId: string) {
  await delay(rnd());
  return memory.stories.filter((s) => s.placeId === placeId);
}

export async function postStory(input: Omit<Story,"id"|"createdAt">) {
  await delay(rnd());
  const item: Story = {
    ...input,
    id: `s${Math.random().toString(36).slice(2,8)}`,
    createdAt: new Date().toISOString(),
  };
  memory.stories.unshift(item);
  return item;
}

// --- Traces ---
export async function getTraces(placeId: string) {
  await delay(rnd());
  return memory.traces.filter((t) => t.placeId === placeId);
}

export async function postTrace(input: Omit<Trace,"id"|"createdAt"|"host">) {
  await delay(rnd());
  const url = new URL(input.url);
  const item: Trace = {
    ...input,
    host: url.host,
    id: `t${Math.random().toString(36).slice(2,8)}`,
    createdAt: new Date().toISOString(),
  };
  memory.traces.unshift(item);
  return item;
}
