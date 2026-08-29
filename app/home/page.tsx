import type { Metadata } from "next";
import { PropertyDashboard } from "@/components/property-dashboard";

export const metadata: Metadata = {
  title: "My Home | AI Home Inspector",
};

export default function HomeDashboardPage() {
  return <PropertyDashboard />;
}
