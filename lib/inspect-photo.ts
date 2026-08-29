import { GoogleGenAI, Type } from "@google/genai";
import {
  isRoomSlug,
  parseFindings,
  type Finding,
  type RoomSlug,
} from "@/lib/inspection";

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_PHOTOS = 8;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const findingsSchema = {
  type: Type.OBJECT,
  properties: {
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: [
              "cracks",
              "water-stains",
              "mold-like-discoloration",
              "peeling-paint",
              "wood-deterioration",
              "damaged-siding",
              "damaged-railing",
              "missing-caulking",
              "roof-damage",
              "other",
            ],
          },
          priority: {
            type: Type.STRING,
            enum: ["critical", "high", "medium", "low"],
          },
          priorityReason: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          whatToDo: { type: Type.STRING },
          frameIndex: { type: Type.INTEGER },
          estimatedCostMinCad: { type: Type.INTEGER },
          estimatedCostMaxCad: { type: Type.INTEGER },
        },
        required: [
          "id",
          "title",
          "category",
          "priority",
          "priorityReason",
          "confidence",
          "summary",
          "whatToDo",
          "frameIndex",
          "estimatedCostMinCad",
          "estimatedCostMaxCad",
        ],
      },
    },
  },
  required: ["findings"],
};

export class InspectError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export function parseRoom(value: FormDataEntryValue | null): RoomSlug {
  if (typeof value !== "string" || !isRoomSlug(value)) {
    throw new InspectError("Choose a room first.", 400);
  }
  return value;
}

export async function inspectPhotos(
  photos: Blob[],
  room: RoomSlug
): Promise<Finding[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new InspectError("Inspection is not configured.", 500);
  }
  if (photos.length === 0) {
    throw new InspectError("Add at least one frame.", 400);
  }
  if (photos.length > MAX_PHOTOS) {
    throw new InspectError("Use at most 8 frames per scan.", 400);
  }

  const imageParts = [];
  for (const photo of photos) {
    const mimeType = photo.type || "image/jpeg";
    if (!ALLOWED_TYPES.has(mimeType)) {
      throw new InspectError("Use JPG, PNG, or WebP frames.", 400);
    }
    if (photo.size > MAX_BYTES) {
      throw new InspectError("A frame is too large. Try scanning again.", 400);
    }
    imageParts.push({
      inlineData: {
        mimeType,
        data: Buffer.from(await photo.arrayBuffer()).toString("base64"),
      },
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        role: "user",
        parts: [
          ...imageParts,
          {
            text:
              "You are a cautious home-maintenance assistant, not a licensed inspector. " +
              "The homeowner is walking through this room: " +
              room +
              ". Images are numbered from frame 0. " +
              "Look for cracks, water stains, mold-like discoloration, peeling paint, wood deterioration, damaged siding, loose or damaged railing, missing caulking, and roof damage. " +
              "Report only what is actually visible. Do not invent damage. If nothing concerning is visible, return an empty findings array. " +
              "Do not sound certain. Titles must start with Possible, such as Possible water damage. " +
              "confidence is 20-95 and must reflect uncertainty. " +
              "priority: critical = safety or active leak, high = likely structural or safety concern, medium = maintenance, low = cosmetic. " +
              "priorityReason is a short phrase such as Safety risk or Maintenance. " +
              "frameIndex is the 0-based frame where the issue is most visible. " +
              "estimatedCostMinCad and estimatedCostMaxCad are rough Canadian-dollar ranges from typical contractor categories, or 0 if you cannot estimate. " +
              "This is an AI visual assessment only and does not replace a professional home inspection.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: findingsSchema,
    },
  });

  const text = response.text;
  if (!text) return [];

  try {
    return parseFindings(JSON.parse(text)).slice(0, 15);
  } catch {
    console.error("Failed to parse findings", text);
    return [];
  }
}
