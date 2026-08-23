import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Find problems before they become expensive.
      </h1>
      <p className="mt-4 max-w-lg text-muted-foreground">
        Take a photo of your home and AI will identify potential maintenance
        and repair issues.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/inspect">
          <Camera />
          Inspect My Home
        </Link>
      </Button>
      <p className="mt-10 text-sm text-muted-foreground">
        Deck • Walls • Roof • Exterior • Yard
      </p>
    </main>
  );
}
