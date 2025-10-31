export type Story = {
  id: string;
  placeId: string;
  title: string;
  text: string;
  author?: string;
  createdAt: string; // ISO
};

export default function StoryCard({ story }: { story: Story }) {
  return (
    <article className="border rounded-xl p-4">
      <div className="text-xs opacity-60">
        {story.author ?? "Anonymous"} • {new Date(story.createdAt).toLocaleDateString()}
      </div>
      <h3 className="font-semibold mt-1 mb-2">{story.title}</h3>
      <p className="opacity-80 text-sm whitespace-pre-line">{story.text}</p>
    </article>
  );
}
