export type Trace = {
  id: string;
  placeId: string;
  url: string;
  host: string;
  title: string;
  description?: string;
  image?: string;
  createdAt: string;
};

export default function TraceCard({ trace }: { trace: Trace }) {
  return (
    <a className="border rounded-xl p-4 block hover:bg-white/5 transition"
       href={trace.url} target="_blank" rel="noreferrer">
      <div className="text-sm opacity-60 mb-1">
        {trace.host} • {new Date(trace.createdAt).toLocaleDateString()}
      </div>
      <div className="font-semibold">{trace.title}</div>
      {trace.description && (
        <p className="opacity-80 text-sm mt-1 line-clamp-2">{trace.description}</p>
      )}
    </a>
  );
}
