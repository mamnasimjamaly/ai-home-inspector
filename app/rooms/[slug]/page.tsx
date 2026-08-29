import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomDetail } from "@/components/room-detail";
import { roomBySlug } from "@/lib/inspection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = roomBySlug(slug);
  return { title: (room?.name ?? "Room") + " | AI Home Inspector" };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = roomBySlug(slug);
  if (!room) notFound();
  return <RoomDetail room={room.slug} roomName={room.name} />;
}
