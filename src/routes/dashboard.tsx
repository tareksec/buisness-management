import { createFileRoute } from "@tanstack/react-router";
import { StubScreen } from "@/components/StubScreen";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Business Command" },
      { name: "description", content: "Dashboard for your business — owner preview." },
      { property: "og:title", content: "Dashboard · Business Command" },
      { property: "og:description", content: "Dashboard for your business — owner preview." },
    ],
  }),
  component: () => <StubScreen titleKey="dashboard" />,
});
