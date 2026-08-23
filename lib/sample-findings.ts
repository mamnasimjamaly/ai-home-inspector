export const AREAS = ["Deck", "Walls", "Roof", "Exterior", "Yard"] as const

export type Area = (typeof AREAS)[number]
export type Severity = "high" | "medium" | "low"

export type Finding = {
  id: string
  title: string
  severity: Severity
  summary: string
}

const GENERAL: Finding[] = [
  {
    id: "general-moisture",
    title: "Possible moisture staining",
    severity: "medium",
    summary:
      "Discoloration in the photo can mean water intrusion. Check the area after rain and look for soft material nearby.",
  },
  {
    id: "general-wear",
    title: "Surface wear",
    severity: "low",
    summary:
      "Finish looks worn. Recoating soon is cheaper than replacing damaged material later.",
  },
]

const BY_AREA: Record<Area, Finding[]> = {
  Deck: [
    {
      id: "deck-boards",
      title: "Boards may be loose or decaying",
      severity: "high",
      summary:
        "Gaps, cupping, or dark spots often mean rot. Probe suspect boards and replace any that feel soft.",
    },
    {
      id: "deck-fasteners",
      title: "Fasteners look weathered",
      severity: "medium",
      summary:
        "Rusted or popped nails/screws can let the deck flex. Swap them for exterior-rated fasteners.",
    },
  ],
  Walls: [
    {
      id: "walls-cracks",
      title: "Cracks in siding or stucco",
      severity: "medium",
      summary:
        "Hairline cracks can let water behind the wall. Seal them and watch whether they widen over a season.",
    },
    {
      id: "walls-paint",
      title: "Peeling paint or bubbling",
      severity: "low",
      summary:
        "This often points to moisture or a failed coating. Scrape, dry, then repaint with an exterior primer.",
    },
  ],
  Roof: [
    {
      id: "roof-shingles",
      title: "Shingles look curled or missing",
      severity: "high",
      summary:
        "Exposed underlayment can leak quickly. Have a roofer inspect before the next storm.",
    },
    {
      id: "roof-granules",
      title: "Granule loss",
      severity: "medium",
      summary:
        "Bald patches mean the shingles are aging. Budget for replacement and keep gutters clear of granules.",
    },
  ],
  Exterior: [
    {
      id: "exterior-grade",
      title: "Water may be draining toward the house",
      severity: "high",
      summary:
        "Soil or hardscape that slopes inward can wet the foundation. Regrade so water flows away.",
    },
    {
      id: "exterior-caulk",
      title: "Failed caulk at joints",
      severity: "medium",
      summary:
        "Open seams around trim, windows, or vents are common leak paths. Cut out old caulk and reseal.",
    },
  ],
  Yard: [
    {
      id: "yard-trees",
      title: "Limbs close to the structure",
      severity: "medium",
      summary:
        "Branches can scrape siding and drop debris on the roof. Trim back several feet from the house.",
    },
    {
      id: "yard-drainage",
      title: "Standing water or poor drainage",
      severity: "high",
      summary:
        "Puddles near the foundation stay wet after rain. Add drainage or regrade the low spots.",
    },
  ],
}

export function findingsFor(area: Area | null): Finding[] {
  return area ? BY_AREA[area] : GENERAL
}
