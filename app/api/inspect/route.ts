import { InspectError, inspectPhotos, parseRoom } from "@/lib/inspect-photo";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photos = formData
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (photos.length === 0) {
      return Response.json({ error: "Add at least one frame." }, { status: 400 });
    }

    const findings = await inspectPhotos(photos, parseRoom(formData.get("room")));
    return Response.json({ findings });
  } catch (error) {
    if (error instanceof InspectError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("Inspection failed", error);
    return Response.json(
      { error: "Could not inspect those frames. Try another scan." },
      { status: 502 }
    );
  }
}
