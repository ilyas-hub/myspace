import Link from "next/link";
import { BrandMark } from "./brand-mark";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <BrandMark />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        This page went offline
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
        The profile you&apos;re looking for doesn&apos;t exist or has been
        removed.
      </p>
      <Link
        href="/"
        className="btn-primary px-5 py-2.5"
      >
        Back to MySpace
      </Link>
    </main>
  );
}
