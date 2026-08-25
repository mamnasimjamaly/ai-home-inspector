import { InspectError, inspectPhoto, parseArea } from "@/lib/inspect-photo";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo");

    if (!(photo instanceof Blob) || photo.size === 0) {
      return Response.json({ error: "Add a photo first." }, { status: 400 });
    }

    const findings = await inspectPhoto(photo, parseArea(formData.get("area")));
    return Response.json({ findings });
  } catch (error) {
    if (error instanceof InspectError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("Inspection failed", error);
    return Response.json(
      { error: "Could not inspect that photo. Try another one." },
      { status: 502 }
    );
  }
}
