"use client";

import Link from "next/link";
import { Video } from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { FindingCard } from "@/components/finding-card";
import { Button } from "@/components/ui/button";
import { formatCadRange, issueCountLabel, type RoomName, type RoomSlug } from "@/lib/inspection";
import { costRangeFor, findingsForRoom, useProperty } from "@/lib/property-store";

export function RoomDetail({
  room,
  roomName,
}: {
  room: RoomSlug;
  roomName: RoomName;
}) {
  const { scans } = useProperty();
  const roomScans = scans.filter((scan) => scan.room === room);
  const findings = findingsForRoom(scans, room);
  const cost = costRangeFor(findings);
  const costLabel = cost ? formatCadRange(cost.min, cost.max) : null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/home" className="hover:underline">
            My Home
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{roomName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {issueCountLabel(findings.length)}
        </p>
      </div>

      <Disclaimer />

      <Button asChild className="w-fit rounded-sm">
        <Link href={"/rooms/" + room + "/scan"}>
          <Video />
          Scan this area
        </Link>
      </Button>

      {costLabel ? (
        <p className="text-sm text-muted-foreground">
          Estimated repair range for this room: {costLabel}. Image-based
          estimate only.
        </p>
      ) : null}

      {roomScans.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No scans yet. Walk this area and capture frames.
        </p>
      ) : (
        <ul className="space-y-8">
          {roomScans.map((scan) => (
            <li key={scan.id} className="space-y-4">
              <p className="text-xs text-muted-foreground">
                {new Date(scan.createdAt).toLocaleString()}
              </p>
              <ul className="grid grid-cols-4 gap-2">
                {scan.frames.map((src, index) => (
                  <li key={src.slice(0, 32) + index}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={"Scan frame " + (index + 1)}
                      className="h-20 w-full rounded-sm object-cover ring-1 ring-foreground/10"
                    />
                  </li>
                ))}
              </ul>
              {scan.findings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No issues stood out in this scan.
                </p>
              ) : (
                <ul className="space-y-3">
                  {scan.findings.map((finding) => (
                    <li key={finding.id}>
                      <FindingCard finding={finding} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
