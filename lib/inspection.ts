export const ROOMS = [
  { slug: "exterior", name: "Exterior" },
  { slug: "living-room", name: "Living Room" },
  { slug: "kitchen", name: "Kitchen" },
  { slug: "bathroom", name: "Bathroom" },
  { slug: "bedroom", name: "Bedroom" },
  { slug: "backyard", name: "Backyard" },
] as const

export type RoomSlug = (typeof ROOMS)[number]["slug"]
export type RoomName = (typeof ROOMS)[number]["name"]

export const ISSUE_CATEGORIES = [
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
] as const

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number]
export type Priority = "critical" | "high" | "medium" | "low"

export type Finding = {
  id: string
  title: string
  category: IssueCategory
  priority: Priority
  priorityReason: string
  confidence: number
  summary: string
  whatToDo: string
  frameIndex: number
  estimatedCostMinCad: number
  estimatedCostMaxCad: number
}

export type Scan = {
  id: string
  room: RoomSlug
  createdAt: string
  frames: string[]
  findings: Finding[]
}

const PRIORITIES = new Set<Priority>(["critical", "high", "medium", "low"])
const CATEGORIES = new Set<IssueCategory>(ISSUE_CATEGORIES)
export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function isRoomSlug(value: string): value is RoomSlug {
  return ROOMS.some((room) => room.slug === value)
}

export function roomBySlug(slug: string) {
  return ROOMS.find((room) => room.slug === slug) ?? null
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (byPriority !== 0) return byPriority
    return b.confidence - a.confidence
  })
}

function clampConfidence(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(number)) return 50
  return Math.round(Math.min(95, Math.max(20, number)))
}

function asCost(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(number) || number < 0) return 0
  return Math.round(number)
}

export function parseFindings(value: unknown): Finding[] {
  if (!value || typeof value !== "object" || !("findings" in value)) {
    return []
  }

  const findings = (value as { findings: unknown }).findings
  if (!Array.isArray(findings)) return []

  const parsed = findings.flatMap((item, index) => {
    if (!item || typeof item !== "object") return []
    const finding = item as Record<string, unknown>
    const priority = finding.priority
    if (
      typeof finding.title !== "string" ||
      typeof finding.summary !== "string" ||
      typeof priority !== "string" ||
      !PRIORITIES.has(priority as Priority)
    ) {
      return []
    }

    const category =
      typeof finding.category === "string" &&
      CATEGORIES.has(finding.category as IssueCategory)
        ? (finding.category as IssueCategory)
        : "other"

    const whatToDo =
      typeof finding.whatToDo === "string" && finding.whatToDo.trim().length > 0
        ? finding.whatToDo.trim()
        : "Take a closer look in person, and call a licensed pro if it looks worse."

    const priorityReason =
      typeof finding.priorityReason === "string" &&
      finding.priorityReason.trim().length > 0
        ? finding.priorityReason.trim()
        : "Needs a closer look"

    const frameIndex = Number(finding.frameIndex)
    const min = asCost(finding.estimatedCostMinCad)
    const max = asCost(finding.estimatedCostMaxCad)

    return [
      {
        id:
          typeof finding.id === "string" && finding.id.length > 0
            ? finding.id
            : "finding-" + (index + 1),
        title: finding.title.trim(),
        category,
        priority: priority as Priority,
        priorityReason,
        confidence: clampConfidence(finding.confidence),
        summary: finding.summary.trim(),
        whatToDo,
        frameIndex: Number.isInteger(frameIndex) && frameIndex >= 0 ? frameIndex : 0,
        estimatedCostMinCad: min,
        estimatedCostMaxCad: Math.max(min, max),
      },
    ]
  })

  return sortFindings(parsed)
}

export function formatCadRange(min: number, max: number): string | null {
  if (min <= 0 && max <= 0) return null
  const low = Math.min(min, max || min)
  const high = Math.max(min, max)
  return "$" + low.toLocaleString("en-CA") + "–$" + high.toLocaleString("en-CA") + " CAD"
}

export function issueCountLabel(count: number): string {
  if (count === 0) return "No issues"
  if (count === 1) return "1 issue"
  return count + " issues"
}
