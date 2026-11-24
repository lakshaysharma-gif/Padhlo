import { createFileRoute } from "@tanstack/react-router";
import { StudyMateDashboard } from "@/components/studymate/StudyMateDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Padhlo AI | A Smarter Study Planner" },
      {
        name: "description",
        content:
          "Plan study time around your subjects, preparation progress, exam dates, and weekly availability.",
      },
      { property: "og:title", content: "Padhlo AI | A Smarter Study Planner" },
      {
        property: "og:description",
        content:
          "Plan study time around your subjects, preparation progress, exam dates, and weekly availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <StudyMateDashboard />;
}
