import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link href="/" className="font-semibold">
        AI Home Inspector
      </Link>
      <Button asChild variant="ghost">
        <a
          href="https://github.com/mamnasimjamaly"
          target="_blank"
          rel="noopener noreferrer"
        >
          Nasim&apos;s GitHub
        </a>
      </Button>
    </header>
  );
}
