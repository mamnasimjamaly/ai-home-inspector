import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScanArea } from "@/components/scan-area";
import { roomBySlug } from "@/lib/inspection";

export const metadata: Metadata = {
  title: "Scan area | AI Home Inspector",
};

export default async function ScanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = roomBySlug(slug);
  if (!room) notFound();
  return <ScanArea room={room.slug} roomName={room.name} />;
}
