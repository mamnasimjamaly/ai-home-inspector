import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/80 bg-card/70 px-2 backdrop-blur-xl">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-semibold hover:bg-muted"
      >
        <Home className="size-4 text-primary" />
        AI Home Inspector
      </Link>
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm" className="rounded-sm">
          <Link href="/home">My Home</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="rounded-sm">
          <a
            href="https://github.com/mamnasimjamaly"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </Button>
      </div>
    </header>
  );
}
