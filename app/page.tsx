import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const AREAS = [
  "Exterior",
  "Living Room",
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Backyard",
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <section className="w-full max-w-xl rounded-lg bg-card/80 p-8 shadow-sm ring-1 ring-foreground/10 backdrop-blur-xl sm:p-10">
        <p className="text-sm text-muted-foreground">Home</p>
        <h1 className="mt-1 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Find problems before they become expensive.
        </h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Take a photo of your home and AI will identify potential maintenance
          and repair issues.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-sm px-5">
          <Link href="/home">
            <Camera />
            Inspect my home
          </Link>
        </Button>
        <ul className="mt-8 flex flex-wrap gap-2">
          {AREAS.map((area) => (
            <li
              key={area}
              className="rounded-sm border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground"
            >
              {area}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
