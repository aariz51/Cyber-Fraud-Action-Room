import type { Metadata } from "next";
import { ActionRoomNav } from "@/components/ActionRoomNav";

export const metadata: Metadata = {
  title: "Action Room",
  description:
    "A private, guided cyber-fraud response workspace for triage, evidence, complaints, and recovery tracking.",
};

export default function ActionRoomLayout({ children }: { children: React.ReactNode }) {
  return <ActionRoomNav>{children}</ActionRoomNav>;
}
