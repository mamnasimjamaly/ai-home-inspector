import { useSyncExternalStore } from "react";
import { PRIORITY_ORDER, sortFindings, type Finding, type RoomSlug, type Scan } from "@/lib/inspection";

const STORAGE_KEY = "ahi-property-v1";
const EMPTY: { scans: Scan[] } = { scans: [] };

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function readState(): { scans: Scan[] } {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as { scans?: Scan[] };
    if (!Array.isArray(parsed.scans)) return EMPTY;
    return { scans: parsed.scans };
  } catch {
    return EMPTY;
  }
}

function writeState(next: { scans: Scan[] }) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function addScan(scan: Scan) {
  const current = readState();
  writeState({ scans: [scan, ...current.scans] });
}

export function removeScan(id: string) {
  const current = readState();
  writeState({ scans: current.scans.filter((scan) => scan.id !== id) });
}

export function useProperty() {
  return useSyncExternalStore(subscribe, readState, () => EMPTY);
}

export function findingsForRoom(scans: Scan[], room: RoomSlug): Finding[] {
  return sortFindings(
    scans.filter((scan) => scan.room === room).flatMap((scan) => scan.findings)
  );
}

export function allFindings(scans: Scan[]): Array<Finding & { room: RoomSlug }> {
  return scans
    .flatMap((scan) =>
      scan.findings.map((finding) => ({ ...finding, room: scan.room }))
    )
    .sort((a, b) => {
      const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (byPriority !== 0) return byPriority;
      return b.confidence - a.confidence;
    });
}

export function costRangeFor(findings: Finding[]) {
  const priced = findings.filter(
    (finding) => finding.estimatedCostMinCad > 0 || finding.estimatedCostMaxCad > 0
  );
  if (priced.length === 0) return null;
  return {
    min: priced.reduce((sum, finding) => sum + finding.estimatedCostMinCad, 0),
    max: priced.reduce((sum, finding) => sum + finding.estimatedCostMaxCad, 0),
  };
}
