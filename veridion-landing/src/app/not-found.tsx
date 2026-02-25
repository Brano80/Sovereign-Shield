import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white px-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-zinc-400 mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="text-sky-400 hover:text-sky-300 underline"
      >
        Back to Veridion Nexus
      </Link>
    </div>
  );
}
