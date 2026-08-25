export const AREAS = ["Deck", "Walls", "Roof", "Exterior", "Yard"] as const

export type Area = (typeof AREAS)[number]
export type Severity = "high" | "medium" | "low"

export type Finding = {
  id: string
  title: string
  severity: Severity
  summary: string
  whatToDo: string
}

const SEVERITIES = new Set<Severity>(["high", "medium", "low"])
const SEVERITY_ORDER: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export function isArea(value: string): value is Area {
  return (AREAS as readonly string[]).includes(value)
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  )
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
    const severity = finding.severity
    if (
      typeof finding.title !== "string" ||
      typeof finding.summary !== "string" ||
      typeof severity !== "string" ||
      !SEVERITIES.has(severity as Severity)
    ) {
      return []
    }

    const whatToDo =
      typeof finding.whatToDo === "string" && finding.whatToDo.trim().length > 0
        ? finding.whatToDo.trim()
        : "Take a closer look in person, and call a licensed pro if it looks worse."

    return [
      {
        id:
          typeof finding.id === "string" && finding.id.length > 0
            ? finding.id
            : `finding-${index + 1}`,
        title: finding.title.trim(),
        severity: severity as Severity,
        summary: finding.summary.trim(),
        whatToDo,
      },
    ]
  })

  return sortFindings(parsed)
}
