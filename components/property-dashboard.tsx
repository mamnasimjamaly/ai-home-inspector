"use client";

import Link from "next/link";
import {
  Bath,
  BedDouble,
  ChefHat,
  House,
  Sofa,
  Trees,
} from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { FindingCard } from "@/components/finding-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ROOMS,
  formatCadRange,
  issueCountLabel,
  type Priority,
  type RoomSlug,
} from "@/lib/inspection";
import {
  allFindings,
  costRangeFor,
  findingsForRoom,
  useProperty,
} from "@/lib/property-store";

const roomIcons: Record<RoomSlug, typeof House> = {
  exterior: House,
  "living-room": Sofa,
  kitchen: ChefHat,
  bathroom: Bath,
  bedroom: BedDouble,
  backyard: Trees,
};

const priorityDot: Record<Priority, string> = {
  critical: "bg-red-600",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-emerald-500",
};

export function PropertyDashboard() {
  const { scans } = useProperty();
  const ranked = allFindings(scans);
  const totalCost = costRangeFor(ranked);
  const totalCostLabel = totalCost
    ? formatCadRange(totalCost.min, totalCost.max)
    : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-8">
      <div>
        <p className="text-sm text-muted-foreground">Property</p>
        <h1 className="text-2xl font-semibold tracking-tight">My Home</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan each area while you walk. Findings stay on this device.
        </p>
      </div>

      <Disclaimer />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Rooms
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-lg bg-card/90 ring-1 ring-foreground/10 backdrop-blur-xl">
          {ROOMS.map((room) => {
            const Icon = roomIcons[room.slug];
            const count = findingsForRoom(scans, room.slug).length;
            return (
              <li key={room.slug}>
                <Link
                  href={"/rooms/" + room.slug}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/70"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-5 text-primary" />
                    <span className="font-medium">{room.name}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {issueCountLabel(count)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Repair priority
        </h2>
        {ranked.length === 0 ? (
          <Card size="sm">
            <CardHeader>
              <CardTitle>No findings yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Open a room and start a scan to build this list.
              </p>
              <Button asChild className="mt-3 rounded-sm" size="sm">
                <Link href="/rooms/exterior/scan">Scan exterior</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ol className="space-y-3">
            {ranked.map((finding, index) => (
              <li key={finding.id + finding.room} className="flex gap-3">
                <span
                  className={
                    "mt-3 size-2.5 shrink-0 rounded-full " +
                    priorityDot[finding.priority]
                  }
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <FindingCard finding={finding} rank={index + 1} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ROOMS.find((room) => room.slug === finding.room)?.name}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      {totalCostLabel ? (
        <p className="text-sm text-muted-foreground">
          Combined estimated repair range: {totalCostLabel}. These ranges are
          guesses from photos, not quotes.
        </p>
      ) : null}
    </main>
  );
}
