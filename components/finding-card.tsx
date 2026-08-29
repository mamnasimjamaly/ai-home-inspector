import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCadRange, type Finding, type Priority } from "@/lib/inspection";

const priorityStyle: Record<
  Priority,
  { variant: "destructive" | "secondary" | "outline" }
> = {
  critical: { variant: "destructive" },
  high: { variant: "destructive" },
  medium: { variant: "secondary" },
  low: { variant: "outline" },
};

export function FindingCard({
  finding,
  rank,
}: {
  finding: Finding;
  rank?: number;
}) {
  const style = priorityStyle[finding.priority];
  const cost = formatCadRange(
    finding.estimatedCostMinCad,
    finding.estimatedCostMaxCad
  );

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-3">
          <span>
            {rank ? rank + ". " : ""}
            {finding.title}
          </span>
          <Badge variant={style.variant}>{finding.priority}</Badge>
        </CardTitle>
        <CardDescription>{finding.summary}</CardDescription>
      </CardHeader>
      <CardContent className="gap-2">
        <p className="text-sm">
          Confidence: {finding.confidence}%
        </p>
        <p className="text-sm text-muted-foreground">{finding.priorityReason}</p>
        <p className="text-sm">
          <span className="font-medium">What to do: </span>
          {finding.whatToDo}
        </p>
        {cost ? (
          <p className="text-sm text-muted-foreground">
            Estimated repair range: {cost}. Image-based estimate only.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
