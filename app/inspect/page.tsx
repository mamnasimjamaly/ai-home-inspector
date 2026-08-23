import type { Metadata } from "next";
import { InspectForm } from "@/components/inspect-form";

export const metadata: Metadata = {
  title: "Inspect | AI Home Inspector",
  description:
    "Upload a photo of your home and identify potential maintenance and repair issues.",
};

export default function InspectPage() {
  return <InspectForm />;
}
