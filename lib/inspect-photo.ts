import { GoogleGenAI, Type } from "@google/genai";
import {
  isArea,
  parseFindings,
  type Area,
  type Finding,
} from "@/lib/inspection";

const MAX_BYTES = 8 * 1024 * 1024;
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
          severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
          summary: { type: Type.STRING },
          whatToDo: { type: Type.STRING },
        },
        required: ["id", "title", "severity", "summary", "whatToDo"],
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

export function parseArea(value: FormDataEntryValue | null): Area {
  if (typeof value !== "string" || !isArea(value)) {
    throw new InspectError("Choose an area first.", 400);
  }
  return value;
}

export async function inspectPhoto(
  photo: Blob,
  area: Area
): Promise<Finding[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new InspectError("Inspection is not configured.", 500);
  }

  const mimeType = photo.type || "image/jpeg";
  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new InspectError("Use a JPG, PNG, or WebP photo.", 400);
  }
  if (photo.size > MAX_BYTES) {
    throw new InspectError("That photo is too large. Try a smaller image.", 400);
  }

  const ai = new GoogleGenAI({ apiKey });
  const imageData = Buffer.from(await photo.arrayBuffer()).toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: imageData } },
          {
            text: `You are a cautious home-maintenance assistant, not a licensed inspector.
Look at the photo. The homeowner labeled this photo as: ${area}.
Report only issues that are actually visible. Do not invent damage or guess behind surfaces.
If nothing concerning is visible, return an empty findings array.
Each finding needs:
- a short kebab-case id
- a concise title
- severity high|medium|low
- summary: 1-2 sentences describing what is visible
- whatToDo: one concrete next step the homeowner can take
This is not a professional inspection or a safety certification.`,
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
    return parseFindings(JSON.parse(text)).slice(0, 8);
  } catch {
    return [];
  }
}
