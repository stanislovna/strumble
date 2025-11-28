import Link from "next/link";
import GlobeMap from "@/components/GlobeMap";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b">
        <div className="container-page h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">Strumble</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/submit/story">Add Story</Link>
            <Link href="/submit/trace">Add Trace</Link>
            <Link href="/moderation">Moderation</Link>
          </nav>
        </div>
      </header>

      <section className="flex-1">
        <div className="container-page py-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Discover life around the world</h1>
          <p className="mb-6 text-gray-500">Culture, not infrastructure.</p>

          {/* Карта здесь */}
          <GlobeMap />
        </div>
      </section>

      <footer className="border-t">
        <div className="container-page py-6 text-sm opacity-70 text-center">
          © Strumble 2025
        </div>
      </footer>
    </main>
  );
}
